import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/prisma-client";
import { v4 as uuid } from "uuid";
import { encode as defaultEncode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

const adapter = PrismaAdapter(db);

declare module "next-auth" {
  interface Session {
    user: {
      name: string | null;
      surname: string | null;
      phoneNumber: string | null;
      role?: string;
      hasPassword?: boolean | null;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthConfig = {
  trustHost: true,
  adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          return null;
        }

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          if (existingUser.password) {
            return "/auth/error?error=EmailPasswordAccount&fromRedirect=true";
          }

          await db.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: account.providerAccountId,
              },
            },
            update: {},
            create: {
              userId: existingUser.id,
              provider: "google",
              providerAccountId: account.providerAccountId,
              type: "oauth",
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            },
          });
        } else {
          await db.user.create({
            data: {
              name: user.name!,
              email: user.email!,
              password: null,
              userRole: "User",
              phoneNumber: null,
              accounts: {
                create: {
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                  type: "oauth",
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                },
              },
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      if (user) {
        const tempUser = user as User;
        return {
          ...token,
          id: tempUser.id,
          name: tempUser.name || null,
          surname: tempUser.surname || null,
          phoneNumber: tempUser.phoneNumber || null,
          role: tempUser.userRole || "User",
          hasPassword: !!tempUser.password,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email ?? "",
          name: token.name ?? null,
          surname: (token.surname as string) ?? null,
          phoneNumber: (token.phoneNumber as string) ?? null,
          role: (token.role as string) ?? null,
          hasPassword: (token.hasPassword as boolean) ?? false,
        };
      }
      return session;
    },
  },
  jwt: {
    encode: async (params) => {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("Не знайдено id користувача в токені");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        if (!createdSession) {
          throw new Error("Не вдалось створити session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
