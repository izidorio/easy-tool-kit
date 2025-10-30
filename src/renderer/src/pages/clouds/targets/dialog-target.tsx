import { FormProvider } from 'react-hook-form';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { Input } from '@renderer/components/form/input';
import { Button } from '@renderer/components/ui/button';
import { useTarget } from './useTargets';
import { Loader2 } from 'lucide-react';

export function DialogTarget() {
  const { isDialogOpen, setIsDialogOpen, selectedTarget, methods, onSubmit } = useTarget();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{selectedTarget ? 'Editar Alvo' : 'Novo Alvo'}</DialogTitle>
          <DialogDescription>
            {selectedTarget
              ? 'Edite as informações do alvo abaixo.'
              : 'Preencha as informações para criar um novo alvo.'}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="grid h-fit w-full grid-cols-12 gap-4">
            <Input name="ds_id" label="DS ID" className="col-span-6" />
            <Input name="document" label="Documento" className="col-span-6" />
            <Input name="name" label="Nome" className="col-span-6" />
            <Input name="alias" label="Vulgo" className="col-span-6" />
            <Input name="email" label="Email" className="col-span-6" />
            <Input name="analyst" label="Analista" className="col-span-6" />

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
      </DialogContent>
    </Dialog>
  );
}
