import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftProvider from "next-auth/providers/azure-ad";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      agency: { select: { id: true, name: true } },
      client: { select: { id: true, businessName: true, brandColor: true, logoUrl: true } },
    },
  });
}

function buildUserToken(user: any) {
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
}

const providers: any[] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await findUserByEmail(credentials.email);
      if (!user || !user.isActive || !user.password) return null;
      const valid = await bcrypt.compare(credentials.password, user.password);
      if (!valid) return null;
      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      return buildUserToken(user);
    },
  }),
];

// Add Google if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Add Microsoft if configured
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET) {
  providers.push(
    MicrosoftProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "common",
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, find existing user by email only
      if (account?.provider !== "credentials") {
        if (!user.email) return false;
        const dbUser = await findUserByEmail(user.email);
        if (!dbUser || !dbUser.isActive) {
          return "/login?error=OAuthAccountNotLinked";
        }
        await prisma.user.update({ where: { id: dbUser.id }, data: { lastLoginAt: new Date() } });
        // Inject DB data into user object for jwt callback
        (user as any).id = dbUser.id;
        (user as any).role = dbUser.role;
        (user as any).agencyId = dbUser.agencyId;
        (user as any).clientId = dbUser.clientId;
        (user as any).clientName = dbUser.client?.businessName;
        (user as any).clientColor = dbUser.client?.brandColor;
        (user as any).clientLogo = dbUser.client?.logoUrl;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
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
