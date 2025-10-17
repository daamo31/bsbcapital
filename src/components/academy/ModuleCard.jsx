import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/feedback/progress';
import { Badge } from '@/components/ui/data-display/badge';
import { Play, CheckCircle, Lock, Crown } from 'lucide-react';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useNavigate } from 'react-router-dom';

const ModuleCard = ({ module, index }) => {
  const navigate = useNavigate();
  const { hasAccess, isLoading, userSubscription, contentData, hotmartData } = useUserAccess(`module_${module.id}`);

  const handleModuleClick = () => {
    if (hasAccess) {
      // Navegar a la página interna para mostrar el contenido de Hotmart
      navigate(`/academia/modulo/${module.id}`);
    } else {
      navigate('/membresias');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 border rounded-lg transition-all duration-200 ${
        hasAccess 
          ? 'hover:shadow-md hover:border-blue-300 cursor-pointer' 
          : 'bg-gray-50 border-gray-200'
      }`}
      onClick={hasAccess ? handleModuleClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-semibold ${hasAccess ? 'text-gray-900' : 'text-gray-500'}`}>
              {module.title}
            </h3>
            {module.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {!hasAccess && (
              <Lock className="h-4 w-4 text-gray-400" />
            )}
            {module.premium && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          
          <p className={`text-sm mb-3 ${hasAccess ? 'text-gray-600' : 'text-gray-400'}`}>
            {module.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <span>{module.lessons} lecciones</span>
            <span>{module.duration}</span>
          </div>
          
          {hasAccess ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso</span>
                <span>{module.progress}%</span>
              </div>
              <Progress value={module.progress} className="h-2" />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Contenido Premium
                  </p>
                  <p className="text-xs text-yellow-700">
                    {hotmartData?.error 
                      ? 'Error verificando acceso - intenta más tarde'
                      : userSubscription 
                        ? `Tu plan "${userSubscription.subscription_plans.name}" no incluye este módulo`
                        : 'Requiere suscripción activa en Hotmart'
                    }
                  </p>
                  {hotmartData?.status && (
                    <p className="text-xs text-gray-500 mt-1">
                      Estado Hotmart: {hotmartData.status}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="ml-4">
          {isLoading ? (
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
          ) : hasAccess ? (
            <Button
              size="sm"
              variant={module.progress > 0 ? "default" : "outline"}
            >
              {module.progress > 0 ? (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Continuar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Empezar
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/membresias');
              }}
            >
              <Crown className="h-4 w-4 mr-1" />
              Suscribirse
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ModuleCard;