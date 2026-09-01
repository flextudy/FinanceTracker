import {prisma} from "@/lib/prisma"
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(request:Request){
    try{
        const {token,password} = await request.json();
        if(!token || !password){
            return NextResponse.json(
                {
                    error:"Token and password are required"
                },
                {
                    status:400
                }
            )
        }
         if (password.length < 8) {
            return NextResponse.json(
                {
                    error: "Password must be at least 8 characters long",
                },
                {
                    status: 400,
                }
            );
        }

        const hashToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await prisma.user.findFirst({
            where:{
                resetToken: hashToken,
                resetTokenExpiry:{
                    gt:new Date()
                }
            }
        });

        if(!user){
            return NextResponse.json(
                {
                    error:"Invalid or expired reset link"
                },
                {
                    status:400
                }
            )
        }

        const hashPassword = await bcrypt.hash(password,12);

        await prisma.user.update({
            where:{
                id:user.id
            },
            data:{
                passwordHash:hashPassword,
                resetToken:null,
                resetTokenExpiry:null
            }
        })

        return NextResponse.json(
            {
                message: "Password reset successful. You can now login.",
            },
            {
                status: 200,
            }
        );
    }
    catch(error){
        console.log(error);
        return NextResponse.json(
            {
                error: "Failed to reset password"
            },
            {
                status:500
            }
        )
    }

}
