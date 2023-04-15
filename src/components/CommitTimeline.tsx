import { Anchor, Button } from "@/components/ui/clickable";
import { api, type RouterOutputs } from "@/utils/api";
import { githubAscii } from "@/utils/ascii";
import { dateDiff } from "@/utils/dateDiff";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as HoverCard from "@radix-ui/react-hover-card";
import {
  CommitIcon,
  DotsHorizontalIcon,
  GitHubLogoIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import { memo, useState } from "react";

type HighlightProps = {
  text: string;
  calculation: { [token: string]: number };
};
const Highlight = (props: HighlightProps) => {
  const chunks = props.text
    // split text into chunks that are either positive, negative, or neither
    // e.g. "I love this code" => ["I ", "love", " this code"]
    .split(
      new RegExp(
        `(${Object.keys(props.calculation)
          // sort by descending length to prevent substring matches
          // e.g. "loves" would match "love" if "love" was checked first
          .sort((a, b) => b.length - a.length)
          .join("|")})`,
        "gi"
      )
    )
    .map((text, i, texts) => ({
      id: i,
      text,
      score: props.calculation[text.toLocaleLowerCase()],
      // chunk is distinct if not preceded and not followed by a letter, number, or hyphen
      // prevents highlighting words that are substrings of other words (e.g. "no" in "node")
      isDistinct:
        !texts[i - 1]?.slice(-1).match(/[a-zA-Z\d\-]/) &&
        !texts[i + 1]?.charAt(0).match(/[a-zA-Z\d\-]/),
    }));

  return (
    <>
      {chunks.map(({ text, isDistinct, id, score }) => (
        <>
          {score && isDistinct ? (
            <HoverCard.Root key={id}>
              <HoverCard.Trigger asChild>
                <span
                  className={
                    score < 0
                      ? "bg-red-900 text-slate-200"
                      : "bg-green-900 text-slate-200"
                  }
                >
                  {text}
                </span>
              </HoverCard.Trigger>
              <HoverCard.Portal>
                <HoverCard.Content side="top" sideOffset={4}>
                  <div
                    className={`rounded-md px-2 py-1 font-mono font-slate-200 text-sm ${
                      score < 0 ? "bg-red-900" : "bg-green-900"
                    }`}
                  >
                    <span>{text.toLowerCase()}: </span>
                    <span>{score}</span>
                  </div>
                  <HoverCard.Arrow
                    className={score < 0 ? "fill-red-900" : "fill-green-900"}
                  />
                </HoverCard.Content>
              </HoverCard.Portal>
            </HoverCard.Root>
          ) : (
            <span key={id}>{text}</span>
          )}
        </>
      ))}
    </>
  );
};

type CommitProps = RouterOutputs["getCommits"][0];
const Commit = (props: CommitProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // convert the calculation array into an object for easier lookup
  const calculation = props.sentiment.calculation.reduce((acc, cur) => {
    Object.assign(acc, cur);
    return acc;
  }, {});
  const [summary, ...restMessage] = props.message.split("\n\n") as [
    string,
    ...string[]
  ];
  const description = restMessage.join("\n");

  if (summary === "Provide icon to edge devtools. (#26543)")
    console.log(props.sentiment.calculation);

  return (
    <article className="border-b border-slate-800 py-3 px-4 last:border-b-0">
      <Collapsible.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        className="space-y-2"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="inline align-middle font-semibold">
              <Highlight text={summary} calculation={calculation} />
            </h4>
            {description && (
              <Collapsible.Trigger asChild>
                <Button className="ml-2 inline px-2 py-1 align-middle">
                  <DotsHorizontalIcon />
                </Button>
              </Collapsible.Trigger>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`${
                props.sentiment.score < 0 ? "text-red-400" : "text-green-400"
              } ${
                props.sentiment.score === 0 ? "opacity-0" : ""
              } font-semibold`}
            >
              {props.sentiment.score}
            </div>
            <Anchor
              href={props.html_url}
              target="_blank"
              title="View commit on Github"
            >
              <GitHubLogoIcon />
            </Anchor>
          </div>
        </div>
        {description && (
          <Collapsible.Content className="space-y-2">
            <pre className="my-3 whitespace-pre-wrap text-sm text-slate-400">
              <Highlight text={description} calculation={calculation} />
            </pre>
          </Collapsible.Content>
        )}
      </Collapsible.Root>
      <div className="mt-2 flex items-center gap-2">
        {props.author.avatar_url && props.author.login && (
          <>
            <Image
              className="block rounded-full"
              width={20}
              height={20}
              src={`${props.author.avatar_url}?size=20`}
              alt={`${props.author.name} avatar`}
            />
            <span>
              <span className="font-semibold">{props.author.login}</span>{" "}
              <span className="text-slate-400">
                committed {dateDiff(new Date(props.date), new Date())}
              </span>
            </span>
          </>
        )}
      </div>
    </article>
  );
};

type CommitErrorProps = {
  error: {
    httpStatus?: number;
    message: string;
  };
};
const CommitError = (props: CommitErrorProps) => {
  return (
    <div className="absolute inset-0 my-4 grid place-items-center">
      <pre className="text-center text-[min(2vw,12px)] leading-[2ch] text-slate-700">
        {githubAscii}
      </pre>
      <p className="absolute font-semibold text-slate-400">
        {props.error.httpStatus && `${props.error.httpStatus}: `}
        {props.error.message}
      </p>
    </div>
  );
};

type CommitTimelineProps = { repoFullName: string | undefined };
const CommitTimeline = (props: CommitTimelineProps) => {
  const commitsByDate = api.getCommits.useQuery(
    { repoFullName: props.repoFullName as string },
    {
      enabled: !!props.repoFullName,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      keepPreviousData: true,
      select: (data) => {
        // group commits by date
        return data.reduce((result, commit) => {
          const date = new Date(commit.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          if (!result[date]) result[date] = [];
          result[date]?.push(commit);
          return result;
        }, {} as Record<string, CommitProps[]>);
      },
    }
  );

  if (commitsByDate.error) {
    return (
      <CommitError
        error={{
          httpStatus: commitsByDate.error.data?.httpStatus,
          message: commitsByDate.error.message,
        }}
      />
    );
  }

  return (
    <>
      {commitsByDate.data &&
        Object.entries(commitsByDate.data).map(([date, commits]) => (
          <section
            className="ml-4 mb-[2px] flex flex-col gap-4 border-l-2 border-dotted border-slate-800 pl-4"
            key={date}
          >
            <div className="-ml-6 mt-4 flex items-center gap-4 text-slate-400">
              <CommitIcon />
              <span>Commits on {date}</span>
            </div>
            <div className="-ml-8 rounded-md border border-slate-200 bg-slate-900 dark:border-slate-800 sm:ml-2">
              {commits.map((commit) => (
                <Commit {...commit} key={commit.sha} />
              ))}
            </div>
          </section>
        ))}
    </>
  );
};

export default memo(CommitTimeline);
