import React from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Star, Crown, Diamond } from 'lucide-react';
import { Link } from 'react-router-dom';

const MembershipGate = ({ 
  children, 
  requiredLevel = 0, 
  requiredTier = null,
  fallbackContent = null 
}) => {
  const { hasAccessLevel, canAccessContent, membershipTier, accessLevel, loading } = useAdmin();

  if (loading) {
    return <div className="flex justify-center p-4">Cargando...</div>;
  }

  // Verificar acceso por nivel
  const hasLevelAccess = hasAccessLevel(requiredLevel);
  
  // Verificar acceso por tier específico
  const hasTierAccess = requiredTier ? 
    membershipTier === requiredTier || hasAccessLevel(3) : true;

  if (hasLevelAccess && hasTierAccess) {
    return children;
  }

  // Si hay contenido de fallback personalizado
  if (fallbackContent) {
    return fallbackContent;
  }

  // Mensaje por defecto basado en el nivel requerido
  const getUpgradeMessage = () => {
    switch (requiredLevel) {
      case 1:
        return {
          title: "Contenido del Trader Plan Pro",
          description: "Necesitas el Trader Plan Pro para acceder a este contenido.",
          icon: <Star className="h-6 w-6" />,
          color: "border-blue-200 bg-blue-50",
          badgeColor: "bg-blue-100 text-blue-800"
        };
      case 2:
        return {
          title: "Contenido Premium Investor",
          description: "Este contenido está disponible para miembros Premium Investor.",
          icon: <Crown className="h-6 w-6" />,
          color: "border-purple-200 bg-purple-50",
          badgeColor: "bg-purple-100 text-purple-800"
        };
      case 3:
        return {
          title: "Contenido Wealth Membership",
          description: "Acceso exclusivo para miembros Wealth Membership.",
          icon: <Diamond className="h-6 w-6" />,
          color: "border-gold-200 bg-amber-50",
          badgeColor: "bg-amber-100 text-amber-800"
        };
      default:
        return {
          title: "Contenido Restringido",
          description: "Necesitas una membresía para acceder.",
          icon: <Lock className="h-6 w-6" />,
          color: "border-gray-200 bg-gray-50",
          badgeColor: "bg-gray-100 text-gray-800"
        };
    }
  };

  const upgradeMessage = getUpgradeMessage();

  return (
    <Card className={`${upgradeMessage.color} border-2`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
          {upgradeMessage.icon}
        </div>
        <CardTitle className="text-xl">{upgradeMessage.title}</CardTitle>
        <div className="flex justify-center gap-2 mt-2">
          <Badge className={upgradeMessage.badgeColor}>
            Nivel {requiredLevel} requerido
          </Badge>
          <Badge variant="outline">
            Tu nivel: {accessLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">{upgradeMessage.description}</p>
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link to="/membresias">
              Ver Planes
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contacto">
              Contactar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipGate;