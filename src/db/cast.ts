import { kv } from "../mod.ts";

const castKey = (id: number) => ["cast", id];
const castGroup = (
  castId: number,
  groupId: number,
) => ["castGroup", castId, groupId];

export const makeCast = async (id: number) => {
  await kv.set(castKey(id), true);
};

export const isCast = async (id: number) =>
  (await kv.get<true>(castKey(id))).value ? true : false;

export const addGroupToCast = async (castId: number, groupId: number) =>
  await kv.set(castGroup(castId, groupId), true);

export const listCastGroups = async (id: number) =>
  await Array.fromAsync(
    kv.list({ prefix: ["castGroup", id] }),
    (e) => e.key[2] as number,
  );
