import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email guilds.join" } }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;
      const discordProfile = profile as { id: string; username: string; discriminator?: string; avatar?: string };

      await prisma.user.upsert({
        where: { discordId: discordProfile.id },
        update: {
          username: discordProfile.username,
          discriminator: discordProfile.discriminator ?? null,
          avatar: discordProfile.avatar ?? null,
          email: user.email ?? undefined
        },
        create: {
          discordId: discordProfile.id,
          username: discordProfile.username,
          discriminator: discordProfile.discriminator ?? null,
          avatar: discordProfile.avatar ?? null,
          email: user.email ?? undefined
        }
      });
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.discordId) {
        const dbUser = await prisma.user.findUnique({
          where: { discordId: token.discordId as string }
        });
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).role = dbUser.role;
          (session.user as any).discordId = dbUser.discordId;
        }
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.discordId = (profile as any).id;
      }
      return token;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET
};
