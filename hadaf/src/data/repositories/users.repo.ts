import { eq } from "drizzle-orm";

import { db } from "../db/client";
import { users } from "../db/schema";

export const usersRepo = {
  async findByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  async findById(id: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
  }) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
      })
      .returning();

    return newUser;
  },

  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
    expiresAt: Date | null,
  ) {
    return await db
      .update(users)
      .set({
        refreshToken: hashedToken,
        refreshTokenExp: expiresAt,
      })
      .where(eq(users.id, userId));
  },
};
