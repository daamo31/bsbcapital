import React from 'react';
import { useUserAccess } from '@/hooks/useUserAccess';

// Ejemplo de uso en un componente de video
const VideoComponent = ({ videoId, title, description }) => {
  const { hasAccess, isLoading, userSubscription } = useUserAccess(videoId);

  if (isLoading) {
    return <div>Verificando acceso...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-yellow-800">
            Este contenido requiere una suscripción activa.
          </p>
          {userSubscription ? (
            <p className="text-sm mt-2">
              Tu suscripción actual: {userSubscription.subscription_plans.name}
            </p>
          ) : (
            <p className="text-sm mt-2">
              <a href="/membresias" className="text-blue-600 underline">
                Ver planes de suscripción
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <video controls className="w-full">
        <source src={`/videos/${videoId}.mp4`} type="video/mp4" />
      </video>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
};

// Ejemplo de uso en un componente de curso
const CourseComponent = ({ courseId, modules }) => {
  const { hasAccess, userSubscription } = useUserAccess(courseId);

  return (
    <div className="space-y-4">
      {modules.map((module, index) => {
        const moduleAccess = useUserAccess(module.id);
        
        return (
          <div key={module.id} className="border rounded-lg p-4">
            <h4 className="font-semibold">{module.title}</h4>
            
            {moduleAccess.hasAccess ? (
              <div className="mt-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                  Ver módulo
                </button>
              </div>
            ) : (
              <div className="mt-2 bg-gray-50 p-3 rounded">
                <p className="text-gray-600 text-sm">
                  Módulo bloqueado - Requiere suscripción
                </p>
                {userSubscription && (
                  <p className="text-xs text-gray-500 mt-1">
                    Plan actual: {userSubscription.subscription_plans.name}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { VideoComponent, CourseComponent };