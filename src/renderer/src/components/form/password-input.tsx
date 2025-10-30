import { useState } from 'react';
import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface PasswordInputProps extends Omit<ComponentProps<'input'>, 'type'> {
  name: string;
  label: string;
  readOnly?: boolean;
}

export function PasswordInput({ name, label, readOnly = false, className, ...rest }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    formState: { errors },
  } = useFormContext();

  const handleCopyPassword = () => {
    const input = document.getElementById(label) as HTMLInputElement;
    if (input) {
      navigator.clipboard.writeText(input.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={twMerge('col-span-full w-full', className)}>
      <label className="mb-1 block text-sm font-medium text-primary/70" htmlFor={label}>
        {label}
      </label>
      <div className="relative">
        <input
          id={label}
          type={showPassword ? 'text' : 'password'}
          readOnly={readOnly}
          {...register(name)}
          autoComplete="off"
          {...rest}
          data-error={!!errors[name]?.message}
          className="focus:shadow-outline w-full appearance-none rounded border border-zinc-400 bg-transparent px-3 py-2 leading-tight text-primary read-only:bg-muted focus:outline-none data-[error=true]:border-red-500 pr-24"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:bg-zinc-100 rounded transition-colors"
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-zinc-500" /> : <Eye className="h-4 w-4 text-zinc-500" />}
          </button>
          <button
            type="button"
            onClick={handleCopyPassword}
            className="p-1 hover:bg-zinc-100 rounded transition-colors"
            title="Copiar senha"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-zinc-500" />}
          </button>
        </div>
      </div>
      {!!errors[name]?.message && <p className="text-xs italic text-red-500">{errors[name]?.message?.toString()}</p>}
    </div>
  );
}
