type HighlightProps = { text: string; positive: string[]; negative: string[] };

const Highlight = ({ text, positive, negative }: HighlightProps) => {
  // split text into parts that are either positive, negative, or neither
  const parts = text.split(
    new RegExp(`(${[...positive, ...negative].join("|")})`, "gi")
  );

  return (
    <span className="break-all">
      {parts.map((part, i) => {
        // part is distinct if not preceded or followed by a letter, number, or space
        // prevents highlighting words that are substrings of other words (e.g. "no" in "node")
        const isDistinct = parts[i + 1]
          ? parts[i + 1]?.charAt(0).match(`[^a-zA-Z\d\s]`)
          : true && parts[i - 1]
          ? parts[i - 1]?.slice(-1).match(`[^a-zA-Z\d\s]`)
          : true;
        const isPositive = positive.includes(part.toLowerCase());
        const isNegative = negative.includes(part.toLowerCase());

        return (
          <span
            key={i}
            className={`${isPositive && isDistinct ? "bg-green-800" : ""} ${
              isNegative && isDistinct ? "bg-red-800" : ""
            }`}
          >
            {part}
          </span>
        );
      })}
    </span>
  );
};

export default Highlight;
