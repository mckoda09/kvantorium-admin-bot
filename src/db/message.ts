import { kv } from "../mod.ts";

export interface CastMessage {
  groupId: number;
  messageId: number;
}

const castMessageKey = (
  castId: number,
  sentId: string,
) => ["castMessage", castId, sentId, crypto.randomUUID()];

export const setCastMessage = async (
  castId: number,
  sentId: string,
  messageId: number,
  groupId: number,
) =>
  await kv.set(
    castMessageKey(castId, sentId),
    { groupId, messageId } as CastMessage,
  );

export const listCastMessages = async (castId: number, sentId: string) =>
  await Array.fromAsync(
    kv.list<CastMessage>({ prefix: ["castMessage", castId, sentId] }),
    (e) => e.value,
  );
