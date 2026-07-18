import { z } from "zod";

export const groupRoleEnum = z.enum(["owner", "member"]);

export const createGroupSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(60),
});

export const updateGroupSchema = createGroupSchema;

export const joinGroupSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Código deve ter 6 caracteres")
    .transform((v) => v.toUpperCase()),
});

export type GroupMemberResponse = {
  id: string;
  name: string;
  role: z.infer<typeof groupRoleEnum>;
};

export type GroupInviteResponse = {
  code: string;
  expiresAt: string;
};

export type GroupResponse = {
  id: string;
  name: string;
  role: z.infer<typeof groupRoleEnum>;
  members: GroupMemberResponse[];
};

export type GroupMeResponse = {
  group: GroupResponse | null;
};
