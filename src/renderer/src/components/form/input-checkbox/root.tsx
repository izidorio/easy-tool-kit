import {
    ComponentProps,
    ReactNode,
    createContext,
    useContext,
    useId,
    useState,
  } from "react";
  import { twMerge } from "tailwind-merge";
  
  interface RootProps extends ComponentProps<"div"> {
    children: ReactNode;
    label?: string;
  }
  
  type InputFileContextType = {
    id: string;
    errors?: string;
    setErrors: (value: string | undefined) => void;
  };
  const InputFileContext = createContext({} as InputFileContextType);
  
  export function Root({ label, children, className, ...rest }: RootProps) {
    const id = useId();
    const [errors, setErrors] = useState<string | undefined>(undefined);
  
    return (
      <InputFileContext.Provider
        value={{
          id,
          errors,
          setErrors,
        }}
      >
        <div className={twMerge("w-full", className)}>
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="Captador"
          >
            {label}
          </label>
          <div
            data-error={!!errors}
            className="group flex h-[40px] w-full items-center rounded-md border border-zinc-400 px-2 hover:bg-zinc-50 data-[error=true]:border-red-500"
            {...rest}
          >
            {children}
          </div>
          {errors && <p className="text-xs italic text-red-500">{errors}</p>}
        </div>
      </InputFileContext.Provider>
    );
  }
  
  export const useInputCheckbox = () => useContext(InputFileContext);
  