import Commits from "@/components/Commits";
import { api } from "@/utils/api";
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
      enabled: Boolean(repo),
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      keepPreviousData: true,
    }
  );

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {commits.data && <Commits commits={commits.data} />}
    </>
  );
};

export default Repo;
