import { memo, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import type { RouterOutputs } from "@/utils/api";
import Image from "next/image";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

type HighlightProps = { text: string; positive: string[]; negative: string[] };
const Highlight = (props: HighlightProps) => {
  const chunks = props.text
    // split text into chunks that are either positive, negative, or neither
    .split(
      new RegExp(`(${[...props.positive, ...props.negative].join("|")})`, "gi")
    )
    .map((text, i, texts) => ({
      id: i,
      text,
      isPositive: props.positive.includes(text.toLowerCase()),
      isNegative: props.negative.includes(text.toLowerCase()),
      // chunk is distinct if not preceded and not followed by a letter, number, or hyphen
      // prevents highlighting words that are substrings of other words (e.g. "no" in "node")
      isDistinct:
        !texts[i - 1]?.slice(-1).match(/[a-zA-Z\d\-]/) &&
        !texts[i + 1]?.charAt(0).match(/[a-zA-Z\d\-]/),
    }));

  return (
    <>
      {chunks.map(({ text, isDistinct, isPositive, isNegative, id }) => (
        <span
          key={id}
          className={`${
            isPositive && isDistinct ? "bg-green-900 text-white" : ""
          } ${isNegative && isDistinct ? "bg-red-900 text-white" : ""}`}
        >
          {text}
        </span>
      ))}
    </>
  );
};

type CommitProps = RouterOutputs["getCommits"][0];
const Commit = (props: CommitProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [summary, description] = props.message.split("\n\n", 2) as [
    string,
    ...string[]
  ];

  return (
    <div className="rounded-md border border-slate-200 p-4 dark:border-slate-700 ">
      <Collapsible.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        className="space-y-2"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="inline font-semibold">
              <Highlight
                text={summary}
                positive={props.sentiment.positive}
                negative={props.sentiment.negative}
              />
            </h4>
            {description && (
              <Collapsible.Trigger asChild>
                <button className="ml-2 inline rounded-md bg-slate-700 px-1 hover:bg-slate-600">
                  …
                </button>
              </Collapsible.Trigger>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`${
                props.sentiment.score < 0 ? "text-red-400" : "text-green-400"
              } font-semibold`}
            >
              {props.sentiment.score !== 0 && props.sentiment.score}
            </div>
            <a
              href={props.html_url}
              target="_blank"
              title="View commit on Github"
              className="text-slate-400 hover:text-slate-300"
            >
              <GitHubLogoIcon className="h-6" />
            </a>
          </div>
        </div>
        {description && (
          <Collapsible.Content className="space-y-2">
            <pre className="whitespace-pre-wrap text-sm text-gray-400">
              <Highlight
                text={description}
                positive={props.sentiment.positive}
                negative={props.sentiment.negative}
              />
            </pre>
          </Collapsible.Content>
        )}
      </Collapsible.Root>
      <div className="mt-2 flex items-center gap-2">
        <Image
          className="block rounded-full"
          width={20}
          height={20}
          src={`${props.author.avatar_url}?size=20`}
          alt={`${props.author.name} avatar`}
        />
        <span>{props.author.login}</span>
      </div>
    </div>
  );
};

export default memo(Commit);
