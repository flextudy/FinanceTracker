import { SettlementStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const settlements = await prisma.settlement.findMany({
          include:{
            fromUser:{
                select:{
                    id:true,
                    name:true
                }
            },
            toUser:{
                select:{
                    id:true,
                    name:true
                }
            },
            attachments:true,
          },
          orderBy:{
            settledAt:"desc"
          }
        })
        return NextResponse.json(settlements)
    }
    catch(error){
        console.log(error);
        return NextResponse.json({
            error:"Failed to fetch settlements"
        },{
            status:500
        })
    }
}

export async function POST(request:Request){
    try{
        const body = await request.json();

        const {fromUserId,toUserId,amount} = body;

        if(!fromUserId || !toUserId || typeof amount !== "number" || amount <= 0){
            return NextResponse.json(
                {error:"Invalid Settlement Data"},
                {
                    status:400
                }
            )
        }

        if(fromUserId === toUserId){
            return NextResponse.json(
                {error:"A user cannot settle with themselves"},
                {
                    status:400
                }
            )
        }

        const amountPaid = Math.round(amount);
        const users = await prisma.user.findMany({
            where:{
                id:{
                    in:[fromUserId,toUserId]
                }
            }
        })

        if(users.length !== 2){
            return NextResponse.json(
                {error:"Invalid Users"},
                {
                    status:404
                }
            )
        }

        const settlement = await prisma.settlement.create({
            data:{
                fromUserId,
                toUserId,
                amountPaid,
                status: SettlementStatus.COMPLETED,
                settledAt:new Date(),
            },
            include:{
                fromUser:{
                    select:{
                        id:true,
                        name:true
                    }
                },
                toUser:{
                    select:{
                        id:true,
                        name:true
                    }
                }
            }
        })

        return NextResponse.json({
            settlement
        })

        
    }
    catch(error){
        console.log(error);
        return NextResponse.json(
            {error:"Failed to create settlement"},
            {
                status:500
            }
        )
    }
}