import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const users = await prisma.user.findMany({
            orderBy:{
                createdAt:"asc"
            }
        });

        const expenses = await prisma.expense.findMany({
            include:{
                splits:true
            }
        })

        const balance = users.map((user)=>{
            let totalPaid = 0;
            let totalShare = 0;

            for(const expense of expenses){
                if(expense.paidById === user.id){
                    totalPaid += expense.amountPaid;
                }

                const split = expense.splits.find(
                    (split) => split.userId === user.id
                );

                if(split){
                    totalShare += split.amountPaid;
                }

                const balance = totalPaid - totalShare;
                return {
                    userId:user.id,
                    name:user.name,
                    totalPaid,
                    totalShare,
                    balance
                }
            }
        })

        const totalSpent = expenses.reduce(
            (total,expense) => total + expense.amountPaid,0
        );

        return NextResponse.json({
            totalSpent,
            balance

        })
    }
    catch(error){
        console.log(error);
        return NextResponse.json(
            {error:"Failed to calculate Summary"},
            {
                status:500
            }
        )
    }
}