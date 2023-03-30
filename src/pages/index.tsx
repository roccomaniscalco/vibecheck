import { api } from "@/utils/api";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";

const CommitGraph = dynamic(() => import("@/components/CommitGraph"), {
  ssr: false,
});

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const [searchTerm] = useState("facebook/react");

  const rateLimit = api.getRateLimit.useQuery(undefined, {
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

  const commits = api.getCommits.useQuery({ repo: searchTerm });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </div>

      {rateLimit.data && (
        <div className="m-12">
          <label htmlFor="resource limit">
            {rateLimit.data.percentageUsed}% Resource Usage
          </label>
          <meter
            id="resource limit"
            value={rateLimit.data.resources.core.used}
            max={rateLimit.data.resources.core.limit}
          >
            {rateLimit.data.percentageUsed} %
          </meter>
        </div>
      )}

      <CommitGraph repo={searchTerm} />

      {commits && <div className="text-red-500">{commits.error?.message}</div>}
    </>
  );
};

export default Home;
