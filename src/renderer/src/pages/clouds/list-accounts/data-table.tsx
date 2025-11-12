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


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
}

export function DataTable<TData, TValue>({ columns, data, isLoading }: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
 

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
        return ['email', 'confidential_id', 'ds_id', 'target_name'].some((field) => {
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Filtrar por: DSID, Confidential e email"
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button variant="outline" size="sm" onClick={handleSelectDirectory}>
          Baixar .csv
        </Button>
      </div>
      <ScrollArea className="rounded-md border h-[calc(100vh-9rem)]">
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? 'Carregando...' : 'Sem resultados.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
