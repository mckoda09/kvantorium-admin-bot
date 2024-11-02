import { Bot, Context } from "grammy";
import { manageComposer } from "./composers/manage.ts";
import { clearStatus } from "./db/status.ts";
import { clearTempCast } from "./db/temp.ts";
import { castComposer } from "./composers/cast.ts";

export const bot = new Bot(Deno.env.get("TOKEN") || "");
export const kv = await Deno.openKv();

export const link = Deno.env.get("LINK") || "";

export const notAdmin = async (c: Context) => await c.react("🤷");
export const notCast = async (c: Context) => await c.react("🤷‍♂");
export const notMember = async (c: Context) => await c.react("🤷‍♀");

// PLAN
// 1. add group to list of casts
// 2. manage groups
// 3. make a broadcast

bot.command("cancel", async (c) => {
  await clearStatus(c.chat.id);
  if (c.from) {
    await clearStatus(c.from.id);
    await clearTempCast(c.from.id);
  }
  await c.reply("👍", { reply_markup: { remove_keyboard: true } });
});

bot.use(manageComposer);
bot.use(castComposer);

bot.catch((e) => console.log(e.message));
