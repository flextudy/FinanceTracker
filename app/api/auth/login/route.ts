import { createJWT } from "@/lib/auth";
import {prisma} from "@/lib/prisma"
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request:Request){
    try{
        const body = await request.json();
        const {email,password} = body;
        if(!email || !password){
            return NextResponse.json({error:"Email and password are required"},{status:400})
        }

        const user = await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(!user || !(await bcrypt.compare(password,user.passwordHash))){
            return NextResponse.json({error:"Invalid Credentials"},{status:401})
        }

        const token = await createJWT({
            userId:user.id,
            email:user.email,
            name:user.name
        });

        const response = NextResponse.json({
            message:"Login Successfull",
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            }
        })
        response.cookies.set({
            name: "session",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });
        return response;
    }
    catch(error){
        console.log(error);
        return NextResponse.json(
            {error:"Failed to login"},
            {
                status:500
            }
        )
    }
}