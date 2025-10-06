import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Settings, ArrowRight } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

const AdminNotification = () => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) return null;

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-200 rounded-full">
              <Shield className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Acceso de Administrador</h3>
              <p className="text-sm text-orange-700">
                Tienes acceso completo al panel de administración del sistema
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-200">
            <Link to="/admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Panel de Admin
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminNotification;