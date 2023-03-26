import { memo } from "react";

type HighlightProps = { text: string; positive: string[]; negative: string[] };

const Highlight = (props: HighlightProps) => {
  // split text into chunks that are either positive, negative, or neither
  const chunks = props.text.split(
    new RegExp(`(${[...props.positive, ...props.negative].join("|")})`, "gi")
  );

  return (
    <pre>
      {chunks.map((chunk, i) => {
        // chunk is distinct if not preceded and not followed by a letter, number, or hyphen
        // prevents highlighting words that are substrings of other words (e.g. "no" in "node")
        const isDistinct =
          !chunks[i - 1]?.slice(-1).match(/[a-zA-Z\d\-]/) &&
          !chunks[i + 1]?.charAt(0).match(/[a-zA-Z\d\-]/);
        const isPositive = props.positive.includes(chunk.toLowerCase());
        const isNegative = props.negative.includes(chunk.toLowerCase());

        return (
          <span
            key={i}
            className={`${isPositive && isDistinct ? "bg-green-800" : ""} ${
              isNegative && isDistinct ? "bg-red-800" : ""
            }`}
          >
            {chunk}
          </span>
        );
      })}
    </pre>
  );
};

export default memo(Highlight);
