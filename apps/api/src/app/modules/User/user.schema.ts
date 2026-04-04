import { z } from "zod";

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["USER", "MANAGER", "ADMIN"]).optional().default("USER"),
  }),
});

const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(["USER", "MANAGER", "ADMIN"]),
  }),
});


export const UserValidation = {
  createUserSchema,
  updateRoleSchema,
};

