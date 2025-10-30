import { ComponentProps } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Checkbox } from "@renderer/components/ui/checkbox";
import { twMerge } from "tailwind-merge";

interface InputProps extends ComponentProps<"input"> {
  name: string;
  options?: { label: string; value: string }[];
  readOnly?: boolean;
  hiddenLabel?: boolean;
  label?: string;
}

export function Control({ name, label, hiddenLabel = false, options, className }: InputProps) {
  const { control } = useFormContext();

  return (
    <div className={twMerge("flex flex-col", className)}>
      {!options && (
        <div key={name} className="flex items-center gap-1">
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )}
          />

          <label
            htmlFor={`radio-${label}`}
            data-hidden={hiddenLabel}
            className="ml-1 data-[hidden='true']:hidden"
          >
            {label}
          </label>
        </div>
      )}

      {options?.map((option) => (
        <div key={option.label} className="flex items-center gap-1">
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Checkbox
                checked={field.value?.includes(option.value)}
                onCheckedChange={(checked) => {
                  return checked
                    ? field.onChange([...field.value, option.value])
                    : field.onChange(field.value?.filter((value: any) => value !== option.value));
                }}
              />
            )}
          />

          <label
            htmlFor={`radio-${option.value}`}
            data-hidden={hiddenLabel}
            className="ml-1 data-[hidden='true']:hidden"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}
