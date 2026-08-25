import { run } from "node-telegram-bot-api/node";
import {bot} from "../telegram"
import {prisma} from "../prisma";


bot.command("start",async (ctx)=>{

    const telegramUserID = String(ctx.from?.id);

    if(!telegramUserID){
        return ctx.reply("Something went Wrong!")
    }

    const user = await prisma.user.findUnique({
        where:{
            telegramUserID
        }
    })

    if(user){
        await ctx.reply(`👋 Welcome Back ${user.name}!`)
        return;
    }else{
        await ctx.reply(`👋 Welcome to the Finance Tracker Bot! 
            
            To get Started Please Link Your Account
            `)    
        return;
    }

})

run(bot);