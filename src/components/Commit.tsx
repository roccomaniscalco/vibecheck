import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";

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
          className={`${isPositive && isDistinct ? "bg-green-800" : ""} ${
            isNegative && isDistinct ? "bg-red-800" : ""
          }`}
        >
          {text}
        </span>
      ))}
    </>
  );
};

const Commit = (props: HighlightProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [summary, description] = props.text.split("\n\n", 2) as [string, ...string[]];

  return (
    <div className="rounded-md border border-slate-200 p-4 font-mono text-sm dark:border-slate-700">
      <Collapsible.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex-nowrap">
            <h4 className="text-sm font-semibold inline">
              <Highlight
                text={summary}
                positive={props.positive}
                negative={props.negative}
              />
            </h4>
            {description && (
              <Collapsible.Trigger asChild>
                <button className="rounded-md bg-slate-700 inline px-1 ml-2">
                  …
                </button>
              </Collapsible.Trigger>
            )}
          </div>
        </div>
        {description && (
          <Collapsible.Content className="space-y-2">
            <pre className="whitespace-pre-wrap text-gray-300">
              <Highlight
                text={description}
                positive={props.positive}
                negative={props.negative}
              />
            </pre>
          </Collapsible.Content>
        )}
      </Collapsible.Root>
    </div>
  );
};

export default Commit;
