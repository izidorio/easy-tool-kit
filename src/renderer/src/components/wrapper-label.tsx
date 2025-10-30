import { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

import { Skeleton } from "./ui/skeleton";

interface Props extends ComponentProps<"div"> {
  label: string;
  children: ReactNode;
  loading?: boolean;
  align?: "left" | "right";
  truncate?: boolean;
}

export function WrapperLabel({
  label,
  children,
  className,
  align = "left",
  loading = false,
  truncate = true,
  ...rest
}: Props) {
  return (
    <div
      data-align={align}
      className={twMerge(
        "flex flex-col text-foreground/90 data-[align='right']:ml-auto",
        className
      )}
      {...rest}
    >
      <span className="block text-xs leading-3 text-foreground/60">
        {label}
      </span>

      {!children && loading && <Skeleton className="mt-1 h-4 w-full" />}

      <p
        className={twMerge(
          "text-md mt-0.5 leading-4",
          truncate ? "truncate" : ""
        )}
      >
        {children}
      </p>
    </div>
  );
}

export { WrapperLabel as Wl };
