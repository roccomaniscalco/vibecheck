import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Commit from "@/components/Commit";
import { api } from "@/utils/api";
import dynamic from "next/dynamic";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { z } from "zod";

const CommitGraph = dynamic(() => import("@/components/CommitGraph"), {
  ssr: false,
});

const allowedChars = /^([a-zA-Z0-9\-\_\.\/]*)$/; // only letters, numbers, -, _, /, .
const ownerRepo = /(.+)\/(.+)/; // something/something-else
const searchTermSchema = z
  .string()
  .min(1, "Must not be empty")
  .regex(allowedChars, "Must only contain letters, numbers, -, _, /, and .")
  .regex(ownerRepo, "Must be in the format of 'owner/repo'");

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("facebook/react");
  const [searchError, setSearchError] = useState<z.ZodError | null>(null);

  const { data: rateLimit } = api.getRateLimit.useQuery(undefined, {
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

  const commits = api.getCommits.useQuery(
    { ownerRepo: searchTerm },
    {
      enabled:
        sessionData?.user !== undefined &&
        Number(rateLimit?.resources.core.remaining) > 0 &&
        searchError === null,
    }
  );

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newSearchTerm = searchInputRef.current?.value;
    const parsed = searchTermSchema.safeParse(newSearchTerm);

    if (parsed.success) {
      setSearchTerm(parsed.data);
      setSearchError(null);
    } else {
      setSearchError(parsed.error);
    }
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-auto max-w-6xl p-4">
        <div>
          {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "Sign out" : "Sign in"}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-2">
          <form onSubmit={handleSearchSubmit}>
            <input type="text" className="bg-slate-700" ref={searchInputRef} />
            <input type="submit" value="search" />
          </form>
          <div>
            {searchError ? searchError?.issues?.[0]?.message : searchTerm}
            {commits.isLoading && <span>loading...</span>}
          </div>
        </div>

        <CommitGraph ownerRepo={searchTerm} />

        {rateLimit && (
          <div className="m-12">
            <label htmlFor="resource limit">
              {rateLimit.percentageUsed}% Resource Usage
            </label>
            <meter
              id="resource limit"
              value={rateLimit.resources.core.used}
              max={rateLimit.resources.core.limit}
            >
              {rateLimit.percentageUsed} %
            </meter>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {commits.data?.map((commit) => (
            <Commit {...commit} key={commit.sha} />
          ))}
        </div>
        {commits && (
          <div className="text-red-500">{commits.error?.message}</div>
        )}
      </main>
    </>
  );
};

export default Home;
