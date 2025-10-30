import { FormProvider } from 'react-hook-form';

import { Input } from '@renderer/components/form/input';
import { Button } from '@renderer/components/ui/button';
import { useTarget } from './useTargets';
import { Loader2 } from 'lucide-react';
import { Cross2Icon } from '@radix-ui/react-icons';

export function DialogTarget() {
  const { isDialogOpen, setIsDialogOpen, methods, onSubmit } = useTarget();

  return (
    <div
      data-state={isDialogOpen ? 'open' : 'closed'}
      className="fixed data-[state=open]:flex hidden justify-center items-center inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      onClick={() => setIsDialogOpen(false)}
    >
      <div
        className="bg-background rounded-md px-4 py-6 w-full max-w-md relative h-fit"
        onClick={(e) => e.stopPropagation()}
      >
        <Cross2Icon className="w-4 h-4 absolute top-2 right-2 cursor-pointer" onClick={() => setIsDialogOpen(false)} />
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="grid h-fit w-full grid-cols-12 gap-4">
            <Input name="name" label="Nome" className="col-span-6" />
            <Input name="ds_id" label="DS ID" className="col-span-6" disabled={true} />
            <Input name="email" label="Email" className="col-span-12" disabled={true} />

            <div className="col-span-full flex justify-end items-end w-full gap-4">
              <Button type="submit" disabled={methods.formState.isSubmitting} className="px-8">
                <Loader2
                  className="animate-spin hidden data-[show=true]:flex"
                  data-show={methods.formState.isSubmitting}
                />
                Salvar
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
