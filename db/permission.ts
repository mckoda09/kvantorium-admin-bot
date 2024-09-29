import { kv } from "../mod.ts";

export type permission = "manageGroups";

export const permissionKey = (
  id: number,
  permission: permission,
) => ["permission", id, permission];

export const checkPermission = async (id: number, permission: permission) => {
  return (await kv.get<boolean>(permissionKey(id, permission))).value
    ? true
    : false;
};

export const setPermission = async (id: number, permission: permission) => {
  await kv.set(permissionKey(id, permission), true);
};

export const deletePermission = async (id: number, permission: permission) => {
  await kv.delete(permissionKey(id, permission));
};
