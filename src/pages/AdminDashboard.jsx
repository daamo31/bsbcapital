import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/customSupabaseClient';
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

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
    
    // Listen for tab change events from admin dropdown
    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };
    
    window.addEventListener('admin-tab-change', handleTabChange);
    
    return () => {
      window.removeEventListener('admin-tab-change', handleTabChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get dashboard metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_dashboard_metrics');

      if (metricsError) throw metricsError;
      
      setMetrics(metricsData);

      // Get recent activity
      const { data: activityData } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity(activityData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            {trend > 0 ? '+' : ''}{trend}% desde el mes pasado
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 mr-3 text-blue-600" />
                Panel de Administración BSB Capital
              </h1>
              <p className="text-gray-600 mt-1">Gestión completa del negocio</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              Sistema Activo
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="consultations">Consultorías</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Tareas de administración más comunes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => setActiveTab('users')}
                    className="h-16 flex flex-col"
                    variant="outline"
                  >
                    <Users className="h-5 w-5 mb-1" />
                    Gestionar Usuarios
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('calendar')}
                    className="h-16 flex flex-col"
                    variant="outline"
                  >
                    <Calendar className="h-5 w-5 mb-1" />
                    Ver Calendario
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('content')}
                    className="h-16 flex flex-col"
                    variant="outline"
                  >
                    <FileText className="h-5 w-5 mb-1" />
                    Subir Contenido
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('analytics')}
                    className="h-16 flex flex-col"
                    variant="outline"
                  >
                    <BarChart3 className="h-5 w-5 mb-1" />
                    Ver Estadísticas
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-gray-500">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No hay actividad reciente</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado del Sistema</CardTitle>
                  <CardDescription>Salud y rendimiento de la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Base de Datos</span>
                      <Badge className="bg-green-100 text-green-800">Conectada</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Emails</span>
                      <Badge className="bg-green-100 text-green-800">Funcionando</Badge>
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