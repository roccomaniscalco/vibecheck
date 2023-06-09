import { CommandPalette } from "@/components/CommandPalette";
import CommitTimeline from "@/components/CommitTimeline";
import { WavyGradient } from "@/components/ui/gradient";
import { api } from "@/utils/api";
import { FileIcon } from "@radix-ui/react-icons";
import Head from "next/head";
import { useRouter } from "next/router";

const Repo = () => {
  const router = useRouter();
  const repo = Array.isArray(router.query.repo)
    ? router.query.repo.join("/")
    : router.query.repo;

  const commits = api.getCommits.useQuery(
    { repo: repo as string },
    {
      enabled: !!repo,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      keepPreviousData: true,
    }
  );

  const showLoadingBar = commits.isFetching || commits.isLoading;

  return (
    <>
      <Head>
        <title>{repo} | vibecheck</title>
        <meta
          name="description"
          content="Vibecheck your codebase with sentiment analysis."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-gray-50/80 backdrop-blur dark:bg-slate-900/80 ">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
          <FileIcon className="h-4 w-4 text-slate-400" />
          <h1 className="min-w-0 flex-1 truncate font-semibold">{repo}</h1>
          <CommandPalette />
        </div>
        <div className="h-0">
          {showLoadingBar && <WavyGradient className="-my-[1px] h-[1px]" />}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 pb-4">
        <CommitTimeline repo={repo} />
      </main>
    </>
  );
};

export default Repo;
