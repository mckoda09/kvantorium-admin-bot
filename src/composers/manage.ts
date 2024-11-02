import { Composer, InlineKeyboard, Keyboard } from "grammy";
import { isAdmin } from "../db/admin.ts";
import { link, notAdmin, notCast, notMember } from "../mod.ts";
import { addGroupToCast, isCast, makeCast } from "../db/cast.ts";
import { getStatus, setStatus } from "../db/status.ts";
import { getTempCast, setTempCast } from "../db/temp.ts";

export const manageComposer = new Composer();

manageComposer.chatType("supergroup").command("setup", async (c) => {
  if (!await isAdmin(c.from.id)) return await notAdmin(c);

  await makeCast(c.chatId);

  const reply_markup = new InlineKeyboard();
  reply_markup.url(
    "Добавить/удалить группы",
    `https://t.me/${link}?start=${c.chat.id}`,
  );
  const msg = await c.reply("Эта группа стала рассылкой! 🎉", { reply_markup });
  await c.pinChatMessage(msg.message_id);
});

manageComposer.chatType("private").command("start", async (c) => {
  const chatId = Number(c.message.text.split(" ")[1]) || 0;
  if (!await isCast(chatId)) return await notCast(c);
  const chatMember = await c.api.getChatMember(chatId, c.from.id);
  const allowedStatuses = ["member", "creator", "administrator"];
  if (!allowedStatuses.includes(chatMember.status)) return await notMember(c);

  const chat = await c.api.getChat(chatId);
  if (!chat) return;

  await setStatus(c.from.id, "waitToAdd");
  await setTempCast(chatId, c.from.id);

  const reply_markup = new Keyboard();
  reply_markup.requestChat("Выбрать чат", 0, {
    chat_is_channel: false,
    bot_is_member: true,
    request_title: true,
  }).resized();
  await c.reply(
    `Добавьте чат в рассылку <b>${chat.title}</b> 👇\nДля отмены — /cancel`,
    {
      reply_markup,
      parse_mode: "HTML",
    },
  );
});

manageComposer.chatType("private").on("msg:chat_shared", async (c) => {
  if (await getStatus(c.from.id) != "waitToAdd") return;

  const castId = await getTempCast(c.from.id);
  if (!castId) return;

  await addGroupToCast(castId, c.message.chat_shared.chat_id);
  await c.reply(
    `Чат <b>${c.message.chat_shared.title}</b> добавлен! Можете отправить ещё!\nЗавершить — /cancel`,
    {parse_mode: "HTML"}
  );
});
