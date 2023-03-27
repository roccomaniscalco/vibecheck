import { api } from "@/utils/api";
import { useMemo } from "react";
import type { AxisOptions } from "react-charts";
import { Chart } from "react-charts";

type MyDatum = { date: Date; sentimentScore: number };

const CommitLineGraph = ({ ownerRepo }: { ownerRepo: string }) => {
  const commits = api.getCommits.useQuery(
    {
      ownerRepo,
    },
    {
      select: (data) => ({
        label: "Score",
        data: data.map((commit) => ({
          date: new Date(commit.commit.committer.date),
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
      },
    ],
    []
  );

  return (
    <div className="h-96 w-full text-white">
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
          }}
        />
      )}
    </div>
  );
};

export default CommitLineGraph;
