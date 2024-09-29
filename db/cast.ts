import { kv } from "../mod.ts";

export const castGroupKey = (
  castId: number,
  groupId: number,
) => ["cast", castId, "group", groupId];

export const setGroupToCast = async (castId: number, groupId: number) => {
  await kv.set(castGroupKey(castId, groupId), true);
};

export const deleteGroupFromCast = async (castId: number, groupId: number) => {
  await kv.delete(castGroupKey(castId, groupId));
};

export const listGroupsByCast = async (castId: number) => {
  return await Array.fromAsync(
    kv.list<true>({ prefix: ["cast", castId, "group"] }),
    (entry) => Number(entry.key[3]),
  );
};
