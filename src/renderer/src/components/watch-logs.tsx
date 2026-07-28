import { ComponentProps, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "./ui/button";
import { Copy, Trash2 } from "lucide-react";

const MAX_LOG_LINES = 5000;

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
  const linesRef = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const scrollRafRef = useRef<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const scrollToBottom = () => {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = scrollRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  };

  useEffect(() => {
    const unsubscribe = window.api.watchLog((log) => {
      linesRef.current.push(log);

      const pre = preRef.current;
      if (!pre) {
        return;
      }

      if (linesRef.current.length > MAX_LOG_LINES) {
        linesRef.current = linesRef.current.slice(-MAX_LOG_LINES);
        pre.textContent = linesRef.current.join("\n") + "\n";
      } else {
        pre.append(document.createTextNode(log + "\n"));
      }

      scrollToBottom();
    });

    return () => {
      unsubscribe();
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  const handleClearLogs = () => {
    linesRef.current = [];
    if (preRef.current) {
      preRef.current.textContent = "";
    }
  };

  const handleCopyLogs = () => {
    const logsText = linesRef.current.join("\n");
    navigator.clipboard.writeText(logsText);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div
      className={twMerge("rounded-lg overflow-hidden w-full", className)}
      {...rest}
    >
      <div
        ref={scrollRef}
        style={{ height }}
        className={twMerge(
          "overflow-y-scroll scrollbar-thin scrollbar-thumb-muted",
          "bg-foreground/10 p-2 scrollbar-track-muted-foreground",
          "text-muted-foreground",
        )}
      >
        <pre
          ref={preRef}
          className="text-xs whitespace-pre-wrap break-words font-sans m-0"
        />
      </div>
      {showToolbar && (
        <div className="flex justify-end items-end w-full gap-4 mt-2">
          <Button variant="outline" size="sm" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4" />
            Limpar logs
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLogs}>
            <Copy className="h-4 w-4" /> {isCopied ? "Copiado" : "Copiar logs"}
          </Button>
        </div>
      )}
    </div>
  );
}
