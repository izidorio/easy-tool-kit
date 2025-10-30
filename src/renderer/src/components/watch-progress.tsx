import { ComponentProps, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface WatchLogsProps extends ComponentProps<"div"> {
  height?: number;
}

export function WatchProgress({
  height = 120,
  className,
  ...rest
}: WatchLogsProps) {
  const [logs, setLogs] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.api.watchProgress((_, log) => {
      setLogs(log);
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className={twMerge("rounded-lg overflow-hidden w-full", className)}
      {...rest}
    >
      <div
        ref={scrollRef}
        className={twMerge(
          "h-12",
          "overflow-y-scroll scrollbar-thin scrollbar-thumb-muted",
          "bg-foreground/10 p-2 scrollbar-track-muted-foreground",
          "text-muted-foreground"
        )}
      >
        <p className="text-xs">{logs}</p>
      </div>
    </div>
  );
}
