import { cn } from "@/lib/utils";
import { Card } from "./card";
import { ReactNode } from "react";
import { HTMLAttributes } from "react";

interface GradientBorderCardProps extends HTMLAttributes<HTMLDivElement> {
  gradientFrom: string;
  gradientVia?: string;
  gradientTo: string;
  children: ReactNode;
  className?: string;
}

export function GradientBorderCard({
  gradientFrom,
  gradientVia,
  gradientTo,
  children,
  className,
  ...props
}: GradientBorderCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[20px] p-[1px] overflow-hidden",
        className
      )}
      style={{
        background: gradientVia
          ? `linear-gradient(135deg, ${gradientFrom}, ${gradientVia}, ${gradientTo})`
          : `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
      }}
    >
      <Card
        className="relative h-full w-full rounded-[19px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md"
        {...props}
      >
        {children}
      </Card>
    </div>
  );
} 