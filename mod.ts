import { Bot } from "grammy";
import { deleteStatus } from "./db/status.ts";
import { castComposer } from "./composers/cast.ts";
import { helperComposer } from "./composers/helper.ts";

// SETUP

export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");
export const kv = await Deno.openKv();

bot.use(castComposer);
bot.use(helperComposer);

// UTILS

bot.command("clear", async (ctx) => {
  await ctx.reply("Очистка кнопок!", {
    reply_markup: { remove_keyboard: true },
  });
});

bot.chatType("supergroup").command(
  "cancel",
  async (ctx) => {
    await deleteStatus(ctx.chat.id);
    await ctx.reply("Действие отменено!");
  },
);

// CATCH

bot.catch((error) => console.error(error.message));
