import { Composer, InlineKeyboard } from "grammy";
import { isCast, listCastGroups } from "../db/cast.ts";
import { notCast } from "../mod.ts";
import { clearStatus, getStatus, setStatus } from "../db/status.ts";
import { listCastMessages, setCastMessage } from "../db/message.ts";

export const castComposer = new Composer();

castComposer.chatType("supergroup").command("cast", async (c) => {
  if (!await isCast(c.chat.id)) return await notCast(c);

  await setStatus(c.chat.id, "waitForCast");
  await c.reply("Отправьте сообщение для рассылки 👇\nДля отмены — /cancel");
});

castComposer.chatType("supergroup").on("msg:text", async (c) => {
  if (await getStatus(c.chat.id) != "waitForCast") return;
  if (!await isCast(c.chat.id)) return await notCast(c);

  await c.reply("Рассылка запущена...");
  await clearStatus(c.chat.id);

  const groups = await listCastGroups(c.chat.id);
  let count = 0;

  const sentId = crypto.randomUUID();

  for (const group of groups) {
    const msg = await c.copyMessage(group);
    await setCastMessage(c.chat.id, sentId, msg.message_id, group);
    count++;
  }

  const reply_markup = new InlineKeyboard();
  reply_markup.text("Удалить", `remove-${sentId}`);
  await c.reply(`Рассылка завершена! Групп: ${count}`, { reply_markup });
});

castComposer.chatType("supergroup").callbackQuery(
  /^remove-.*/,
  async (c) => {
    if (!await isCast(c.chat.id)) return;
    await c.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    await c.answerCallbackQuery();

    const sentMessages = await listCastMessages(
      c.chat.id,
      c.callbackQuery.data.split("-").slice(1).join("-") || "",
    );

    let count = 0;

    for (const message of sentMessages) {
      await c.api.deleteMessage(message.groupId, message.messageId);
      count++;
    }

    await c.reply(`Рассылка удалена! Групп: ${count}`);
  },
);
