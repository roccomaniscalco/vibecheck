import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import {
  type DefaultJWT,
} from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import { env } from "@/env.mjs";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      login: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface Profile {
    login: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    login: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt(ctx) {
      const { token, account, profile } = ctx;
      // Persist the GitHub access_token to be used in protectedProcedures
      if (account) {
        token.accessToken = account.access_token;
      }
      // Pass GitHub login to session
      if (profile) {
        token.login = profile.login;
      }
      return token;
    },
    session(ctx) {
      const { session, token } = ctx;
      // Add the GitHub user ID to the session user
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      // Add the GitHub login to the session user
      if (token.login) {
        session.user.login = token.login;
      }
      return session;
    },
  },

  providers: [
    /**
     * ...add more providers here.
     * @see https://next-auth.js.org/providers/github
     */
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
