import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, Bot, Briefcase, BookOpen, Repeat } from 'lucide-react';
    import { Card, CardContent } from '@/components/ui/card';

    const questions = [
      {
        question: "¿Qué frase te describe mejor?",
        options: [
          { text: "Quiero herramientas para crear y probar mis propias estrategias.", points: { bsbMaker: 3, consultoria: 1 } },
          { text: "Prefiero delegar la gestión de mis inversiones a expertos.", points: { algoFund: 3 } },
          { text: "Necesito un plan financiero y asesoramiento personalizado.", points: { consultoria: 3, academia: 1 } },
          { text: "Quiero aprender a invertir y mejorar mis conocimientos.", points: { academia: 3, bsbMaker: 1 } },
        ],
      },
      {
        question: "¿Cuánto tiempo quieres dedicar a la semana?",
        options: [
          { text: "Menos de 1 hora. Quiero algo automático.", points: { algoFund: 3 } },
          { text: "De 1 a 5 horas. Puedo seguir el mercado.", points: { bsbMaker: 2, consultoria: 2 } },
          { text: "Más de 5 horas. Disfruto analizando y aprendiendo.", points: { academia: 3, bsbMaker: 2 } },
        ],
      },
      {
        question: "¿Cuál es tu principal objetivo?",
        options: [
          { text: "Maximizar mi rentabilidad con herramientas avanzadas.", points: { bsbMaker: 3, algoFund: 1 } },
          { text: "Construir un patrimonio a largo plazo con seguridad.", points: { consultoria: 3, algoFund: 2 } },
          { text: "Obtener independencia y conocimiento financiero.", points: { academia: 3 } },
        ],
      },
    ];

    const serviceInfo = {
      bsbMaker: { title: "BSB Maker", description: "Tu copiloto de IA para crear, validar y automatizar estrategias de trading. Ideal para traders activos que buscan un 'edge' tecnológico.", icon: <Bot className="h-8 w-8 text-brand-primary" />, link: "/bsb-maker" },
      algoFund: { title: "Algo Fund", description: "Delega tu inversión en nuestras estrategias algorítmicas probadas. Perfecto si buscas rentabilidad sin dedicar tiempo al análisis diario.", icon: <Repeat className="h-8 w-8 text-brand-primary" />, link: "/algo-fund" },
      consultoria: { title: "Consultoría Personalizada", description: "Un plan estratégico a medida para tus finanzas y patrimonio. Recibe la guía de expertos para tomar las mejores decisiones.", icon: <Briefcase className="h-8 w-8 text-brand-primary" />, link: "/consultoria" },
      academia: { title: "Academia BSB", description: "Fórmate con nuestros cursos y contenido premium. Conviértete en un inversor experto a tu propio ritmo.", icon: <BookOpen className="h-8 w-8 text-brand-primary" />, link: "/academia" },
    };

    const GuiaInversion = () => {
      const [step, setStep] = useState(0);
      const [scores, setScores] = useState({ bsbMaker: 0, algoFund: 0, consultoria: 0, academia: 0 });
      const [result, setResult] = useState(null);

      const handleAnswer = (points) => {
        setScores(prevScores => {
          const newScores = { ...prevScores };
          for (const service in points) {
            newScores[service] += points[service];
          }
          return newScores;
        });

        if (step < questions.length - 1) {
          setStep(step + 1);
        } else {
          calculateResult();
        }
      };
      
      const calculateResult = () => {
        // We need to re-calculate based on the final click, so we pass scores directly
         setScores(prevScores => {
            const finalScores = { ...prevScores };
            const topService = Object.keys(finalScores).reduce((a, b) => finalScores[a] > finalScores[b] ? a : b);
            setResult(topService);
            return finalScores;
        });
      };
      
      const handleAnswerAndFinish = (points) => {
        setScores(prevScores => {
          const newScores = { ...prevScores };
          for (const service in points) {
            newScores[service] += points[service];
          }
          const topService = Object.keys(newScores).reduce((a, b) => newScores[a] > newScores[b] ? a : b);
          setResult(topService);
          return newScores;
        });
        setStep(step + 1);
      };

      const resetQuiz = () => {
        setStep(0);
        setScores({ bsbMaker: 0, algoFund: 0, consultoria: 0, academia: 0 });
        setResult(null);
      };
      
      const currentQuestion = questions[step];

      return (
        <>
          <Helmet>
            <title>Guía Interactiva - BSB Capital</title>
            <meta name="description" content="Descubre qué servicio de BSB Capital es el ideal para ti con nuestro cuestionario interactivo." />
          </Helmet>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-16"
          >
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-brand-text-primary">Descubre tu Servicio Ideal</h1>
              <p className="mt-4 text-lg text-brand-text-secondary">Responde 3 preguntas rápidas y te recomendaremos la solución perfecta para tus metas.</p>
            </div>

            <Card className="max-w-2xl mx-auto mt-12 shadow-lg glass-card">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {result ? (
                      <div className="text-center">
                        <h2 className="text-2xl font-semibold text-brand-text-primary mb-4">Tu servicio recomendado es:</h2>
                        <div className="bg-brand-surface p-6 rounded-lg border border-brand-primary/20">
                            {serviceInfo[result].icon}
                            <h3 className="mt-4 text-2xl font-bold text-brand-text-primary">{serviceInfo[result].title}</h3>
                            <p className="mt-2 text-brand-text-secondary">{serviceInfo[result].description}</p>
                            <Button asChild className="mt-6">
                                <Link to={serviceInfo[result].link}>
                                    Saber más <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <Button variant="link" onClick={resetQuiz} className="mt-6 text-brand-primary">
                          <Repeat className="mr-2 h-4 w-4" /> Volver a empezar
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-6 text-center">
                          <p className="text-sm font-semibold text-brand-primary">PREGUNTA {step + 1} DE {questions.length}</p>
                          <h2 className="text-2xl font-semibold mt-1 text-brand-text-primary">{currentQuestion.question}</h2>
                        </div>
                        <div className="space-y-4">
                          {currentQuestion.options.map((option, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="lg"
                              className="w-full justify-start text-left h-auto py-3 text-brand-text-primary"
                              onClick={() => step < questions.length - 1 ? handleAnswer(option.points) : handleAnswerAndFinish(option.points)}
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