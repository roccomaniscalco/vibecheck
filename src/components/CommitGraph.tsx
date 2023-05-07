import { api } from "@/utils/api";
import { useMemo } from "react";
import type { AxisOptions } from "react-charts";
import { Chart } from "react-charts";

type MyDatum = { date: Date; sentimentScore: number };

const CommitGraph = ({
  repoFullName,
  author,
}: {
  repoFullName: string | undefined;
  author: string;
}) => {
  const commits = api.getCommits.useQuery(
    { repoFullName: repoFullName as string },
    {
      enabled: !!repoFullName,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      keepPreviousData: true,
      select: (data) => ({
        label: "Score",
        data: data.reduce<{ date: Date; sentimentScore: number }[]>(
          (acc, curr) => {
            if (!author || curr.author.username.toLowerCase() === author) {
              acc.push({
                date: new Date(curr.date),
                sentimentScore: Number(curr.sentiment.score),
              });
            }
            return acc;
          },
          []
        ),
      }),
    }
  );

  const primaryAxis = useMemo(
    (): AxisOptions<MyDatum> => ({
      getValue: (datum) => datum.date,
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<MyDatum>[] => [
      {
        getValue: (datum) => datum.sentimentScore,
        elementType: "bubble",
      },
    ],
    []
  );

  return (
    <div className="h-96 w-full">
      {commits.error && (
        <div className="rounded-md bg-red-800 p-4">{commits.error.message}</div>
      )}
      {commits.data && (
        <Chart
          options={{
            data: [commits.data],
            primaryAxis,
            secondaryAxes,
            dark: true,
            interactionMode: "closest",
            initialWidth: 800,
            initialHeight: 400,
            getDatumStyle: (datum) => ({
              circle: {
                opacity: 0.8,
              },
              color:
                datum.originalDatum.sentimentScore > 0 ? "#4ade80" : "#f87171",
            }),
          }}
        />
      )}
    </div>
  );
};

export default CommitGraph;
