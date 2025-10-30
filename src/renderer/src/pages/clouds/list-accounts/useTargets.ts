import { create } from 'zustand';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

import { Target } from '@/types';
import { queryClient } from '@/renderer/src/providers';
import { toast } from '@/renderer/src/hooks/use-toast';

type TargetStore = {
  selectedTarget: Target | null;
  isDialogOpen: boolean;
  isLoading: boolean;
  error: string | null;
  setSelectedTarget: (target: Target | null) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetValue: () => void;
};

const initialState = {
  selectedTarget: null,
  isDialogOpen: false,
  isLoading: false,
  error: null,
};

export const useState = create<TargetStore>((set) => ({
  ...initialState,
  setSelectedTarget: (target) => set({ selectedTarget: target }),
  setIsDialogOpen: (isOpen) => set({ isDialogOpen: isOpen }),
  setIsLoading: (isLoading) => set({ isLoading }),
  resetValue: () => set({ selectedTarget: defaultValues }),
}));

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  alias: z.string().optional().nullable(),
  ds_id: z.string().min(1, 'DS ID é obrigatório'),
  document: z.string().optional().nullable(),
  analyst: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues = {
  id: null,
  name: '',
  alias: '',
  ds_id: '',
  document: '',
  analyst: '',
  email: '',
};
export const useTarget = () => {
  const {
    resetValue,
    selectedTarget,
    isDialogOpen,
    isLoading,
    error,
    setSelectedTarget,
    setIsDialogOpen,
    setIsLoading,
  } = useState();

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (selectedTarget) {
      methods.reset(selectedTarget);
    }
  }, [selectedTarget]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name.toUpperCase(),
      ds_id: data.ds_id,
      alias: data.alias?.toUpperCase() || undefined,
      document: data.document || undefined,
      analyst: data.analyst?.toUpperCase() || undefined,
      email: data.email || undefined,
    };

    console.log(payload);

    try {
      const result = await window.api.createTarget(payload);
      if (result.error) {
        throw new Error(result.error);
      }

      queryClient.invalidateQueries({ queryKey: ['accounts'] });

      setIsDialogOpen(false);
      setSelectedTarget(null);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Erro ao salvar alvo',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  return {
    selectedTarget,
    isDialogOpen,
    isLoading,
    error,
    setSelectedTarget,
    setIsDialogOpen,
    setIsLoading,
    methods,
    onSubmit,
    resetValue,
  };
};
