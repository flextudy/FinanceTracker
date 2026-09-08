import { SettlementStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
    try{
        const {id:settlementId} = await params;
        const body = await request.json();
        const {userId} = body;
        if(!userId){
            NextResponse.json({
                error:"userId is required!",
            },{
                status:400
            })
        }
        const settlement = await prisma.settlement.findUnique({
            where:{
                id:settlementId,
            }
        })

        if(!settlement){
            return NextResponse.json({
                error:"Settlement not found",
            },{
                status:404
            })
        }

        if(settlement.toUserId!==userId){
            return NextResponse.json({
                error:"You are not authorized to reject this settlement!",
            },{
                status:400
            })
        }

        if(settlement.status !== SettlementStatus.PENDING){
            return NextResponse.json({
                error:"Settlement is not in pending status!"
            },{
                status:400
            })
        }

        const updatedSettlement = await prisma.settlement.update({
            where:{
                id:settlementId
            },
            data:{
                status:SettlementStatus.CANCELLED
            },
            include:{
                fromUser:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                toUser:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                attachments:true
            }
        })
        
        return NextResponse.json({
            message:"Settlement rejected successfully",
            settlement:updatedSettlement
        })

    }
    catch(error){
        console.log(error);
        return NextResponse.json({
            error:"Failed to reject settlement"
        },{
            status:500
        })
    }

}