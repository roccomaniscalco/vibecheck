import { cn } from "@/utils/cn";

type WavyGradientProps = {
  className?: string;
};

export function LoadingGradient({ className }: WavyGradientProps) {
  return (
    <div
      className={cn(
        className,
        "h-[1px] animate-slide bg-gradient-to-r from-slate-800 via-pink-500 to-slate-800 bg-[size:400%]"
      )}
    ></div>
  );
}
