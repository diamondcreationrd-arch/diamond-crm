import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            agency: { select: { id: true, name: true } },
            client: { select: { id: true, businessName: true, brandColor: true, logoUrl: true } },
          },
        });

        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agencyId: user.agencyId,
          clientId: user.clientId,
          clientName: user.client?.businessName,
          clientColor: user.client?.brandColor,
          clientLogo: user.client?.logoUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.agencyId = (user as any).agencyId;
        token.clientId = (user as any).clientId;
        token.clientName = (user as any).clientName;
        token.clientColor = (user as any).clientColor;
        token.clientLogo = (user as any).clientLogo;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).agencyId = token.agencyId;
        (session.user as any).clientId = token.clientId;
        (session.user as any).clientName = token.clientName;
        (session.user as any).clientColor = token.clientColor;
        (session.user as any).clientLogo = token.clientLogo;
      }
      return session;
    },
  },
};
