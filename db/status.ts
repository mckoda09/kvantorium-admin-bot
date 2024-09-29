import { kv } from "../mod.ts";

export const statusKey = (id: number) => ["status", id];
export type status = "add" | "remove";

export const setStatus = async (id: number, status: status) => {
  await kv.set(statusKey(id), status);
};

export const deleteStatus = async (id: number) => {
  await kv.delete(statusKey(id));
};

export const getStatus = async (id: number) => {
  return (await kv.get<status>(statusKey(id))).value;
};
