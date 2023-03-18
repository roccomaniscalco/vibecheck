import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import { api } from "@/utils/api";
import Highlight from "@/components/Highlight";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  const { data: rateLimit } = api.router.getRateLimit.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
    select: (data) => ({
      ...data,
      // i.e. 2.7
      percentageUsed: (
        (data.resources.core.used / data.resources.core.limit) *
        100
      ).toFixed(1),
    }),
  });

  const { data: commits } = api.router.getCommits.useQuery(
    { owner: "facebook", repo: "react" },
    {
      enabled:
        sessionData?.user !== undefined &&
        rateLimit &&
        rateLimit.resources.core.remaining > 0,
    }
  );

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-min-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4 text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {rateLimit && (
          <div className="m-12">
            <label className="text-white" htmlFor="resource limit">
              {rateLimit.percentageUsed}% Resource Usage
            </label>
            <meter
              className="text-white"
              id="resource limit"
              value={rateLimit.resources.core.used}
              max={rateLimit.resources.core.limit}
            >
              {rateLimit.percentageUsed} %
            </meter>
          </div>
        )}
        {commits?.map((commit) => (
          <div key={commit.sha} className="my-4 break-words">
            <Highlight
              text={commit.commit.message}
              positive={commit.sentiment.positive}
              negative={commit.sentiment.negative}
            />
            <span
              className={
                commit.sentiment.score > 0
                  ? "text-green-200"
                  : "text-yellow-200"
              }
            >
              {commit.sentiment.score}
            </span>
            <div>{JSON.stringify(commit.sentiment.positive)}</div>
            <div>{JSON.stringify(commit.sentiment.negative)}</div>
          </div>
        ))}

        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </main>
    </>
  );
};

export default Home;
