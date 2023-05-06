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
      date: z.string().datetime(),
    }),
    message: z.string(),
  }),
  author: z
    .object({
      login: z.string().optional(),
      avatar_url: z.string().optional(),
    })
    .nullable(),
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

const repoSchema = z.object({
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
});

const repoSearchResultsSchema = z.object({
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
    .input(z.object({ repoFullName: z.string() }))
    .query(async ({ input, ctx }) => {
      // Throw if the user does not have an access token
      if (!ctx.token.accessToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No access token",
        });
      }

      // Fetch the user's commits
      const commitsJson = (await fetch(
        `https://api.github.com/repos/${input.repoFullName}/commits?per_page=100`,
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
          username: commit.author?.login ? commit.author.login : commit.commit.author.name,
          avatar_url: commit.author?.avatar_url,
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

      const encodedQuery = encodeURIComponent(input.query);
      const resultsPerPage = 5;
      const pageCount = 1;
      const reposJson = (await fetch(
        `https://api.github.com/search/repositories?q=${encodedQuery}&per_page=${resultsPerPage}&page=${pageCount}`,
        {
          headers: {
            Authorization: `token ${ctx.token.accessToken}`,
          },
        }
      ).then((res) => {
        if (res.ok) {
          return res.json();
        }
        if (res.status === 422) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid query",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
      })) as unknown;

      const repos = repoSearchResultsSchema.parse(reposJson);
      return repos.items;
    }),

  getRepo: protectedProcedure
    .input(z.object({ repoFullName: z.string() }))
    .query(async ({ input, ctx }) => {

      // Throw if the user does not have an access token
      if (!ctx.token.accessToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No access token",
        });
      }

      const repoJson = (await fetch(
        `https://api.github.com/repos/${input.repoFullName}`,
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

      const repo = repoSchema.parse(repoJson);
      return repo;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
