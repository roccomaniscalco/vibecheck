import { api } from "@/utils/api";
import { useMemo } from "react";
import type { AxisOptions } from "react-charts";
import { Chart } from "react-charts";

type MyDatum = { date: Date; sentimentScore: number };

const CommitLineGraph = () => {
  const { data: commits, isLoading } = api.router.getCommits.useQuery(
    {
      owner: "facebook",
      repo: "react",
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
      {isLoading || !commits ? (
        "loading..."
      ) : (
        <Chart
          options={{
            data: [commits],
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
