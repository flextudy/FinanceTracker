import "dotenv/config";
import { Bot } from "node-telegram-bot-api"

const token = process.env.TELEGRAM_BOT_TOKEN!;

if(!token){
    throw new Error("Token is missing");
}

export const bot = new Bot(token);

