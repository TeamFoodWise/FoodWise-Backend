import {z} from 'zod';

export const registerSchema = z.object({
    full_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirm_password: z.string().min(8)
}).refine(data => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"]
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
