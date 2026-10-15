import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/feedback/use-toast';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
import { Badge } from '@/components/ui/data-display/badge';
import { Download, Search, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

const AccessPanel = () => {
  const [accessData, setAccessData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stripeFilter, setStripeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccessData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('vw_access_summary').select('*');

      if (error) {
        console.error('Error fetching access data:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar datos',
          description: 'No se pudieron obtener los datos de acceso.',
        });
      } else {
        setAccessData(data);
      }
      setLoading(false);
    };

    fetchAccessData();
  }, [toast]);

  const filteredData = useMemo(() => {
    return accessData
      .filter((item) => (item.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((item) => stripeFilter === 'all' || item.stripe_status === stripeFilter);
  }, [accessData, searchTerm, stripeFilter]);

  const getStatusBadge = (status) => {
    if (!status) return <Badge variant="secondary">N/A</Badge>;
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
      case 'canceled':
        return <Badge variant="outline">Cancelado</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'refunded':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Reembolsado</Badge>;
      case 'chargeback':
        return <Badge className="bg-red-700 hover:bg-red-800">Chargeback</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Nombre', 'Stripe Status', 'Stripe Vence', 'Fecha Registro'];
    const rows = filteredData.map((item) => [
      item.email,
      item.name || '',
      item.stripe_status || 'N/A',
      item.stripe_expires ? formatDate(item.stripe_expires) : 'N/A',
      formatDate(item.created_at),
    ]);

    let csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'accesos_bsb_capital.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Helmet>
        <title>Panel de Accesos - BSB Capital</title>
      </Helmet>
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Panel de Accesos</h1>
            <p className="text-muted-foreground">Monitoriza los accesos de Stripe.</p>
          </div>
          <Button onClick={exportToCSV} disabled={loading || filteredData.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <div className="bg-card p-4 rounded-lg border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stripeFilter} onValueChange={setStripeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar Stripe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Stripe: Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-center">Stripe</TableHead>
                <TableHead className="text-right">Registrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.email}>
                    <TableCell className="font-medium">{item.email}</TableCell>
                    <TableCell>{item.name || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(item.stripe_status)}
                        {item.stripe_status === 'active' && (
                          <span className="text-xs text-muted-foreground">
                            Vence: {formatDate(item.stripe_expires)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatDate(item.created_at)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <footer className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            ¿Problemas? Contacta a{' '}
            <a href="mailto:info@bsbcapital.io" className="underline hover:text-primary">
              info@bsbcapital.io
            </a>
          </p>
        </footer>
      </div>
    </>
  );
};

export default AccessPanel;
