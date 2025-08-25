import { z } from "zod";


export const UserSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  email: z.email(),
  picture: z.string().optional(),
})
