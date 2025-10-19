import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import UserManagement from '@/components/admin/UserManagement';
import AdminCalendar from '@/components/admin/AdminCalendar';
import ConsultationManagement from '@/components/admin/ConsultationManagement';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  FileText, 
  Mail, 
  TrendingUp, 
  Activity,
  Shield,
  Database,
  Play,
  DollarSign
} from 'lucide-react';

import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      await loadDashboardData(isMounted);
    };
    fetchData();
    // Listen for tab change events from admin dropdown
    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };
    window.addEventListener('admin-tab-change', handleTabChange);
    return () => {
      isMounted = false;
      window.removeEventListener('admin-tab-change', handleTabChange);
    };
  }, [user?.id]);

  const loadDashboardData = async (isMounted = true) => {
    if (!user || !user.id || !isMounted) return;
    const MAX_RETRIES = 3;
    let lastError = null;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // Get dashboard metrics
        const callMetrics = () => supabase.rpc('get_dashboard_metrics');
        const { data: metricsData, error: metricsError } = await fetchWithTimeout(callMetrics, 10000);
        if (!isMounted) return;
        if (metricsError) throw metricsError;
        setMetrics(metricsData);

        // Get recent activity
        const callActivity = () => supabase
          .from('admin_activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        const { data: activityData, error: activityError } = await fetchWithTimeout(callActivity, 10000);
        if (!isMounted) return;
        if (activityError) throw activityError;
        setRecentActivity(activityData || []);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        console.error(`Intento ${i + 1} fallido:`, error);
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
        }
      } finally {
        if (i === MAX_RETRIES - 1 && isMounted) {
          setLoading(false);
        }
      }
    }
    if (lastError && isMounted) {
      // Opcional: mostrar toast de error si tienes sistema de notificaciones
      console.error('No se pudieron cargar los datos del dashboard después de varios intentos.');
    } else if (isMounted) {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend, description }) => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{title}</CardTitle>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center">
            <span className={`mr-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'}
            </span>
            {trend > 0 ? '+' : ''}{trend}% desde el mes pasado
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground leading-tight">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botón Cerrar Sesión */}
      <div className="flex justify-end container mx-auto pt-4">
        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            navigate('/login');
          }}
        >
          Cerrar Sesión
        </Button>
      </div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                <span className="truncate">Panel de Administración BSB Capital</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Gestión completa del negocio</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 self-start sm:self-auto">
              <Activity className="h-3 w-3 mr-1" />
              Sistema Activo
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-[640px] sm:min-w-0 grid-cols-7 gap-1 sm:gap-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3">Vista General</TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm px-2 sm:px-3">Usuarios</TabsTrigger>
              <TabsTrigger value="consultations" className="text-xs sm:text-sm px-2 sm:px-3">Consultorías</TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs sm:text-sm px-2 sm:px-3">Calendario</TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm px-2 sm:px-3">Contenido</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-3">Análisis</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 sm:px-3">Config.</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <MetricCard
                title="Usuarios Totales"
                value={metrics?.total_users || 0}
                icon={Users}
                trend={12}
                description="Usuarios activos en la plataforma"
              />
              <MetricCard
                title="Consultas Pendientes"
                value={metrics?.pending_consultations || 0}
                icon={Calendar}
                description="Consultas por confirmar"
              />
              <MetricCard
                title="Contenido Publicado"
                value={metrics?.total_content || 0}
                icon={Play}
                description="Videos y cursos disponibles"
              />
              <MetricCard
                title="Ingresos Mensuales"
                value={`€${metrics?.monthly_revenue || 0}`}
                icon={DollarSign}
                trend={8}
                description="Ingresos del mes actual"
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Acciones Rápidas</CardTitle>
                <CardDescription>Tareas de administración más comunes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Button 
                    onClick={() => setActiveTab('users')}
                    className="h-14 sm:h-16 flex flex-col p-2 sm:p-3"
                    variant="outline"
                  >
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                    <span className="text-xs sm:text-sm">Gestionar Usuarios</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('calendar')}
                    className="h-14 sm:h-16 flex flex-col p-2 sm:p-3"
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                    <span className="text-xs sm:text-sm">Ver Calendario</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('content')}
                    className="h-14 sm:h-16 flex flex-col p-2 sm:p-3"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                    <span className="text-xs sm:text-sm">Subir Contenido</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('analytics')}
                    className="h-14 sm:h-16 flex flex-col p-2 sm:p-3"
                    variant="outline"
                  >
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                    <span className="text-xs sm:text-sm">Ver Estadísticas</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate sm:whitespace-normal">{activity.action}</p>
                            <p className="text-gray-500 text-xs sm:text-sm">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Estado del Sistema</CardTitle>
                  <CardDescription>Salud y rendimiento de la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base">Base de Datos</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">Conectada</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base">Emails</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">Funcionando</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hotmart API</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Sincronizando</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Stripe</span>
                      <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <ConsultationManagement />
          </TabsContent>

          <TabsContent value="calendar">
            <AdminCalendar />
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Contenido</CardTitle>
                <CardDescription>Subir y gestionar contenido de Hotmart</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Módulo de gestión de contenido en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Análisis y Estadísticas</CardTitle>
                <CardDescription>Informes detallados del negocio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Módulo de análisis en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>Ajustes generales y configuración</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Módulo de configuración en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;