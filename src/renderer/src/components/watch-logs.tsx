import { ComponentProps, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "./ui/button";
import { Copy, Trash2 } from "lucide-react";

interface WatchLogsProps extends ComponentProps<"div"> {
  height?: number;
  showToolbar?: boolean;
}

export function WatchLogs({
  height = 120,
  className,
  showToolbar = false,
  ...rest
}: WatchLogsProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

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

  const handleClearLogs = () => {
    setLogs([]);
  }

  const handleCopyLogs = () => {
    const logsText = logs.join('\n');
    navigator.clipboard.writeText(logsText);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    
  }

  return (
    <div
      className={twMerge("rounded-lg overflow-hidden w-full", className)}
      {...rest}
    >
      <div
        ref={scrollRef}
        className={twMerge(
          "flex flex-col gap-2",
          `h-[120px]`,
          "overflow-y-scroll scrollbar-thin scrollbar-thumb-muted",
          "bg-foreground/10 p-2 scrollbar-track-muted-foreground",
          "text-muted-foreground",
          className,
        )}
      >
        <p className="text-xs">logs</p>
        {logs.map((log, index) => (
          <p key={index} className="text-xs truncate">
            {log}
          </p>
        ))}
      </div>
      {showToolbar && (
        <div className="flex justify-end items-end w-full gap-4 mt-2">
          <Button variant="outline" size="sm" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4" />
            Limpar logs
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLogs}> <Copy className="h-4 w-4" /> {isCopied ? 'Copiado' : 'Copiar logs'}</Button>
        </div>
      )}
    </div>
  );
}
