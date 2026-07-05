import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";

export const usersRepo = {
  async findByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  async createGoogleUser(data: {
    email: string;
    name: string;
    avatarUrl: string;
  }) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        avatar_url: data.avatarUrl,
        // The default settings object we mapped in schema.ts automatically handles the rest!
      })
      .returning();

    return newUser;
  },

  async updateRefreshToken(
    userId: string,
    token: string | null,
    expiresAt: Date | null,
  ) {
    return await db
      .update(users)
      .set({
        refresh_token: token,
        refresh_token_exp: expiresAt,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));
  },
};
