import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/owner-access";

const config = z
  .object({
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
  })
  .parse({
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  });

export const auth = betterAuth({
  appName: "Cherries On Top",
  baseURL: config.BETTER_AUTH_URL,
  secret: config.BETTER_AUTH_SECRET,

  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    },
  },

  account: {
    accountLinking: {
      enabled: false,
    },
  },

  user: {
    changeEmail: {
      enabled: false,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60,
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isOwner(user.email, user.emailVerified)) {
            throw new APIError("FORBIDDEN", {
              message: "Owner access only.",
            });
          }

          return { data: user };
        },
      },
    },

    session: {
      create: {
        before: async (session) => {
          const user = await db.user.findUnique({
            where: { id: session.userId },
            select: {
              email: true,
              emailVerified: true,
            },
          });

          if (!user || !isOwner(user.email, user.emailVerified)) {
            throw new APIError("FORBIDDEN", {
              message: "Owner access only.",
            });
          }

          return { data: session };
        },
      },
    },
  },
});