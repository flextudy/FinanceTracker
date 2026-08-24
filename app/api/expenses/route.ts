import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const expenses = await prisma.expense.findMany({
            include:{
                paidBy:{
                    select:{
                        id:true,
                        name:true,
                        email:true
                    }
                },
                splits:{
                    include:{
                        user:{
                            select:{
                                id:true,
                                name:true,
                                email:true
                            }
                        }
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

export async function POST(request:Request){
    try{
        const body = await request.json();
        const {amountPaid,transactionId,description,category,paidById} = body;
        
        if(typeof amountPaid !== "number" || amountPaid <= 0 || !transactionId || !description || !paidById){
            return NextResponse.json(
                {error:"Invalid Expense Data"},
                {status:400}
            )
        }

        const partners = await prisma.user.findMany({
            orderBy:{
                createdAt:"asc"
            }
        })

        if(partners.length!==3){
            return NextResponse.json(
                {error:"there should be 3 partners"},
                {status:400}
            )
        }

        const payer = partners.find((p)=> p.id === paidById);

        if(!payer){
            return NextResponse.json(
                {error:"Invalid PaidById"},
                {status:400}
            )
        }

        const baseShare = Math.floor(amountPaid/3);
        const remainder = amountPaid % 3;
        
        const splits = partners.map((partner,index) => ({
            userId:partner.id,
            amountPaid:baseShare + (index < remainder ? 1:0)
        }));
        
        const expense = await prisma.expense.create({
            data:{
                amountPaid,
                transactionId,
                description,
                category:category || null,
                paidById,
                splits:{
                    create:splits
                }
            },

            include:{
                paidBy:{
                    select:{
                        id:true,
                        name:true
                    }
                },
                splits:{
                    include:{
                        user:{
                            select:{
                                id:true,
                                name:true
                            }
                        }
                    }
                }
            }
        })
        return NextResponse.json(expense);

    }
    catch(error){
        console.log(error);
    }
    return NextResponse.json(
        {error:"Failed to create Expense"},
        {
            status:500
        }
    )
}