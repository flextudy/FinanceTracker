import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const expenses = await prisma.expense.findMany({
            include:{
                paidBy:true,
                splits:{
                    include:{
                        user:true
                    }
                }
            },
            orderBy:{
                createdAt:"desc"
            }
        })

        return NextResponse.json(expenses);
    }
    catch(error){
        console.log(error);
        return NextResponse.json(
            {error:"failed to fetch expenses"},
            {
                status:500
            }
        )
    }
}