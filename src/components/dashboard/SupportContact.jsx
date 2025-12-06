import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Mail, Clock, MessageSquare } from 'lucide-react';

const SupportContact = () => {
  return (
    <div className="space-y-6">
      {/* Información de contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contacto y Soporte
          </CardTitle>
          <CardDescription>¿Necesitas ayuda? Contacta con nuestro equipo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Mail className="h-6 w-6 text-brand-accent mt-0.5" />
            <div>
              <h4 className="font-semibold text-base mb-1">Email</h4>
              <a
                href="mailto:info@bsbcapital.io"
                className="text-brand-accent hover:underline text-base"
              >
                info@bsbcapital.io
              </a>
              <p className="text-sm text-gray-500 mt-1">Respuesta en 24-48 horas</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Clock className="h-6 w-6 text-brand-accent mt-0.5" />
            <div>
              <h4 className="font-semibold text-base mb-1">Horario de Atención</h4>
              <p className="text-gray-700">Lunes a Viernes: 9:00 - 21:00</p>
              <p className="text-sm text-gray-500 mt-1">Fin de semana: Cerrado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <details className="group border-b pb-3">
            <summary className="font-semibold cursor-pointer hover:text-brand-accent transition-colors py-2">
              ¿Cómo cancelo mi suscripción?
            </summary>
            <p className="text-sm text-gray-600 mt-2 pl-4">
              Ve a la pestaña "Suscripciones" y haz clic en "Abrir Portal de Gestión". Desde allí
              podrás cancelar tu suscripción de forma segura.
            </p>
          </details>

          <details className="group border-b pb-3">
            <summary className="font-semibold cursor-pointer hover:text-brand-accent transition-colors py-2">
              ¿Cuándo se procesará mi pago?
            </summary>
            <p className="text-sm text-gray-600 mt-2 pl-4">
              Los pagos se procesan automáticamente según la fecha de renovación que aparece en tu
              suscripción.
            </p>
          </details>

          <details className="group border-b pb-3">
            <summary className="font-semibold cursor-pointer hover:text-brand-accent transition-colors py-2">
              ¿Cómo accedo a mis servicios contratados?
            </summary>
            <p className="text-sm text-gray-600 mt-2 pl-4">
              En la pestaña "Mis Servicios" encontrarás todos los servicios activos con enlaces de
              acceso directo.
            </p>
          </details>

          <details className="group">
            <summary className="font-semibold cursor-pointer hover:text-brand-accent transition-colors py-2">
              ¿Puedo cambiar mi método de pago?
            </summary>
            <p className="text-sm text-gray-600 mt-2 pl-4">
              Sí, ve al portal de gestión de suscripciones donde podrás actualizar tu tarjeta y
              datos de facturación.
            </p>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportContact;
