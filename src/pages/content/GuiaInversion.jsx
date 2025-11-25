import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Briefcase, BookOpen, Repeat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/data-display/card';

const phases = {
  phase1: {
    question: "¿Quién eres?",
    options: [
      { text: "Persona", nextPhase: "phase2" },
      { text: "Empresa", service: "gestion-tesoreria-cripto" }
    ]
  },
  phase2: {
    question: "¿Cuál de estas opciones describe mejor tu situación actual?",
    options: [
      { text: "Quiero aprender a invertir en crypto por mi cuenta", nextPhase: "phase3_nuevo" },
      { text: "Ya invierto en cripto y quiero mejorar mis estrategias", nextPhase: "phase3_inversor" },
      { text: "Soy profesional o asesoro a otros", nextPhase: "phase3_asesor" }
    ]
  },
  phase3_nuevo: {
    question: "¿Cuál es tu objetivo principal?",
    options: [
      { text: "Quiero aprender a invertir en crypto por mi cuenta", service: "bsb-academy" },
      { text: "Prefiero recibir orientación personalizada", service: "onboarding-cripto" }
    ]
  },
  phase3_inversor: {
    question: "¿Cuál es tu objetivo principal?",
    options: [
      { text: "Optimizar mis inversiones en cripto y mejorar mis decisiones de cartera", service: "optimizacion-carteras" },
      { text: "Aprender nuevos conceptos que se transformen en rentabilidad", service: "bsb-academy-inversor" },
      { text: "Contar con herramientas que simplifiquen mis decisiones y estrategias", service: "bsb-maker" },
      { text: "Gestionar mi cartera de forma profesional y maximizar resultados", service: "inversor-premium" }
    ]
  },
  phase3_asesor: {
    question: "¿Qué necesitas para tu desarrollo profesional?",
    options: [
      { text: "Optimizar estrategias de clientes con acompañamiento estratégico", service: "consultoria-crypto-web3" },
      { text: "Ampliar conocimientos y herramientas sin depender de nadie", service: "bsb-academy-asesor" }
    ]
  }
};

const serviceInfo = {
  "gestion-tesoreria-cripto": {
    title: "Paquete Gestión de tesorería crypto para empresa",
    description: "2 consultorías personalizadas (1h cada una):\n- Análisis inicial de la estructura financiera: revisión de wallets, exchanges, custodias y flujos de capital.\n- Diseño del plan de gestión de tesorería crypto: estrategias de diversificación, liquidez y cobertura frente a la volatilidad.\n- Implantación de herramientas y protocolos de control (seguridad, reporting, compliance).\nSeguimiento mensual (6 meses): para evaluar resultados, ajustar estrategias y asegurar un crecimiento sostenido.",
    details: "• 2 consultorías personalizadas (1h cada una)\n• Plan de tesorería y estructura de cartera corporativa\n• Seguimiento mensual (6 meses)",
    icon: <Briefcase className="h-8 w-8 text-brand-primary" />,
    link: "/membresias"
  },
  "bsb-academy": {
    title: "BSB Academy",
    description: "Aprende a invertir en cripto de forma sólida, práctica y a tu ritmo. Nuestra Academia te ofrece los conocimientos esenciales para entender los mercados, gestionar riesgos y construir tus propias estrategias desde cero, sin depender de nadie.",
    icon: <BookOpen className="h-8 w-8 text-brand-primary" />,
    link: "/academia"
  },
  "onboarding-cripto": {
    title: "Paquete Onboarding Cripto",
    description: "Acceso a Academia anual",
    details: "• 2 consultorías de 1h\n• Acceso a Academia 1 año\n• Dossier de buenas prácticas",
    icon: <Bot className="h-8 w-8 text-brand-primary" />,
    link: "/membresias"
  },
  "optimizacion-carteras": {
    title: "Consultoría de Optimización de Carteras",
    description: "Sesiones personalizadas para analizar tu cartera, reducir riesgos y mejorar rendimiento.",
    icon: <Briefcase className="h-8 w-8 text-brand-primary" />,
    link: "/consultoria"
  },
  "bsb-maker": {
    title: "BSB Maker",
    description: "Accede a nuestra IA copilot que te ayuda a crear, probar y optimizar estrategias de inversión de manera automática.",
    icon: <Bot className="h-8 w-8 text-brand-primary" />,
    link: "/bsb-maker"
  },
  "inversor-premium": {
    title: "Paquete Inversor Premium",
    description: "Un programa completo de acompañamiento diseñado para quienes buscan una gestión profesional y un rendimiento óptimo de su cartera.",
    details: "• 6 consultorías de 1h\n• Revisión semestral de cartera\n• Acceso exclusivo a nuestra comunidad de inversores",
    icon: <Briefcase className="h-8 w-8 text-brand-primary" />,
    link: "/membresias"
  },
  "bsb-academy-inversor": {
    title: "BSB Academy",
    description: "Aprende nuevos conceptos y estrategias que se transformen en rentabilidad. Formación práctica diseñada para inversores que buscan ampliar sus conocimientos y mejorar sus resultados.",
    icon: <BookOpen className="h-8 w-8 text-brand-primary" />,
    link: "/academia"
  },
  "bsb-academy-asesor": {
    title: "BSB Academy",
    description: "Accede a formación práctica y estructurada. Ideal para profesionales que quieren actualizarse, dominar nuevas técnicas y adquirir herramientas aplicables en su trabajo diario.",
    icon: <BookOpen className="h-8 w-8 text-brand-primary" />,
    link: "/academia"
  },
  "consultoria-crypto-web3": {
    title: "Consultoría Crypto & Web 3",
    description: "Sesiones personalizadas enfocadas en análisis de carteras, diseño de estrategias y adaptación a nuevos activos digitales. Ideal para asesores que buscan una visión externa experta.",
    icon: <Briefcase className="h-8 w-8 text-brand-primary" />,
    link: "/consultoria"
  }
};

const GuiaInversion = () => {
  const [currentPhase, setCurrentPhase] = useState('phase1');
  const [result, setResult] = useState(null);

  const handleAnswer = (option) => {
    if (option.service) {
      setResult(option.service);
    } else if (option.nextPhase) {
      setCurrentPhase(option.nextPhase);
    }
  };

  const resetQuiz = () => {
    setCurrentPhase('phase1');
    setResult(null);
  };

  const currentQuestion = phases[currentPhase];

  return (
    <>
      <Helmet>
        <title>Encuentra tu Servicio Ideal - BSB Capital</title>
        <meta name="description" content="Descubre qué servicio de BSB Capital es el ideal para ti con nuestro sistema de recomendación por fases." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-brand-text-primary">ENCUENTRA TU SERVICIO IDEAL</h1>
          <p className="mt-4 text-lg text-brand-text-secondary">Responde unas preguntas rápidas y te recomendaremos la solución perfecta para tus metas.</p>
        </div>

        <Card className="max-w-2xl mx-auto mt-12 shadow-lg glass-card">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {result ? (
                  <div className="text-center space-y-4">
                    {serviceInfo[result] ? (
                      <>
                        <div className="bg-yellow-50 p-8 rounded-lg border-2 border-yellow-400">
                          <h2 className="text-2xl font-semibold text-brand-text-primary mb-4">Tu servicio recomendado es:</h2>
                          {serviceInfo[result].icon}
                          <h3 className="mt-4 text-2xl font-bold text-brand-text-primary">{serviceInfo[result].title}</h3>
                          <p className="mt-2 text-brand-text-secondary">{serviceInfo[result].description}</p>
                          {serviceInfo[result].details && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-brand-text-primary mb-2">Incluye:</h4>
                              <div className="text-left text-sm text-brand-text-secondary whitespace-pre-line">
                                {serviceInfo[result].details}
                              </div>
                            </div>
                          )}
                          <Button asChild className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900">
                            <Link to={serviceInfo[result].link}>
                              Saber más <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="bg-red-50 p-8 rounded-lg border-2 border-red-400">
                        <p className="text-red-700">Error: Servicio no encontrado ({result})</p>
                        <p className="text-sm text-red-600 mt-2">Por favor, contacta con soporte.</p>
                      </div>
                    )}
                    <Button variant="link" onClick={resetQuiz} className="mt-6 text-brand-primary">
                      <Repeat className="mr-2 h-4 w-4" /> Volver a empezar
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 text-center">
                      <h2 className="text-2xl font-semibold mt-1 text-brand-text-primary">{currentQuestion?.question}</h2>
                    </div>
                    <div className="space-y-4">
                      {currentQuestion?.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="lg"
                          className="w-full justify-start text-left h-auto py-4 text-brand-text-primary border-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
                          onClick={() => handleAnswer(option)}
                        >
                          {option.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default GuiaInversion;