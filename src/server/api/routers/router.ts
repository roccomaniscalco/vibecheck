import { TRPCError } from "@trpc/server";
import Sentiment from "sentiment";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// TODO: limit schemas to the properties that are actually used
const commitSchema = z.object({
  url: z.string(),
  sha: z.string(),
  node_id: z.string(),
  html_url: z.string(),
  comments_url: z.string(),
  commit: z.object({
    url: z.string(),
    author: z.object({
      name: z.string(),
      email: z.string(),
      date: z.string(),
    }),
    committer: z.object({
      name: z.string(),
      email: z.string(),
      date: z.string(),
    }),
    message: z.string(),
    tree: z.object({ url: z.string(), sha: z.string() }),
    comment_count: z.number(),
    verification: z.object({
      verified: z.boolean(),
      reason: z.string(),
      signature: z.string().nullable(),
      payload: z.string().nullable(),
    }),
  }),
  author: z.object({
    login: z.string(),
    id: z.number(),
    node_id: z.string(),
    avatar_url: z.string(),
    gravatar_id: z.string(),
    url: z.string(),
    html_url: z.string(),
    followers_url: z.string(),
    following_url: z.string(),
    gists_url: z.string(),
    starred_url: z.string(),
    subscriptions_url: z.string(),
    organizations_url: z.string(),
    repos_url: z.string(),
    events_url: z.string(),
    received_events_url: z.string(),
    type: z.string(),
    site_admin: z.boolean(),
  }),
  committer: z.object({
    login: z.string(),
    id: z.number(),
    node_id: z.string(),
    avatar_url: z.string(),
    gravatar_id: z.string(),
    url: z.string(),
    html_url: z.string(),
    followers_url: z.string(),
    following_url: z.string(),
    gists_url: z.string(),
    starred_url: z.string(),
    subscriptions_url: z.string(),
    organizations_url: z.string(),
    repos_url: z.string(),
    events_url: z.string(),
    received_events_url: z.string(),
    type: z.string(),
    site_admin: z.boolean(),
  }),
  parents: z.array(z.object({ url: z.string(), sha: z.string() })),
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

const sentiment = new Sentiment();

export const router = createTRPCRouter({
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
      const analyzedCommits = commits.map((commit) => ({
        ...commit,
        sentiment: sentiment.analyze(commit.commit.message),
      }));  

      return analyzedCommits;
    }),
});
