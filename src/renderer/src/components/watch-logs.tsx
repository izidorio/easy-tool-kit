import { ComponentProps, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface WatchLogsProps extends ComponentProps<"div"> {
  height?: number;
}

export function WatchLogs({
  height = 120,
  className,
  ...rest
}: WatchLogsProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.api.watchLog((_, log) => {
      setLogs((prevLogs) => [...prevLogs, log]);
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
          "h-[120px]",
          `h-[${height}px]`,
          "overflow-y-scroll scrollbar-thin scrollbar-thumb-muted",
          "bg-foreground/10 p-2 scrollbar-track-muted-foreground",
          "text-muted-foreground"
        )}
      >
        <p className="text-xs">logs</p>
        {logs.map((log, index) => (
          <p key={index} className="text-xs truncate">
            {log}
          </p>
        ))}
      </div>
    </div>
  );
}
