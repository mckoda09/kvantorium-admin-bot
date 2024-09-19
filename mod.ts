import { Bot } from "grammy";

export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");

bot.chatType("private").on("msg:text", async (ctx) => {
    await ctx.reply(ctx.message.text);
});
