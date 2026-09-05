import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

async function main(){
    const passwordHash = await bcrypt.hash("ChangeMe123",12)

    const partners = [
        {
            name:"Aditya Sharma",
            email:"adityas20032005@gmail.com"
        },
        {
            name:"Vishal Kumar Singh",
            email:"2k03vishal@gmail.com"
        },
        {
            name:"Ujjual Kumar Singh",
            email:"flextudy6@gmail.com"
        }
    ]

    for(const partner of partners){
        await prisma.user.upsert({
            where:{
                email: partner.email
            },
            update:{},
            create:{
                name: partner.name,
                email: partner.email,
                passwordHash,
            }
        })
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })