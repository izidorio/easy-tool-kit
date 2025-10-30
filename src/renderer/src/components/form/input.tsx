import type { ComponentProps } from "react";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface InputProps extends ComponentProps<"input"> {
	name: string;
	label: string;
	readOnly?: boolean;
	directory?: string;
	webkitdirectory?: string;
}

export function Input({ name, label, readOnly = false, className, ...rest }: InputProps) {
	const {
		register,
		formState: { errors },
	} = useFormContext();

	return (
		<div className={twMerge("col-span-full w-full", className)}>
			<label className="mb-1 block text-sm font-medium text-primary/70" htmlFor={label}>
				{label}
			</label>
			<input
				id={label}
				readOnly={readOnly}
				{...register(name)}
				autoComplete="off"
				{...rest}
				data-error={!!errors[name]?.message}
				className="focus:shadow-outline w-full appearance-none rounded border border-zinc-400 bg-transparent px-3 py-2 leading-tight text-primary read-only:bg-muted focus:outline-none data-[error=true]:border-red-500"
			/>
			{!!errors[name]?.message && <p className="text-xs italic text-red-500">{errors[name]?.message?.toString()}</p>}
		</div>
	);
}
