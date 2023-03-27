import { api } from "@/utils/api";
import { useMemo } from "react";
import type { AxisOptions } from "react-charts";
import { Chart } from "react-charts";

type MyDatum = { date: Date; sentimentScore: number };

const CommitGraph = ({ ownerRepo }: { ownerRepo: string }) => {
  const commits = api.getCommits.useQuery(
    {
      ownerRepo,
    },
    {
      select: (data) => ({
        label: "Score",
        data: data.map((commit) => ({
          date: new Date(commit.date),
          sentimentScore: Number(commit.sentiment.score),
        })),
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
            data: [commits.data, ],
            primaryAxis,
            secondaryAxes,
            dark: true,
            interactionMode: "closest",
            initialWidth: 800,
            initialHeight: 400,
            getDatumStyle: (datum) => ({
              circle: {
                r: Math.log(Math.abs(datum.originalDatum.sentimentScore)) * 4,
                opacity: 0.5,
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
