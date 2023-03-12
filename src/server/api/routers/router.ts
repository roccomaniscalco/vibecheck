import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const commitSchema = z.object({
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

export const router = createTRPCRouter({
  commits: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .query(async ({ input }) => {
      const { owner, repo } = input;

      const commitsJson = (await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits`,
        {
          headers: {
            Authorization: `token 76ab8a55ecc8d0efaa7477696c24b2a5e30cfa54`,
          },
        }
      ).then((res) => res.json())) as unknown;
      console.log(commitsJson);

      const commits = z.array(commitSchema).parse(commitsJson);

      return { commits };
    }),
});
