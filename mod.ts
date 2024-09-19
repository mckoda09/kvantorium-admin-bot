import { Bot } from "grammy";

export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");

bot.chatType("group").on("msg:text", async (ctx) => {
    await ctx.react("👎");
    await ctx.reply(ctx.message.text);
});
