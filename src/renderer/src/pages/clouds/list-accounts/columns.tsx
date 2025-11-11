import { Button } from '@/renderer/src/components/ui/button';
import { parseDate } from '@/renderer/src/lib/parse-data';
import { Link } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { CloudDownload, Cloud as CloudIcon, Settings, MoreVertical, BugOff, ArrowUpDown, User } from 'lucide-react';
import { CopyToClipboard } from '@/renderer/src/components/copy-to-clipboard';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/renderer/src/components/ui/dropdown-menu';
import { toast } from '@/renderer/src/hooks/use-toast';
import { useTarget } from './useTargets';
import { formatBytes } from '@/renderer/src/lib/utils';

export type Account = {
  id: number;
  cloud_name: string;
  target_name?: string;
  output_dir: string;
  confidential_id: string;
  ds_id: string;
  email: string;
  cloud_size: string;
  total_links: number;
  downloaded_links: number;
  expiry_date?: string;
  links: Link[];
  status?: string;
  cloud_size_kb: number;
};

interface HandleDownloadFailedProps {
  output_dir: string;
  email: string;
  confidential_id: string;
}

interface HandleIpedProps {
  output_dir: string;
  email: string;
  ds_id: string;
}

function BlurColumn({ text }: { text: string }) {
  const { blurColumn } = useTarget();
  return <span className={`text-md ${blurColumn ? 'blur-sm' : ''}`}>{text}</span>;
}

export const columns: ColumnDef<Account>[] = [
  {
    accessorKey: 'status',
    id: 'status',
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    size: 70,
    cell: ({ row }) => {
      const queryClient = useQueryClient();
      const { setIsDialogOpen, setSelectedTarget } = useTarget();

      const handleDownloadCloud = async () => {
        await window.api.handleDownloadCloudByAccountId(row.original.id);
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      };

      const handleDownloadFailed = async ({ output_dir, email, confidential_id }: HandleDownloadFailedProps) => {
        const result = await window.api.handleDownloadFailed({ output_dir, email, confidential_id });
        if (result.success) {
          toast({
            title: result.message,
          });
        }
      };

      const handleProcessWithIped = async ({ output_dir, email, ds_id }: HandleIpedProps) => {
        const result = await window.api.handleIped({ output_dir, email, ds_id });
        if (result.success) {
          toast({
            title: result.message,
            variant: 'destructive',
          });
        }
      };

      const handleCreateTarget = () => {
        setSelectedTarget({
          id: row.original.id,
          email: row.original.email,
          name: '',
          ds_id: row.original.ds_id,
        });
        setIsDialogOpen(true);
      };

      return (
        <div className="flex items-center">
          <span className="ml-1 p-0">
            {row.original?.status && row.original.status === 'downloading' ? (
              <CloudIcon className="h-4 w-4 mx-1" />
            ) : (
              <CloudDownload className="h-4 w-4 mx-1" />
            )}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadCloud}>
                {row.original?.status && row.original.status === 'downloading' ? (
                  <CloudIcon className="h-4 w-4 mr-2" />
                ) : (
                  <CloudDownload className="h-4 w-4 mr-2" />
                )}
                Baixar nuvem
              </DropdownMenuItem>

              {!row.original.target_name && (
                <DropdownMenuItem onClick={handleCreateTarget}>
                  <User className="h-4 w-4 mr-2" />
                  Nomear alvo
                </DropdownMenuItem>
              )}

              {row.original?.status && row.original.status === 'downloading' && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      handleProcessWithIped({
                        output_dir: row.original.output_dir,
                        email: row.original.email,
                        ds_id: row.original.ds_id,
                      })
                    }
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Processar com IPED
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleDownloadFailed({
                        output_dir: row.original.output_dir,
                        email: row.original.email,
                        confidential_id: row.original.confidential_id,
                      })
                    }
                  >
                    <BugOff className="h-4 w-4 mr-2" />
                    Resolver downloads falhos
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    accessorKey: 'ds_id',
    header: 'DSID',
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <CopyToClipboard text={row.original.ds_id}>
            <BlurColumn text={row.original.ds_id} />
            </CopyToClipboard>
        </div>
      );
    },
  },
  {
    accessorKey: 'target_name',
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Alvo
          <ArrowUpDown className="ml-0 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <CopyToClipboard>{row.getValue('target_name')}</CopyToClipboard>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Email
          <ArrowUpDown className="ml-0 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <CopyToClipboard text={row.original.email}>
            <BlurColumn text={row.original.email} />
          </CopyToClipboard>
        </div>
      );
    },
  },
  {
    accessorKey: 'cloud_size_kb',
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Tamanho
          <ArrowUpDown className="ml-0 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="flex items-center">{formatBytes(Number(row.original.cloud_size))}</div>;
    },
  },
  {
    accessorKey: 'expiry_date',
    header: 'Expira em',
    cell: ({ row }) => {
      const date = row.getValue<string>('expiry_date');
      return parseDate(date);
    },
  },
];
