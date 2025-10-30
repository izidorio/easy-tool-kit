import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  FilterFnOption,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Input } from '@renderer/components/ui/input';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@renderer/components/ui/table';
import { useState } from 'react';
import { Button } from '@/renderer/src/components/ui/button';
import { toast } from '@/renderer/src/hooks/use-toast';
import { ScrollArea } from '@/renderer/src/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { Cloud } from '@/types';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const nav = useNavigate();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      fuzzy: (row, _, value) => {
        const data = row.original;
        const search = value.toLowerCase();
        return ['name'].some((field) => {
          if (typeof data[field] === 'string') {
            return data[field].toString().toLowerCase().includes(search);
          }
          return false;
        });
      },
    },
    globalFilterFn: 'fuzzy' as FilterFnOption<TData>,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      globalFilter,
      sorting,
    },
  });

  const handleSelectDirectory = async () => {
    const path = await window.api.selectDirectory();
    if (path) {
      // methods.setValue('output_dir', path);
      await window.api.exportAccounts(path, data);
      toast({
        title: 'Sucesso',
        description: 'Dados exportados com sucesso',
      });
      return;
    }
  };

  async function createCloud() {
    const id = await window.api.createCloudDraft();
    nav(`/cloud/${id}`);
  }

  function handleGoAccounts(cloud: Cloud) {
    if (cloud.status === 'discovering') {
      nav(`/list-accounts/${cloud.id}`);
      return;
    }

    nav(`/cloud/${cloud.id}`);
  }

  return (
    <div className="w-[40rem] h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filtrar por: Nome"
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-[20rem] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectDirectory}>
            Baixar .csv
          </Button>
          <Button variant="outline" size="sm" onClick={createCloud}>
            Criar nuvem
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-11rem)] rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleGoAccounts(row.original as Cloud)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
