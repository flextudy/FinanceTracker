import { SettlementStatus } from "@/app/generated/prisma/enums";
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

        const settlements = await prisma.settlement.findMany({
            where:{
                status:SettlementStatus.COMPLETED
            }
        })

        const balance = users.map((user)=>{
            let totalPaid = 0;
            let totalShare = 0;
            let moneySpent = 0;
            let moneyReceived = 0;

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
            }
                for(const settlement of settlements){
                    if(settlement.fromUserId===user.id){
                        moneySpent+=settlement.amountPaid
                    }

                    if(settlement.toUserId === user.id){
                        moneyReceived+=settlement.amountPaid
                    }

                }

            
            const balance = totalPaid - totalShare + moneySpent-moneyReceived;
            return {
                userId:user.id,
                name:user.name,
                totalPaid,
                totalShare,
                moneySpent,
                moneyReceived,
                balance
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