import { Composer } from "grammy";
import { Keyboard } from "grammy";

export const helperComposer = new Composer();

helperComposer.chatType("private").command("chathelper", async (ctx) => {
  await ctx.reply("Кнопка для получения ID чата 👇", {
    reply_markup: new Keyboard().requestChat("Выбрать чат", 0, {
      chat_is_channel: false,
      bot_is_member: true,
      request_title: true,
    }),
  });
});

helperComposer.chatType("private").on("msg:chat_shared", async (ctx) => {
  await ctx.reply(
    "ID чата " + ctx.message.chat_shared.title + ": `" +
      ctx.message.chat_shared.chat_id + "`",
    { parse_mode: "MarkdownV2" },
  );
});
