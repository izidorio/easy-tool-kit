import { Loader2, Trash2 } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends React.InputHTMLAttributes<HTMLDivElement> {
  disable?: boolean;
  children?: ReactNode;
  onAction: () => void;
}

export function TrashConfirmButton({
  onAction,
  children,
  className,
  ...rest
}: Props) {
  const [hidden, setHidden] = useState(true);
  const [isLoading, setLoading] = useState(false);

  function handleConfirm() {
    setHidden(false);
  }

  function handleClick() {
    setLoading(true);
    onAction();
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
      setLoading(false);
    }, 1000 * 5);
    return () => clearTimeout(timer);
  }, [hidden]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={twMerge(
        "flex cursor-pointer items-center gap-2 text-sm text-foreground/90",
        className
      )}
      {...rest}
    >
      {!hidden && (
        <div onClick={handleClick} className="flex items-center gap-2">
          {!isLoading && <Trash2 className="h-4 w-4 text-red-500" />}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </div>
      )}

      {hidden && (
        <div onClick={handleConfirm} className="flex items-center gap-2">
          <Trash2 className="hover:text-foreground/700 h-4 w-4 text-foreground/50" />

          {children}
        </div>
      )}
    </div>
  );
}
