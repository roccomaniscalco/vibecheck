import { TRPCError } from "@trpc/server";
import Sentiment from "sentiment";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const commitSchema = z.object({
  sha: z.string(),
  html_url: z.string(),
  commit: z.object({
    author: z.object({
      name: z.string(),
      date: z.string(),
    }),
    message: z.string(),
  }),
  author: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
});

const rateLimitSchema = z.object({
  resources: z.object({
    core: z.object({
      limit: z.number(),
      remaining: z.number(),
      reset: z.number(),
      used: z.number(),
    }),
  }),
});

const reposSchema = z.object({
  total_count: z.number(),
  incomplete_results: z.boolean(),
  items: z.array(
    z.object({
      id: z.number(),
      full_name: z.string(),
    })
  ),
});

const sentiment = new Sentiment();

export const appRouter = createTRPCRouter({
  getRateLimit: protectedProcedure.query(async ({ ctx }) => {
    // Throw if the user does not have an access token
    if (!ctx.token.accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No access token",
      });
    }

    // Fetch the user's rate limit
    const rateLimitJson = (await fetch("https://api.github.com/rate_limit", {
      headers: {
        Authorization: `token ${ctx.token.accessToken}`,
      },
    }).then((res) => res.json())) as unknown;

    const rateLimit = rateLimitSchema.parse(rateLimitJson);
    return rateLimit;
  }),

  getCommits: protectedProcedure
    .input(z.object({ ownerRepo: z.string() }))
    .query(async ({ input, ctx }) => {
      const { ownerRepo } = input;

      // Throw if the user does not have an access token
      if (!ctx.token.accessToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No access token",
        });
      }

      // Fetch the user's commits
      const commitsJson = (await fetch(
        `https://api.github.com/repos/${ownerRepo}/commits?per_page=100`,
        {
          headers: {
            Authorization: `token ${ctx.token.accessToken}`,
          },
        }
      ).then((res) => {
        if (res.ok) {
          return res.json();
        }
        if (res.status === 404) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Repository not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
      })) as unknown;

      const commits = z.array(commitSchema).parse(commitsJson);
      const analyzedAndFormattedCommits = commits.map((commit) => ({
        sha: commit.sha,
        html_url: commit.html_url,
        message: commit.commit.message,
        date: commit.commit.author.date,
        author: {
          login: commit.author.login,
          name: commit.commit.author.name,
          avatar_url: commit.author.avatar_url,
        },
        sentiment: sentiment.analyze(commit.commit.message),
      }));

      return analyzedAndFormattedCommits;
    }),

  searchRepos: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      // Throw if the user does not have an access token
      if (!ctx.token.accessToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No access token",
        });
      }

      const reposJson = (await fetch(
        `https://api.github.com/search/repositories?q=${input.query}`,
        {
          headers: {
            Authorization: `token ${ctx.token.accessToken}`,
          },
        }
      ).then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
      })) as unknown;

      const repos = reposSchema.parse(reposJson);
      return repos.items;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
