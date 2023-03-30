import { cn } from "@/utils/cn";

type WavyGradientProps = {
  className?: string;
};

export function WavyGradient({ className }: WavyGradientProps) {
  return (
    <div
      className={cn(
        className,
        "background-animate bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
      )}
    ></div>
  );
}
