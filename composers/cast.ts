import { Bot, Composer } from "grammy";
import { deleteStatus, getStatus, setStatus } from "../db/status.ts";
import {
  deleteGroupFromCast,
  listGroupsByCast,
  setGroupToCast,
} from "../db/cast.ts";
import { checkPermission } from "../db/permission.ts";
import { customAlphabet, nanoid } from "nanoid";
import { bot, kv } from "../mod.ts";
import { InlineKeyboard } from "grammy";

export const castComposer = new Composer();

castComposer.chatType("supergroup").command("add", async (ctx) => {
  if (!await checkPermission(ctx.from.id, "manageGroups")) return;
  await setStatus(ctx.chat.id, "add");
  await ctx.reply("Пришлите ID группы для добавления.");
});

castComposer.chatType("supergroup").command("remove", async (ctx) => {
  if (!await checkPermission(ctx.from.id, "manageGroups")) return;
  await setStatus(ctx.chat.id, "remove");
  await ctx.reply("Пришлите ID группы для удаления.");
});

castComposer.chatType("supergroup").command("list", async (ctx) => {
  if (!await checkPermission(ctx.from.id, "manageGroups")) return;
  const groups = await listGroupsByCast(ctx.chat.id);
  if (!groups.length) {
    await ctx.reply("В рассылке ещё нет групп!");
    return;
  }
  await ctx.reply(
    "Группы в рассылке:\n\n" +
      groups.map((group, i) => `${i + 1}. ${group}`).join("\n"),
  );
});

export interface CastGroup {
  group: number;
  messageId: number;
}

castComposer.chatType("supergroup").on("msg:text", async (ctx) => {
  if (!await checkPermission(ctx.from.id, "manageGroups")) return;
  const status = await getStatus(ctx.chat.id);
  switch (status) {
    case "add": {
      await setGroupToCast(ctx.chat.id, Number(ctx.message.text));
      await deleteStatus(ctx.chat.id);
      await ctx.react("👍");
      break;
    }
    case "remove": {
      await deleteGroupFromCast(ctx.chat.id, Number(ctx.message.text));
      await deleteStatus(ctx.chat.id);
      await ctx.react("👍");
      break;
    }
    default: {
      await ctx.react("⚡");
      const groups = await listGroupsByCast(ctx.chat.id);
      const castId = crypto.randomUUID();
      for (const group of groups) {
        if (typeof group != "number") continue;
        const value: CastGroup = {
          group,
          messageId: (await ctx.copyMessage(group)).message_id,
        };
        await kv.set([
          "cast",
          ctx.chat.id,
          "list",
          castId,
          crypto.randomUUID(),
        ], value);
      }
      await ctx.reply("Рассылка отправлена!", {
        reply_markup: new InlineKeyboard().text("Удалить", "remove-" + castId),
      });
    }
  }
  return;
});

castComposer.chatType("supergroup").callbackQuery(
  /remove-[0-9]/,
  async (ctx) => {
    const castId = ctx.callbackQuery.data.split("-")[1];
    const entries = await Array.fromAsync(
      kv.list<CastGroup>({ prefix: ["cast", ctx.chat.id, "list", castId] }),
      (entry) => entry.value,
    );
    for (const entry of entries) {
      await bot.api.deleteMessage(entry.group, entry.messageId);
    }
    await ctx.reply("Успешно!");
    await ctx.answerCallbackQuery();
  },
);
