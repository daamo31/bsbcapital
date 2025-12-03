import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Clock, Crown, Calendar, Check, Star } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useMembership } from '@/hooks/useMembership';
import { 
  getConsultationPricing, 
  getMemberDiscountInfo, 
  formatPrice 
} from '@/lib/consultationPricing';
import { useToast } from '@/components/ui/feedback/use-toast';
import { useNavigate } from 'react-router-dom';

const ConsultationPricingCard = ({ 
  durationType, 
  title, 
  description, 
  features = [], 
  popular = false,
  onBooking = null
}) => {
  const { user } = useAuth();
  const { isActive: isMember, loading: membershipLoading, getConsultationDiscount } = useMembership();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, [user, durationType, isMember]);

  const loadPricing = async () => {
    try {
      const pricingData = await getConsultationPricing(durationType, user?.id);
      setPricing(pricingData);
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookConsultation = () => {
    if (!user) {
      toast({
        title: "Debes iniciar sesión",
        description: "Para reservar una consultoría necesitas tener una cuenta activa.",
        variant: "destructive"
      });
      // Redirigir al login después de mostrar el mensaje
      setTimeout(() => navigate('/auth/login'), 1500);
      return;
    }

    if (onBooking) {
      onBooking(durationType, pricing);
    } else {
      // Default behavior: navigate to booking page
      navigate(`/consultoria/agendar?type=${durationType}`);
    }
  };

  if (loading || membershipLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pricing) {
    return (
      <Card className="h-full border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error al cargar precios</p>
        </CardContent>
      </Card>
    );
  }

  const discountInfo = getMemberDiscountInfo(durationType);

  return (
    <Card className={`h-full relative ${popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Más Popular
          </Badge>
        </div>
      )}
      
      {isMember && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Descuento Miembro
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <p className="text-gray-600 text-sm">{description}</p>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{pricing.duration} minutos</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pricing Section */}
        <div className="text-center">
          {isMember && pricing.savings > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(pricing.final_price)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(pricing.regular_price)}
                </span>
              </div>
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                ¡Ahorras {formatPrice(pricing.savings)}! ({discountInfo?.discount_percentage}% desc.)
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(pricing.final_price)}
            </div>
          )}
          
          {!isMember && discountInfo && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Con membresía: {formatPrice(discountInfo.discounted_price)}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                ¡Ahorra {formatPrice(discountInfo.savings)} siendo miembro!
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">¿Qué incluye?</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <Button 
          onClick={handleBookConsultation}
          className={`w-full ${popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          size="lg"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {!user ? 'Iniciar sesión para reservar' : 'Agendar Consultoría'}
        </Button>

        {/* Member Benefits Notice */}
        {!isMember && (
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              ¿Quieres descuentos en todas las consultorías?
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/membresias')}
              className="text-xs"
            >
              <Crown className="h-3 w-3 mr-1" />
              Ver Membresías
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultationPricingCard;