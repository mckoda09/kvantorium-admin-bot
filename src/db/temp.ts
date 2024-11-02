import { kv } from "../mod.ts";


const tempCastKey = (id: number) => ["tempChat", id];

export const setTempCast = async (castId: number, userId: number) =>
  await kv.set(tempCastKey(userId), castId);

export const getTempCast = async (id: number) =>
  (await kv.get<number>(tempCastKey(id))).value;

export const clearTempCast = async (id: number) =>
  await kv.delete(tempCastKey(id));
