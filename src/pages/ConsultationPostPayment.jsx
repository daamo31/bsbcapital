import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { useToast } from '@/components/ui/feedback/use-toast';
import DetailedConsultationForm from '@/components/consultations/DetailedConsultationForm';
import FinancialPlanningForm from '@/components/consultations/forms/FinancialPlanningForm';
import OnboardingCryptoForm from '@/components/consultations/forms/OnboardingCryptoForm';
import GenericConsultationForm from '@/components/consultations/forms/GenericConsultationForm';
import TreasuryEnterpriseForm from '@/components/consultations/forms/TreasuryEnterpriseForm';
import {
  CheckCircle,
  Loader2,
  Calendar,
  Clock,
  User,
  TrendingUp,
  Target,
  AlertCircle,
} from 'lucide-react';
import emailService from '@/lib/emailService';

// Helper para formatear fechas de forma segura
const formatDate = (dateString, options) => {
  if (!dateString) return 'Pendiente de programar';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Pendiente de programar';
    return date.toLocaleDateString('es-ES', options);
  } catch {
    return 'Pendiente de programar';
  }
};

const formatTime = (dateString, options) => {
  if (!dateString) return 'Por confirmar';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Por confirmar';
    return date.toLocaleTimeString('es-ES', options);
  } catch {
    return 'Por confirmar';
  }
};

const ConsultationPostPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [consultation, setConsultation] = useState(null);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [isWaitingForDatabase, setIsWaitingForDatabase] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('');
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: user?.email || '',
    investment_experience: '',
    portfolio_size: '',
    consultation_goals: '',
    current_investments: '',
    specific_questions: '',
    preferred_communication: 'email',
    additional_notes: '',
  });

  // Función para determinar qué formulario mostrar según el tipo de consulta
  const getConsultationForm = (consultationType) => {
    console.log('🎯 Determinando formulario para tipo:', consultationType);

    switch (consultationType) {
      case 'financial_planning':
        return <FinancialPlanningForm formData={formData} setFormData={setFormData} />;
      case 'onboarding_crypto':
        return <OnboardingCryptoForm formData={formData} setFormData={setFormData} />;
      case 'crypto_advanced':
        return <TreasuryEnterpriseForm formData={formData} setFormData={setFormData} />;
      case 'portfolio':
      case 'strategy':
        // Por ahora usar genérico, más tarde añadiremos los específicos
        return <GenericConsultationForm formData={formData} setFormData={setFormData} />;
      default:
        return <GenericConsultationForm formData={formData} setFormData={setFormData} />;
    }
  };

  // Función para obtener el título del formulario
  const getFormTitle = (consultationType) => {
    const titles = {
      financial_planning: 'Formulario – Optimización de cartera',
      onboarding_crypto: 'Formulario – Onboarding cripto',
      portfolio: 'Formulario – Estrategias Crypto & Web3',
      crypto_advanced: 'Formulario – Gestión de tesorería cripto para empresas',
      strategy: 'Formulario de Consultoría',
    };
    return titles[consultationType] || 'Formulario de Consultoría';
  };

  // Función para obtener el nombre legible del tipo de consulta
  const getConsultationTypeName = (consultationType) => {
    const typeNames = {
      financial_planning: 'Optimización de cartera',
      onboarding_crypto: 'Onboarding Crypto',
      portfolio: 'Crypto y Web3',
      crypto_advanced: 'Gestión de tesorería',
      strategy: 'Consultoría estratégica',
    };
    return typeNames[consultationType] || consultationType || 'Consultoría General';
  };

  // Obtener datos de la consulta desde la URL
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const consultationId = searchParams.get('consultation_id');

    if (!sessionId && !consultationId) {
      // Redirigir si no hay parámetros válidos
      navigate('/consultoria');
      return;
    }

    const loadConsultationData = async () => {
      try {
        let consultationData = null;

        console.log('🔍 Cargando datos de consulta...');
        console.log('Session ID:', sessionId);
        console.log('Consultation ID:', consultationId);

        // Función para buscar la consulta
        const findConsultation = async () => {
          if (consultationId) {
            console.log('📋 Buscando por ID de consulta:', consultationId);
            const { data, error } = await supabase
              .from('consultations')
              .select('*')
              .eq('id', consultationId)
              .single();

            console.log('📋 Resultado búsqueda por ID:', { data, error });
            return { data, error };
          } else if (sessionId) {
            console.log('🔗 Buscando por session_id:', sessionId);
            const { data, error } = await supabase
              .from('consultations')
              .select('*')
              .eq('stripe_session_id', sessionId)
              .single();

            console.log('🔗 Resultado búsqueda por session:', { data, error });
            return { data, error };
          }
          return { data: null, error: { message: 'No ID provided' } };
        };

        // Primer intento
        let { data, error } = await findConsultation();

        // Si no encuentra la consulta, intentar con reintentos
        if (error || !data) {
          console.log('⏳ Consulta no encontrada, iniciando reintentos...');
          setIsWaitingForDatabase(true);

          const maxAttempts = 24; // 24 intentos × 5 segundos = 2 minutos
          let currentAttempt = 1;

          while (currentAttempt <= maxAttempts && (error || !data)) {
            const remainingTime = Math.ceil(((maxAttempts - currentAttempt) * 5) / 60);
            setWaitingMessage(
              `Verificando registro en base de datos... Intento ${currentAttempt}/${maxAttempts} (${remainingTime}min restantes)`
            );

            console.log(`� Reintento ${currentAttempt}/${maxAttempts}...`);

            // Esperar 5 segundos antes del siguiente intento
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Nuevo intento
            const result = await findConsultation();
            data = result.data;
            error = result.error;

            currentAttempt++;
          }

          setIsWaitingForDatabase(false);
          setWaitingMessage('');

          // Si después de todos los reintentos no se encuentra
          if (error || !data) {
            console.error('❌ Consulta no encontrada después de todos los reintentos');
            throw new Error(
              'La consulta no se ha registrado aún en el sistema. Por favor, espera unos minutos e inténtalo de nuevo, o contacta con soporte si el problema persiste.'
            );
          }
        }

        consultationData = data;

        console.log('🎯 Datos de consulta obtenidos:', consultationData);

        if (consultationData) {
          setConsultation(consultationData);
          console.log('✅ Consulta cargada exitosamente con ID:', consultationData.id);
          console.log('📋 Estado actual COMPLETO de la consulta:', consultationData);
          console.log('📋 Campos específicos:', {
            id: consultationData.id,
            status: consultationData.status,
            client_name: consultationData.client_name,
            client_email: consultationData.client_email,
            form_completed_at: consultationData.form_completed_at,
            stripe_session_id: consultationData.stripe_session_id,
            payment_status: consultationData.payment_status,
            // Campos del formulario detallado
            investment_experience: consultationData.investment_experience,
            portfolio_value: consultationData.portfolio_value,
            consultation_main_goal: consultationData.consultation_main_goal,
            consultation_expectations: consultationData.consultation_expectations,
            pre_consultation_comments: consultationData.pre_consultation_comments,
            description: consultationData.description,
          });

          // Pre-rellenar formulario con datos existentes (TODOS los campos de TODOS los tipos de formularios)
          const prefilledData = {
            // Campos básicos
            client_name: consultationData.client_name || '',
            client_email: consultationData.client_email || user?.email || '',
            telephone: consultationData.telephone || '', // Nueva columna

            // Campos del formulario genérico
            investment_experience: consultationData.investment_experience || '',
            portfolio_size: consultationData.portfolio_value || '', // portfolio_value en BD
            consultation_goals: consultationData.consultation_main_goal || '', // consultation_main_goal en BD
            consultation_main_goal: consultationData.consultation_main_goal || '', // También directo
            current_investments: consultationData.description?.includes('Inversiones actuales:')
              ? consultationData.description.split('Inversiones actuales: ')[1]?.split('\n')[0] ||
                ''
              : '',
            specific_questions: consultationData.consultation_expectations || '', // consultation_expectations en BD
            consultation_expectations: consultationData.consultation_expectations || '', // También directo
            preferred_communication: consultationData.description?.includes(
              'Preferencia de comunicación:'
            )
              ? consultationData.description
                  .split('Preferencia de comunicación: ')[1]
                  ?.split('\n')[0] || 'email'
              : 'email',
            additional_notes: consultationData.pre_consultation_comments || '', // pre_consultation_comments en BD
            pre_consultation_comments: consultationData.pre_consultation_comments || '', // También directo

            // Campos específicos de Financial Planning
            country: consultationData.country || '',
            age_range: consultationData.age_range || '',
            monthly_income_range: consultationData.monthly_income_range || '',
            savings_percentage: consultationData.savings_percentage || '',
            has_debts: consultationData.has_debts || '',
            time_horizon: consultationData.time_horizon || '',
            risk_tolerance: consultationData.risk_tolerance || '',
            priorities: consultationData.priorities || [],
            previous_advisor_experience: consultationData.previous_advisor_experience || '',

            // Campos específicos de Crypto Onboarding
            crypto_experience_level: consultationData.crypto_experience_level || '',
            crypto_knowledge_level: consultationData.crypto_knowledge_level || '',
            initial_crypto_capital: consultationData.initial_crypto_capital || '',
            crypto_interest_motivation: consultationData.crypto_interest_motivation || '',

            // Campos adicionales
            portfolio_value: consultationData.portfolio_value || '',
          };

          console.log('📝 Datos pre-rellenados del formulario:', prefilledData);

          setFormData((prev) => ({
            ...prev,
            ...prefilledData,
          }));

          console.log('✅ Formulario pre-rellenado completado');
        } else {
          console.error('❌ No se encontraron datos de consulta');
          throw new Error('No se encontraron datos de consulta');
        }
      } catch (error) {
        console.error('Error loading consultation:', error);

        setIsWaitingForDatabase(false);
        setWaitingMessage('');

        toast({
          variant: 'destructive',
          title: 'Error al cargar consulta',
          description:
            error.message ||
            'No se pudo cargar la información de la consulta. Si acabas de realizar el pago, espera unos minutos e inténtalo de nuevo.',
        });

        // No redirigir inmediatamente si es un error de sincronización
        if (error.message.includes('no se ha registrado aún')) {
          // Dar opción al usuario de reintentar
          setTimeout(() => {
            window.location.reload();
          }, 30000); // Recargar automáticamente en 30 segundos
        } else {
          navigate('/consultoria');
        }
      }
    };

    loadConsultationData();

    // Suscripción en tiempo real a cambios en la tabla consultations
    const channel = supabase
      .channel('consultations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'consultations' },
        (payload) => {
          loadConsultationData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchParams, user, navigate, toast]);

  const handleChange = (e) => {
    const updatedData = { ...formData, [e.target.id]: e.target.value };
    console.log(`📝 Campo actualizado: ${e.target.id} = "${e.target.value}"`);
    setFormData(updatedData);
  };

  const handleSelectChange = (name, value) => {
    const updatedData = { ...formData, [name]: value };
    console.log(`📝 Select actualizado: ${name} = "${value}"`);
    setFormData(updatedData);
  };

  const handleDetailedFormSubmit = async (detailedData) => {
    setLoading(true);

    try {
      // Actualizar la consulta con los datos detallados
      const { error: updateError } = await supabase
        .from('consultations')
        .update({
          // Estructura alineada con admin
          ...detailedData,
          form_completed_at: new Date().toISOString(),
          status: 'confirmed',
        })
        .eq('id', consultation.id);

      if (updateError) throw updateError;

      // Intentar enviar PDF por email (no bloquear si falla)
      try {
        const consultationPDFService = await import('@/lib/consultationPDFService');
        await consultationPDFService.default.sendConsultationSummaryEmail(
          consultation,
          detailedData,
          detailedData.client_email || consultation.client_email
        );

        toast({
          title: '¡Formulario completado!',
          description: 'Datos guardados y resumen enviado por email. Te contactaremos pronto.',
        });
      } catch (emailError) {
        console.error('Error sending PDF email:', emailError);
        toast({
          title: '¡Formulario completado!',
          description: 'Datos guardados correctamente. Te contactaremos pronto con los detalles.',
        });
      }

      // Redirigir a área cliente
      navigate('/area-cliente?tab=consultations');
    } catch (error) {
      console.error('Error updating consultation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hubo un problema al guardar tus datos. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🚀 USUARIO HACE CLIC EN ENVIAR FORMULARIO');
    console.log('📋 Datos del formulario en el momento del envío:', formData);
    console.log('🎯 ID de consulta:', consultation?.id);

    // Validación de campos requeridos
    if (
      !formData.client_name ||
      !formData.client_email ||
      (!formData.consultation_goals && !formData.consultation_main_goal)
    ) {
      console.log('❌ Validación fallida - campos requeridos:', {
        client_name: formData.client_name,
        client_email: formData.client_email,
        consultation_goals: formData.consultation_goals,
        consultation_main_goal: formData.consultation_main_goal,
      });

      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor, completa todos los campos obligatorios.',
      });
      return;
    }

    console.log('✅ Validación inicial pasada, continuando con envío...');

    // Validación específica según el tipo de consulta
    const consultationType = consultation.service;
    let isValidForType = true;

    switch (consultationType) {
      case 'financial_planning':
        isValidForType =
          formData.country &&
          formData.monthly_income_range &&
          formData.savings_percentage &&
          formData.has_debts &&
          formData.consultation_main_goal;
        break;
      case 'onboarding_crypto':
        isValidForType =
          formData.country &&
          formData.crypto_experience_level &&
          formData.crypto_knowledge_level &&
          formData.initial_crypto_capital &&
          formData.consultation_main_goal;
        break;
      case 'crypto_advanced':
        // Validación para formulario empresarial de gestión de tesorería
        isValidForType =
          formData.company_name &&
          formData.company_country &&
          formData.contact_person &&
          formData.crypto_usage &&
          formData.crypto_volume &&
          formData.main_treasury_goal &&
          formData.risk_profile &&
          formData.twelve_month_vision &&
          formData.legal_advice &&
          formData.operation_records &&
          formData.consultation_expectations;
        break;
      default:
        isValidForType = formData.consultation_main_goal || formData.consultation_goals;
        break;
    }

    if (!isValidForType) {
      console.log('❌ Validación específica del tipo fallida para:', consultationType);

      toast({
        variant: 'destructive',
        title: 'Campos requeridos incompletos',
        description: 'Por favor, completa todos los campos obligatorios marcados con (*)',
      });
      return;
    }

    console.log('✅ Validación específica del tipo pasada');

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.client_email)) {
      console.log('❌ Validación de email fallida:', formData.client_email);

      toast({
        variant: 'destructive',
        title: 'Email inválido',
        description: 'Por favor, introduce una dirección de correo válida.',
      });
      return;
    }

    console.log('✅ Validación de email pasada, iniciando actualización...');

    setLoading(true);

    console.log('=== INICIANDO ACTUALIZACIÓN DE CONSULTA ===');
    console.log('Consultation ID:', consultation.id);
    console.log('Form Data:', formData);
    console.log('Usuario autenticado:', user?.id);
    console.log('Email del usuario:', user?.email);

    try {
      // 📄 MAPEO DINÁMICO DE TODOS LOS CAMPOS DE LA TABLA (PRIMERO)
      const fieldLabels = {
        // Información básica
        client_name: 'Nombre del cliente',
        client_email: 'Email del cliente',
        telephone: 'Teléfono',
        client_phone: 'Teléfono (legacy)', // Mantener compatibilidad
        country: 'País de residencia',
        age_range: 'Rango de edad',

        // Objetivos y consultoría
        consultation_main_goal: 'Objetivo principal de la consultoría',
        consultation_expectations: 'Expectativas de la consultoría',
        pre_consultation_comments: 'Comentarios adicionales',

        // Experiencia financiera
        investment_experience: 'Experiencia en inversiones',
        portfolio_value: 'Valor aproximado de la cartera',
        monthly_income_range: 'Rango de ingresos mensuales',
        savings_percentage: 'Porcentaje destinado a ahorro',
        has_debts: 'Deudas relevantes',
        previous_advisor_experience: 'Experiencia previa con asesores',

        // Planificación financiera
        time_horizon: 'Horizonte temporal',
        risk_tolerance: 'Tolerancia al riesgo',
        priorities: 'Prioridades financieras',

        // Crypto específico
        crypto_experience_level: 'Experiencia en criptomonedas',
        crypto_knowledge_level: 'Nivel de conocimiento cripto',
        initial_crypto_capital: 'Capital inicial para cripto',
        crypto_interest_motivation: 'Motivación por el mundo cripto',

        // 🏢 Campos específicos empresariales
        company_name: 'Nombre de la empresa',
        company_country: 'País de residencia fiscal',
        company_website: 'Sitio web de la empresa',
        contact_person: 'Persona de contacto principal',
        crypto_usage: 'Uso actual de criptomonedas',
        crypto_volume: 'Volumen de criptoactivos',
        crypto_assets_exposure: 'Exposición a activos crypto',
        crypto_storage_location: 'Método de almacenamiento',
        main_treasury_goal: 'Objetivo principal de tesorería',
        risk_profile: 'Perfil de riesgo empresarial',
        twelve_month_vision: 'Visión a 12 meses',
        internal_controls: 'Controles internos',
        legal_advice: 'Asesoramiento legal especializado',
        operation_records: 'Sistema de registro de operaciones',

        // Comunicación
        preferred_communication: 'Preferencia de comunicación',

        // Campos del formulario genérico (fallbacks)
        consultation_goals: 'Objetivos de la consultoría',
        portfolio_size: 'Tamaño de cartera',
        current_investments: 'Inversiones actuales',
        specific_questions: 'Preguntas específicas',
        additional_notes: 'Notas adicionales',
      };

      // 📋 RECOPILAR TODOS LOS DATOS CON VALORES
      const allClientData = {};

      // Mapear todos los campos del formData
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'No especificado') {
          const label =
            fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

          // Formatear arrays y objetos
          if (Array.isArray(value)) {
            allClientData[label] = value.join(', ');
          } else if (typeof value === 'object') {
            allClientData[label] = JSON.stringify(value, null, 2);
          } else {
            allClientData[label] = value;
          }
        }
      });

      // 📄 CREAR JSON COMPLETO PARA GUARDAR Y ENVIAR
      const formDataJson = {
        timestamp: new Date().toISOString(),
        consultation_id: consultation.id,
        consultation_type: consultation.service,
        form_data: formData,
        client_responses: allClientData,
      };

      console.log('📋 DATOS DINÁMICOS RECOPILADOS:', allClientData);
      console.log('📄 JSON COMPLETO creado:', formDataJson);

      // Preparar datos para actualizar con mapeo completo
      const updateData = {
        // Campos básicos
        client_name: formData.client_name,
        client_email: formData.client_email,
        telephone: formData.telephone, // Nueva columna

        // Campos específicos según el formulario usado
        investment_experience: formData.investment_experience,
        portfolio_value: formData.portfolio_value || formData.portfolio_size,
        consultation_main_goal: formData.consultation_main_goal || formData.consultation_goals,
        consultation_expectations:
          formData.consultation_expectations || formData.specific_questions,
        pre_consultation_comments: formData.pre_consultation_comments || formData.additional_notes,

        // Campos específicos de planificación financiera
        country: formData.country,
        age_range: formData.age_range,
        monthly_income_range: formData.monthly_income_range,
        savings_percentage: formData.savings_percentage,
        has_debts: formData.has_debts,
        time_horizon: formData.time_horizon,
        risk_tolerance: formData.risk_tolerance,
        priorities: formData.priorities, // 🔧 Mantener como array para PostgreSQL
        previous_advisor_experience: formData.previous_advisor_experience,

        // Campos específicos de crypto
        crypto_experience_level: formData.crypto_experience_level,
        crypto_knowledge_level: formData.crypto_knowledge_level,
        initial_crypto_capital: formData.initial_crypto_capital,
        crypto_interest_motivation: formData.crypto_interest_motivation,

        // 🏢 Campos específicos empresariales (formulario de tesorería)
        company_name: formData.company_name,
        company_country: formData.company_country,
        company_website: formData.company_website,
        contact_person: formData.contact_person,
        crypto_usage: formData.crypto_usage,
        crypto_volume: formData.crypto_volume,
        crypto_assets_exposure: formData.crypto_assets_exposure,
        crypto_storage_location: formData.crypto_storage_location,
        main_treasury_goal: formData.main_treasury_goal,
        risk_profile: formData.risk_profile,
        twelve_month_vision: formData.twelve_month_vision,
        internal_controls: formData.internal_controls,
        legal_advice: formData.legal_advice,
        operation_records: formData.operation_records,

        // ✅ NUEVA COLUMNA JSON ESTRUCTURADA
        form_data_json: formDataJson,

        // Campos que van a description como respaldo (más limpio ahora)
        description: `Inversiones actuales: ${formData.current_investments || 'No especificado'}\nPreferencia de comunicación: ${formData.preferred_communication || 'Email'}${formData.crypto_interest_motivation ? '\nMotivación cripto: ' + formData.crypto_interest_motivation : ''}`,

        // Metadatos de completado
        status: 'confirmed',
        form_completed_at: new Date().toISOString(),
      };

      console.log('Datos a actualizar:', updateData);
      console.log('ID de consulta:', consultation.id);
      console.log('Tipo de ID:', typeof consultation.id);

      // PRIMERO: Verificar que la consulta existe
      const { data: existingConsultation, error: checkError } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultation.id)
        .single();

      console.log('🔍 Verificación de existencia DETALLADA:', {
        consultationId: consultation.id,
        found: !!existingConsultation,
        checkError,
        existingData: existingConsultation
          ? {
              id: existingConsultation.id,
              status: existingConsultation.status,
              client_name: existingConsultation.client_name,
              client_email: existingConsultation.client_email,
              created_at: existingConsultation.created_at,
              updated_at: existingConsultation.updated_at,
            }
          : null,
      });

      if (checkError) {
        console.error('❌ Error en verificación:', checkError);
        throw new Error(`Error al verificar la consulta: ${checkError.message}`);
      }

      if (!existingConsultation) {
        console.error('❌ La consulta no existe en la base de datos');
        console.error('❌ ID buscado:', consultation.id);
        throw new Error(`La consulta con ID ${consultation.id} no existe en la base de datos.`);
      }

      console.log('✅ Consulta verificada exitosamente:', existingConsultation.id);

      // VERIFICAR PERMISOS DEL USUARIO
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log('🔐 === DIAGNÓSTICO DE PERMISOS ===');
      console.log('🔐 Usuario autenticado ID:', user?.id);
      console.log('🔐 Usuario autenticado email:', user?.email);
      console.log('🔐 Usuario de la consulta ID:', existingConsultation.user_id);
      console.log('🔐 ¿IDs coinciden?:', user?.id === existingConsultation.user_id);
      console.log('🔐 Tipo de ID autenticado:', typeof user?.id);
      console.log('🔐 Tipo de ID consulta:', typeof existingConsultation.user_id);
      console.log('🔐 ID autenticado (raw):', JSON.stringify(user?.id));
      console.log('🔐 ID consulta (raw):', JSON.stringify(existingConsultation.user_id));

      // Si no coinciden, es el problema principal
      if (user?.id !== existingConsultation.user_id) {
        console.error('❌ PROBLEMA IDENTIFICADO: Los user_id no coinciden');
        console.error('❌ Esto explica por qué RLS bloquea la actualización');
        console.error('❌ El usuario autenticado no es el propietario de la consulta');

        // Intentar una consulta directa con auth para confirmar
        const { data: authTest, error: authError } = await supabase
          .from('consultations')
          .select('id, user_id, client_name')
          .eq('id', consultation.id);

        console.log('🔍 Consulta sin filtro de usuario:', { authTest, authError });

        throw new Error(
          `Usuario no autorizado. El registro pertenece a otro usuario. Auth ID: ${user?.id}, Record ID: ${existingConsultation.user_id}`
        );
      }

      console.log('✅ Verificación de permisos básica exitosa');

      // VERIFICACIÓN ADICIONAL DE PERMISOS RLS
      console.log('🔍 === TEST DE ACTUALIZACIÓN RLS ===');
      const { data: testUpdate, error: testError } = await supabase
        .from('consultations')
        .update({ updated_at: new Date().toISOString() }) // Actualización mínima
        .eq('id', consultation.id)
        .select('id, user_id, updated_at');

      console.log('🧪 Test de actualización resultado:', {
        success: !testError && testUpdate && testUpdate.length > 0,
        data: testUpdate,
        error: testError,
        rowsAffected: testUpdate?.length || 0,
      });

      if (testError) {
        console.error('❌ Error en test de actualización RLS:', testError);
        console.error('❌ Código:', testError.code);
        console.error('❌ Mensaje:', testError.message);
        console.error('❌ Detalles:', testError.details);
        console.error('❌ Hint:', testError.hint);
      }

      if (!testUpdate || testUpdate.length === 0) {
        console.error('❌ Test de actualización falló - RLS está bloqueando');
        console.error('❌ Esto confirma un problema de Row Level Security');
        console.error('❌ Revisar las políticas RLS en Supabase');

        throw new Error(
          `Test de permisos RLS falló. Verificar políticas de la tabla consultations.`
        );
      }

      console.log('✅ Test de permisos RLS exitoso');
      console.log('🚀 === PROCEDIENDO CON ACTUALIZACIÓN COMPLETA ===');

      console.log('📋 Datos a actualizar:', updateData);

      // INTENTAR ACTUALIZACIÓN CON VERIFICACIÓN DE USER_ID
      const { data: updatedData, error: updateError } = await supabase
        .from('consultations')
        .update(updateData)
        .eq('id', consultation.id)
        .eq('user_id', user?.id) // Agregar verificación de usuario
        .select('*');

      console.log('📊 RESULTADO ACTUALIZACIÓN:', {
        success: !updateError,
        updatedData,
        updateError,
        rowsAffected: updatedData?.length,
      });

      console.log('Resultado de la actualización:', { updatedData, updateError });
      console.log('Rows affected:', updatedData?.length);

      if (updateError) {
        console.error('❌ Error en la actualización:', updateError);
        console.error('❌ Error details:', updateError.message, updateError.details);
        console.error('❌ Error hint:', updateError.hint);
        console.error('❌ Error code:', updateError.code);

        // Si es un error de permisos, intentar con supabase admin
        if (updateError.code === 'PGRST116' || updateError.message.includes('permission')) {
          console.log('🔐 Intentando actualización con permisos administrativos...');

          // Aquí podríamos llamar a una función Edge para bypass RLS si es necesario
          throw new Error(
            `Error de permisos al actualizar la consulta. Contacta con soporte. Detalles: ${updateError.message}`
          );
        }

        throw updateError;
      }

      if (!updatedData || updatedData.length === 0) {
        console.error('❌ No se actualizaron filas. Verificar ID:', consultation.id);
        console.error('❌ Posibles causas:');
        console.error('  - Permisos RLS (Row Level Security)');
        console.error('  - Usuario no coincide con propietario de la consulta');
        console.error('  - ID de consulta inválido');

        // INTENTAR SIN RESTRICCIÓN DE USER_ID COMO FALLBACK
        console.log('🔄 Intentando actualización sin restricción de user_id...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('consultations')
          .update({
            ...updateData,
            form_completed_at: new Date().toISOString(),
            status: 'confirmed',
          })
          .eq('id', consultation.id)
          .select('*');

        console.log('🔄 Resultado fallback:', { fallbackData, fallbackError });

        if (fallbackError || !fallbackData || fallbackData.length === 0) {
          throw new Error(
            `No se pudo actualizar la consulta. ID no encontrado o permisos insuficientes. ID: ${consultation.id}`
          );
        }

        console.log('✅ Consulta actualizada con método fallback:', fallbackData[0]);
        return fallbackData[0];
      }

      console.log('✅ Consulta actualizada exitosamente:', updatedData[0]);

      // Enviar email de confirmación de consulta según el tipo
      try {
        console.log('=== ENVIANDO EMAIL DE CONFIRMACIÓN AL CLIENTE ===');
        console.log('Email del cliente:', formData.client_email);

        const consultationType = consultation.service || 'general';
        const emailData = {
          name: formData.client_name,
          email: formData.client_email,
          consultationType: consultation.service || consultation.title || 'Consultoría General',
          scheduledDate: formatDate(consultation.scheduled_at, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          scheduledTime: formatTime(consultation.scheduled_at, {
            hour: '2-digit',
            minute: '2-digit',
          }),
          duration: `${consultation.duration_minutes} minutos`,
          consultationGoals: formData.consultation_goals,
          meetingUrl: consultation.meeting_url || 'Se proporcionará antes de la consulta',
        };

        console.log('Datos del email de confirmación:', emailData);

        // Enviar email específico según el tipo de consultoría
        switch (consultationType) {
          case 'financial_planning':
          case 'portfolio':
            await emailService.sendConsultationPortfolioOptimization(emailData);
            console.log('✅ Email de confirmación de optimización de cartera enviado');
            break;
          case 'strategy':
          case 'crypto_advanced':
          case 'crypto_web3':
            await emailService.sendConsultationCryptoWeb3(emailData);
            console.log('✅ Email de confirmación crypto & web3 enviado');
            break;
          case 'onboarding_crypto':
            await emailService.sendConsultationCryptoOnboarding(emailData);
            console.log('✅ Email de confirmación onboarding crypto enviado');
            break;
          case 'treasury_crypto':
            await emailService.sendConsultationTreasuryCrypto(emailData);
            console.log('✅ Email de confirmación de gestión de tesorería crypto enviado');
            break;
          default:
            // Usar el método más genérico disponible como fallback
            await emailService.sendConsultationPortfolioOptimization(emailData);
            console.log(
              '⚠️ Tipo de consultoría no específico, usando template de optimización de cartera'
            );
        }
      } catch (emailError) {
        console.error('❌ Error sending confirmation email:', emailError);
        console.error('❌ Email error details:', {
          message: emailError.message,
          clientEmail: formData.client_email,
          emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email),
        });

        // Mostrar error específico al usuario
        toast({
          variant: 'destructive',
          title: 'Error en el correo de confirmación',
          description: emailError.message?.includes('Invalid')
            ? 'Verifica que tu dirección de correo sea correcta'
            : 'Hubo un problema enviando el correo. Contacta con soporte.',
        });
        // No bloquear el flujo si falla el email
      }

      // Enviar notificación a administradores sobre la nueva consultoría
      try {
        console.log('=== ENVIANDO EMAIL AL ADMIN ===');
        console.log('Email admin destino: info@bsbcapital.io');
        console.log('Consultation object:', consultation);
        console.log('📊 FormData COMPLETO al enviar admin email:', formData);

        // �️ MAPEO DINÁMICO DE TODOS LOS CAMPOS DE LA TABLA
        const fieldLabels = {
          // Información básica
          client_name: 'Nombre del cliente',
          client_email: 'Email del cliente',
          telephone: 'Teléfono',
          client_phone: 'Teléfono (legacy)', // Mantener compatibilidad
          country: 'País de residencia',
          age_range: 'Rango de edad',

          // Objetivos y consultoría
          consultation_main_goal: 'Objetivo principal de la consultoría',
          consultation_expectations: 'Expectativas de la consultoría',
          pre_consultation_comments: 'Comentarios adicionales',

          // Experiencia financiera
          investment_experience: 'Experiencia en inversiones',
          portfolio_value: 'Valor aproximado de la cartera',
          monthly_income_range: 'Rango de ingresos mensuales',
          savings_percentage: 'Porcentaje destinado a ahorro',
          has_debts: 'Deudas relevantes',
          previous_advisor_experience: 'Experiencia previa con asesores',

          // Planificación financiera
          time_horizon: 'Horizonte temporal',
          risk_tolerance: 'Tolerancia al riesgo',
          priorities: 'Prioridades financieras',

          // Crypto específico
          crypto_experience_level: 'Experiencia en criptomonedas',
          crypto_knowledge_level: 'Nivel de conocimiento cripto',
          initial_crypto_capital: 'Capital inicial para cripto',
          crypto_interest_motivation: 'Motivación por el mundo cripto',

          // Comunicación
          preferred_communication: 'Preferencia de comunicación',

          // Campos del formulario genérico (fallbacks)
          consultation_goals: 'Objetivos de la consultoría',
          portfolio_size: 'Tamaño de cartera',
          current_investments: 'Inversiones actuales',
          specific_questions: 'Preguntas específicas',
          additional_notes: 'Notas adicionales',
        };

        // 📋 RECOPILAR TODOS LOS DATOS CON VALORES
        const allClientData = {};

        // Mapear todos los campos del formData
        Object.entries(formData).forEach(([key, value]) => {
          if (value && value !== '' && value !== 'No especificado') {
            const label =
              fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

            // Formatear arrays y objetos
            if (Array.isArray(value)) {
              allClientData[label] = value.join(', ');
            } else if (typeof value === 'object') {
              allClientData[label] = JSON.stringify(value, null, 2);
            } else {
              allClientData[label] = value;
            }
          }
        });

        // 📄 CREAR JSON COMPLETO PARA GUARDAR Y ENVIAR
        const formDataJson = {
          timestamp: new Date().toISOString(),
          consultation_id: consultation.id,
          consultation_type: consultation.service,
          form_data: formData,
          client_responses: allClientData,
        };

        console.log('📋 DATOS DINÁMICOS RECOPILADOS:', allClientData);
        console.log('📄 JSON COMPLETO:', formDataJson);

        const adminEmailData = {
          clientName: formData.client_name || 'No especificado',
          clientEmail: formData.client_email || 'No especificado',
          phone: formData.telephone || formData.client_phone || 'No especificado',
          consultationType: consultation.service || consultation.title || 'Consultoría General',
          preferredDate: consultation.scheduled_at
            ? formatDate(consultation.scheduled_at, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Pendiente de programar',
          preferredTime: consultation.scheduled_at
            ? formatTime(consultation.scheduled_at, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Por confirmar',
          duration: consultation.duration_minutes
            ? `${consultation.duration_minutes} minutos`
            : 'No especificado',
          price: consultation.amount
            ? `€${consultation.amount}`
            : consultation.duration_minutes === 30
              ? '€200'
              : consultation.duration_minutes === 45
                ? '€300'
                : consultation.duration_minutes === 60
                  ? '€300'
                  : '€167',
          paymentId: consultation.stripe_payment_intent_id || 'No especificado',
          consultationId: consultation.id || 'No especificado',

          // ✅ DATOS DINÁMICOS - Todos los campos con valores
          clientResponses: allClientData,
          formDataJson: JSON.stringify(formDataJson, null, 2),

          // ✅ Campos específicos para CRYPTO ADVANCED / TREASURY ENTERPRISE
          consultationGoals:
            formData.twelve_month_vision ||
            formData.consultation_expectations ||
            allClientData['Visión a 12 meses'] ||
            allClientData['Expectativas de la consultoría'] ||
            allClientData['Objetivo principal de la consultoría'] ||
            'No especificado',

          investmentExperience:
            formData.crypto_usage ||
            allClientData['Uso actual de cripto en tesorería'] ||
            allClientData['Experiencia en criptomonedas'] ||
            allClientData['Experiencia previa con asesores'] ||
            'No especificado',

          portfolioSize:
            formData.crypto_volume ||
            allClientData['Volumen aproximado de criptoactivos'] ||
            allClientData['Capital inicial para cripto'] ||
            allClientData['Rango de ingresos mensuales'] ||
            'No especificado',

          currentInvestments:
            formData.crypto_assets_exposure ||
            allClientData['Tipo de activos cripto'] ||
            allClientData['Inversiones actuales'] ||
            allClientData['Porcentaje destinado a ahorro'] ||
            'No especificado',

          specificQuestions:
            formData.consultation_expectations ||
            allClientData['Expectativas de la consultoría'] ||
            allClientData['Preguntas específicas'] ||
            allClientData['Motivación por el mundo cripto'] ||
            'No especificado',

          preferredCommunication:
            formData.preferred_communication ||
            allClientData['Preferencia de comunicación'] ||
            'Email',

          additionalInfo:
            [
              // 🏢 Datos empresariales específicos
              formData.company_name ? `🏢 Empresa: ${formData.company_name}` : null,
              formData.company_country ? `🌍 País: ${formData.company_country}` : null,
              formData.company_website ? `🔗 Web: ${formData.company_website}` : null,
              formData.contact_person ? `👤 Contacto: ${formData.contact_person}` : null,

              // 💰 Situación cripto actual
              formData.crypto_storage_location
                ? `💾 Almacenamiento: ${formData.crypto_storage_location}`
                : null,
              formData.main_treasury_goal
                ? `🎯 Objetivo tesorería: ${formData.main_treasury_goal}`
                : null,
              formData.risk_profile ? `⚖️ Perfil riesgo: ${formData.risk_profile}` : null,

              // ⚖️ Control y compliance
              formData.internal_controls
                ? `🔒 Controles internos: ${formData.internal_controls}`
                : null,
              formData.legal_advice ? `⚖️ Asesoría legal: ${formData.legal_advice}` : null,
              formData.operation_records
                ? `📊 Registro operaciones: ${formData.operation_records}`
                : null,

              // 📝 Información adicional
              formData.additional_info
                ? `📝 Información adicional: ${formData.additional_info}`
                : null,

              // Campos dinámicos generales
              allClientData['Comentarios adicionales'],
              allClientData['Notas adicionales'],
              allClientData['Prioridades financieras'],
              allClientData['Horizonte temporal'],
              allClientData['Tolerancia al riesgo'],
              allClientData['País de residencia'],
              allClientData['Rango de edad'],
            ]
              .filter(Boolean)
              .join('\n') || 'Sin información adicional',

          // ✅ Metadatos
          timestamp: new Date().toISOString(),
          source: `Formulario post-pago - ${consultation.service === 'crypto_advanced' ? 'Treasury Enterprise' : 'Consultoría General'}`,
        };

        console.log('📧 Datos del email al admin (FINALES):', adminEmailData);

        const adminEmailResult =
          await emailService.sendAdminConsultationNotification(adminEmailData);

        console.log('Resultado del email al admin:', adminEmailResult);

        if (adminEmailResult.success) {
          console.log('✅ Email de notificación al admin enviado correctamente');
        } else {
          console.error('❌ Error en email al admin:', adminEmailResult.error);
        }
      } catch (adminEmailError) {
        console.error('❌ Error sending admin notification email:', adminEmailError);
        console.error('❌ Admin email error details:', {
          message: adminEmailError.message,
          clientEmail: formData.client_email,
          timestamp: new Date().toISOString(),
        });

        // No mostrar error al usuario para emails internos, pero registrar
        console.warn('⚠️ Notificación admin falló, pero el proceso continúa');
        // No bloquear el flujo si falla el email admin
      }

      toast({
        title: '¡Consulta confirmada!',
        description:
          'Hemos registrado tus datos. Te contactaremos pronto con los detalles de la reunión.',
      });

      // Redirigir a página de éxito o dashboard
      navigate('/area-cliente?tab=consultations');
    } catch (error) {
      console.error('Error updating consultation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hubo un problema al guardar tus datos. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!consultation || isWaitingForDatabase) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isWaitingForDatabase ? 'Verificando registro...' : 'Cargando consulta...'}
          </h2>
          {waitingMessage && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{waitingMessage}</p>
              <div className="text-xs text-gray-500">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                El sistema está sincronizando tu pago. Esto puede tomar unos momentos.
              </div>
            </div>
          )}
          {!isWaitingForDatabase && (
            <p className="text-sm text-gray-600">Preparando tu formulario de consultoría...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Completar Información - Consultoría BSB Capital</title>
        <meta
          name="description"
          content="Completa tu información para personalizar tu consultoría financiera."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-6 sm:py-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-8">
          {/* Header de éxito */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¡Pago Procesado Exitosamente!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Para personalizar tu consultoría y asegurar que obtienes el máximo valor, necesitamos
              algunos datos adicionales sobre tu situación financiera.
            </p>
          </motion.div>

          {/* Información de la consulta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center text-green-800">
                  <Calendar className="h-5 w-5 mr-2" />
                  Detalles de tu Consultoría
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Tipo</p>
                      <p className="font-medium">{getConsultationTypeName(consultation.service)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium">
                        {formatDate(consultation.scheduled_at, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Hora y Duración</p>
                      <p className="font-medium">
                        {formatTime(consultation.scheduled_at, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        - {consultation.duration_minutes} min
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Formulario de datos adicionales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información para Personalizar tu Consultoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Información del tipo de consulta */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {getFormTitle(consultation.service)}
                      </h4>
                      <p className="text-sm text-blue-700">
                        Formulario específico para tu tipo de consultoría:{' '}
                        <span className="font-medium">{consultation.service || 'general'}</span>
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {consultation.service || 'general'}
                    </div>
                  </div>
                </div>

                {/* Formulario dinámico según el tipo de consulta */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Campos básicos para todos los tipos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-gray-200">
                    <div>
                      <Label htmlFor="client_name">Nombre completo *</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        placeholder="Tu nombre completo"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_email">Email de contacto *</Label>
                      <Input
                        id="client_email"
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                        placeholder="tu@email.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Formulario específico según el tipo de consulta */}
                  {getConsultationForm(consultation.service)}

                  {/* Información importante */}
                  <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">¿Qué sucede después?</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Recibirás un email de confirmación con todos los detalles</li>
                        <li>
                          • Te contactaremos 24-48h antes para confirmar y enviar el enlace de
                          reunión
                        </li>
                        <li>• Prepararemos material personalizado basado en tu información</li>
                        <li>
                          • Después de la consulta recibirás un resumen y recomendaciones por
                          escrito
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Botón de acción con mejora para móvil */}
                  <div className="pt-6 pb-8 sm:pb-6 sticky bottom-0 bg-white sm:bg-transparent sm:static p-4 sm:p-0 -mx-4 sm:mx-0 border-t sm:border-t-0 mt-6">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-full h-12 text-base font-medium"
                      size="lg"
                      onClick={() => console.log('🖱️ BOTÓN CONFIRMAR CLICKED!')}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar Consultoría
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ConsultationPostPayment;
