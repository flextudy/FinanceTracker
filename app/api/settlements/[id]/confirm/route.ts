import { SettlementStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
   try{
       const {id:settlementId} = await params;
       const body = await request.json();
        const {userId} = body;
        if(!userId){
            return NextResponse.json({error:"User Id is Required!"},{status:400});
        }
        const settlement = await prisma.settlement.findUnique({
            where:{
                id:settlementId,
            }
        })

        if(!settlement){
            return NextResponse.json(
                {error:"Settlement not found"},
                {status:404}
            )
        }
        if(settlement.toUserId!==userId){
            return NextResponse.json({
                error:"You are not authorized to confirm this settlement!",
            },{status:400})
        }

        const updatedSettlement = await prisma.settlement.update({
            where:{
                id:settlementId
            },
            data:{
                status:SettlementStatus.COMPLETED,
                settledAt:new Date()
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
                },
                attachments:true
            }
        });
        return NextResponse.json({message:"Settlement confirmed successfully",updatedSettlement})
   }
   catch(error){
    console.log(error);
    return NextResponse.json({error:"Failed to confirm settlement"},{status:500})
   }
}