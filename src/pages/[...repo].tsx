import CommitTimeline from "@/components/CommitTimeline";
import Head from "next/head";
import { useRouter } from "next/router";

const Repo = () => {
  const router = useRouter();
  const repo = Array.isArray(router.query.repo)
    ? router.query.repo.join("/")
    : router.query.repo;

  return (
    <>
      <Head>
        <title>{repo} | vibecheck</title>
        <meta name="description" content="Vibecheck your codebase with sentiment analysis." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CommitTimeline repo={repo} />
    </>
  );
};

export default Repo;
