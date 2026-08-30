import { run } from "node-telegram-bot-api/node";
import { bot } from "../telegram"
import { prisma } from "../prisma";
import { expenseStates } from "./state";
import { api } from "../api";


bot.command("start", async (ctx) => {

    const telegramUserID = String(ctx.from?.id);

    if (!telegramUserID) {
        return ctx.reply("Something went Wrong!")
    }

    const user = await prisma.user.findUnique({
        where: {
            telegramUserID
        }
    })

    if (user) {
        await ctx.reply(`👋 Welcome Back ${user.name}!`)
    } else {
        await ctx.reply(`👋 Welcome to Partner Finance Tracker Bot!

❌ Your Telegram account is not linked. To get started, please create an account:`)
    }

});

bot.command("add", async (ctx) => {
    const telegramUserID = String(ctx.from?.id);
    const user = await prisma.user.findUnique({
        where: {
            telegramUserID
        }
    })

    if (!user) {
        await ctx.reply("❌ Your Telegram account is not linked.");
        return;
    }

    expenseStates.set(ctx.from?.id!, {
        step: "amount",
    })
    await ctx.reply("💰 How much did you spend?");
})

bot.command("balance", async (ctx) => {
    const telegramUserID = String(ctx.from?.id);
    const user = await prisma.user.findUnique({
        where: {
            telegramUserID
        },
    })
    if (!user) {
        await ctx.reply("❌ Your Telegram account is not linked.")
        return;
    }

    const response = await api.get("api/summary");
    const balances = response.data.balance
    const message = balances.map((person: any) => {
        if (person.balance > 0) {
            return `🟢 ${person.name}: receives ₹${person.balance}`;
        }

        if (person.balance < 0) {
            return `🔴 ${person.name}: owes ₹${Math.abs(person.balance)}`;
        }

        return `🟢🟡⚪  ${person.name}: settled!`;

    }).join("\n")

    await ctx.reply(`💰 Current Balance\n\n${message}`)
})

bot.command("settle", async (ctx) => {
    const telegramUserID = String(ctx.from?.id);
    const user = await prisma.user.findUnique({
        where: {
            telegramUserID
        }
    });

    if (!user) {
        await ctx.reply("❌ Your Telegram account is not linked.");
        return;
    }

    const partners = await prisma.user.findMany({
        where: {
            id: {
                not: user.id
            }
        },
        orderBy: {
            createdAt: "asc"
        }
    })

    if (partners.length === 0) {
        await ctx.reply("❌ No partners found.")
    }
    const buttons = partners.map((partner) => [{
        text: partner.name,
        callback_data: `settle_to:${partner.id}`
    }]);

    await ctx.reply("💰 Who did you settle up with?", {
        reply_markup: {
            inline_keyboard: buttons,
        }
    })




})

bot.command("expenses",async(ctx)=>{
    const telegramUserID = String(ctx.from?.id);
    const user = await prisma.user.findUnique({
        where:{
            telegramUserID
        }
    })
    if(!user){
        await ctx.reply("❌ Your Telegram account is not linked.");
        return;
    }
    try{

    
    const response = await api.get("/api/expenses");
    const expenses = response.data;
    if(expenses.length===0){
        await ctx.reply("📭 No expenses found.");
        return;
    }

    const recentExpense = expenses.slice(0,10);
    const message = recentExpense.map((expense:any,index:number)=>{
    const date = new Date(expense.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                });
    return `${index + 1}. 💰 ₹${expense.amountPaid}
📝 ${expense.description}
👤 Paid by: ${expense.paidBy.name}
📅 ${date}`;
            })
            .join("\n\n");

        await ctx.reply(
            `📋 Recent Expenses\n\n${message}`
        );
    
    } catch(error){
        console.log(error);
        await ctx.reply("❌ Failed to fetch expenses.");
    }

});

bot.command("settlements",async(ctx)=>{
    const telegramUserID = String(ctx.from?.id);
    const user = await prisma.user.findUnique({
        where:{
            telegramUserID
        }
    });

    if(!user){
        await ctx.reply("❌ Your Telegram account is not linked.");
        return;
    }

    try{
        const response = await api.get("/api/settlements");
        const settlements = response.data;
        if(!settlements || settlements.length===0){
            await ctx.reply("No settlements found.");
            return;

        }
        const recentSettlements =
            settlements.slice(0, 10);

        const message = recentSettlements
            .map(
                (
                    settlement: any,
                    index: number
                ) => {
                    const date = new Date(
                        settlement.settledAt
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        }
                    );

                    return `${index + 1}. 💸 ₹${settlement.amountPaid}
👤 ${settlement.fromUser.name} → ${settlement.toUser.name}
📅 ${date}`;
                }
            )
            .join("\n\n");

        await ctx.reply(
            `💸 Recent Settlements\n\n${message}`
        );

    } catch (error) {
        console.error(error);

        await ctx.reply(
            "❌ Failed to fetch settlements."
        );
    }
        
        
        
    

})

bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if(!data) return;
    const match = data.match(/^settle_to:(.+)$/);
    if(!match) return;
    const toUserID = match[1];
    if(match){
        const toUserId = match[1];
        expenseStates.set(ctx.from?.id!,{
            step:"settleAmount",
            toUserId
        })
    }

    await ctx.answerCallbackQuery();
    const partner = await prisma.user.findUnique({
        where:{
            id:toUserID
        },
        select:{
            name:true
        }
    })

    if(!partner){
        await ctx.reply("❌ Partner not found.");
        expenseStates.delete(ctx.from?.id!);
        return;
    }

    await ctx.reply(
        `💸 You selected: ${partner.name}

💰 How much did you pay?`
    );
})
bot.on("message", async (ctx) => {
    const state = expenseStates.get(ctx.from?.id!);

    if (!state) {
        return;
    }

    const text = ctx.message?.text?.trim();

    if (text?.startsWith("/")) {
        return;
    }
    if(state.step==="settleAmount"){
        const amount = Number(text);
        if(!Number.isFinite(amount) || amount<=0){
            await ctx.reply("❌ Please enter a valid amount")
            return;
        }
        state.settleAmount = amount;
        state.step = "settleConfirm";
        const partner = await prisma.user.findUnique({
            where:{
                id:state.toUserId
            },
            select:{
                name:true
            }
        })
        await ctx.reply(
    `💸 Settlement Summary

👤 Paid to: ${partner?.name}
💰 Amount: ₹${amount}

Reply:

YES → Confirm
NO → Cancel`
  );

  return;
    }

    if(state.step==="settleConfirm"){
        const answer = text?.toLowerCase();
        if(answer === "no"){
            expenseStates.delete(ctx.from!.id);
            await ctx.reply("❌ Transaction cancelled");
            return;
        }

        if(answer !== "yes"){
            await ctx.reply("⚠️ Please reply with YES or NO");
            return;
        }

        const telegramUserID = String(ctx.from?.id);
        const user = await prisma.user.findUnique({
            where:{
                telegramUserID
            }
        })

        if(!user || !state.toUserId || !state.settleAmount){
            expenseStates.delete(ctx.from!.id);

    await ctx.reply(
      "❌ Unable to process settlement."
    );

    return;
        }

        try{
            const response = await api.post("/api/settlements",{
                fromUserId:user.id,
                toUserId:state.toUserId,
                amount:state.settleAmount
            });
            const settlement = response.data.settlement;
             await ctx.reply(
      `✅ Settlement recorded successfully!

💸 Amount: ₹${settlement.amountPaid}

👤 From: ${settlement.fromUser.name}
👤 To: ${settlement.toUser.name}`
    );

        }
        catch(error){
            console.log(error);
            await ctx.reply("❌ Failed to record settlement.");
        }
        finally{
            expenseStates.delete(ctx.from!.id);
            return;
        }
    }
    if (state.step === "amount") {
        const amount = Number(text);
        if (!Number.isFinite(amount) || amount <= 0) {
            await ctx.reply("❌ Please enter a valid amount.\n\nExample: 5000");
            return;
        }


        state.amount = amount;
        state.step = "transactionId";

        await ctx.reply("🔍 Please enter the Transaction ID or UPI Reference Number");
        return;
    }

    if (state.step === "transactionId") {
        state.transactionId = text
        state.step = "description";
        await ctx.reply("📝 Please add a description (e.g., Groceries, Dinner)");
        return;
    }

    if (state.step === "description") {
        state.description = text;
        state.step = "confirm";

        await ctx.reply(`💰 Amount: ₹${state.amount}
🧾 Transaction ID: ${state.transactionId}
📝 Description: ${state.description}

Reply with:

YES → Confirm
NO → Cancel`);
        return;
    }

    if (state.step === "confirm") {
        const answer = text?.toLowerCase();
        if (answer === "no") {
            expenseStates.delete(ctx.from!.id);
            await ctx.reply("❌ Transaction cancelled");
            return;
        }
        if (answer !== "yes") {
            await ctx.reply("⚠️ Please reply with YES or NO");
            return;
        }

        const telegramUserID = String(ctx.from?.id);
        const user = await prisma.user.findUnique({
            where: {
                telegramUserID
            }
        })

        if (!user) {
            expenseStates.delete(ctx.from!.id);
            await ctx.reply("❌ Your Telegram account is not linked.")
            return;
        }
        try {
            const response = await api.post("api/expenses", {
                amountPaid: state.amount,
                transactionId: state.transactionId,
                description: state.description,
                paidById: user.id
            })

            const expense = response.data;
            await ctx.reply(`✅ Expense added!
                💰 ₹${expense.amountPaid}
                📝 ${expense.description}`
            )
        }
        catch (error) {
            console.log(error);
            await ctx.reply("❌ Failed to add expense");
        }
        finally {
            expenseStates.delete(ctx.from!.id);
        }

    }

})

run(bot);