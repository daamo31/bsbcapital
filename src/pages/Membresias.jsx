import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
    import { Check, ArrowRight, Loader2, X } from 'lucide-react';
    import { useToast } from "@/components/ui/use-toast";
    import { supabase } from '@/lib/customSupabaseClient';
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { Label } from "@/components/ui/label";
    import { Input } from '@/components/ui/input';

    const memberships = [
      {
        name: 'Free Access',
        price: 'Gratis',
        priceDetails: 'Para empezar a conocernos',
        benefits: ['Newsletter gratuita con análisis y reflexiones financieras.'],
        cta: 'Suscribirme gratis',
        ctaType: 'newsletter',
        highlight: false,
      },
      {
        name: 'Trader Plan Pro',
        price: '29,90 €/mes',
        priceDetails: 'o 299 €/año',
        benefits: [
          'Newsletter incluida',
          'Acceso anticipado a BSB Maker (IA copiloto para traders)',
          'Acceso completo a la formación (cursos temáticos + masterclass)',
          '20% de descuento en consultorías',
          '1 consultoría de 30 min incluida en el plan anual',
        ],
        cta: 'Quiero este plan',
        ctaType: 'action',
        highlight: true,
      },
      {
        name: 'Premium Investor',
        price: '29,90 €/mes',
        priceDetails: 'o 299 €/año',
        benefits: [
          'Newsletter incluida',
          'Acceso a la Comunidad privada',
          'Acceso completo a la formación (cursos temáticos + masterclass)',
          '20% de descuento en consultorías',
          '1 consultoría de 30 min incluida en el plan anual',
        ],
        cta: 'Quiero este plan',
        ctaType: 'action',
        highlight: false,
      },
      {
        name: 'Wealth Membership',
        titleAddon: 'Co-Gestión Patrimonial',
        price: '2.400 €/año',
        priceDetails: 'pago único',
        benefits: [
          '6 consultorías de 1h/año (valor: 1.800€)',
          'Revisión completa de cartera semestral',
          'Plan estratégico anual con propuestas de optimización',
          'Canal privado prioritario + comunidad élite (networking + análisis exclusivos)',
        ],
        cta: 'Solicitar acceso',
        ctaType: 'action',
        highlight: false,
        note: 'Diseñada para clientes con patrimonio elevado que buscan claridad y continuidad sin ceder la gestión.',
      },
    ];

    const comparisonFeatures = [
        { feature: 'Newsletter', plans: { 'Free Access': true, 'Trader Plan Pro': true, 'Premium Investor': true, 'Wealth Membership': true } },
        { feature: 'Acceso BSB Maker', plans: { 'Free Access': false, 'Trader Plan Pro': true, 'Premium Investor': false, 'Wealth Membership': false } },
        { feature: 'Acceso Formación', plans: { 'Free Access': false, 'Trader Plan Pro': true, 'Premium Investor': true, 'Wealth Membership': true } },
        { feature: 'Comunidad Privada', plans: { 'Free Access': false, 'Trader Plan Pro': false, 'Premium Investor': true, 'Wealth Membership': true } },
        { feature: 'Descuento Consultorías', plans: { 'Free Access': false, 'Trader Plan Pro': '20%', 'Premium Investor': '20%', 'Wealth Membership': 'Incluidas' } },
        { feature: 'Consultorías Incluidas', plans: { 'Free Access': false, 'Trader Plan Pro': '1x30min (anual)', 'Premium Investor': '1x30min (anual)', 'Wealth Membership': '6x1h (anual)' } },
        { feature: 'Comunidad Élite', plans: { 'Free Access': false, 'Trader Plan Pro': false, 'Premium Investor': false, 'Wealth Membership': true } },
    ];

    const MembershipCard = ({ plan, onCtaClick }) => {
        let buttonVariant = plan.highlight ? 'default' : 'outline';
        let buttonClassName = "w-full";

        if (plan.name === 'Premium Investor') {
            buttonVariant = 'default';
        } else if (plan.name === 'Wealth Membership') {
            buttonClassName += " bg-black text-white hover:bg-gray-800";
            buttonVariant = 'default'; // To remove outline
        }

        return (
            <Card className={`flex flex-col glass-card ${plan.highlight ? 'border-primary border-2 shadow-lg shadow-primary/20' : ''}`}>
                <CardHeader>
                <CardTitle className="text-brand-text-primary">{plan.name} {plan.titleAddon && <span className="block text-lg font-normal text-brand-text-secondary">{plan.titleAddon}</span>}</CardTitle>
                <CardDescription className="text-brand-text-secondary">{plan.priceDetails}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                <ul className="space-y-3 text-brand-text-secondary flex-grow">
                    {plan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span>{benefit}</span>
                    </li>
                    ))}
                </ul>
                {plan.note && <p className="text-xs text-brand-text-secondary/70 mt-4 italic">{plan.note}</p>}
                <p className="text-4xl font-bold mt-6 text-brand-text-primary">{plan.price}</p>
                </CardContent>
                <CardFooter>
                <Button className={buttonClassName} variant={buttonVariant} onClick={() => onCtaClick(plan)}>
                    {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                </CardFooter>
            </Card>
        );
    };

    const MembershipQuiz = ({ onResult }) => {
        const [step, setStep] = useState(1);
        const [answers, setAnswers] = useState({});

        const handleAnswer = (question, answer) => {
            const newAnswers = { ...answers, [question]: answer };
            setAnswers(newAnswers);
            if (step < 3) {
                setStep(step + 1);
            } else {
                calculateResult(newAnswers);
            }
        };

        const calculateResult = (finalAnswers) => {
            const { objetivo, experiencia, implicacion } = finalAnswers;
            let result = 'Free Access';
            if (objetivo === 'trading' && experiencia === 'intermedio' && implicacion === 'alta') {
                result = 'Trader Plan Pro';
            } else if (objetivo === 'inversion' && experiencia !== 'principiante' && implicacion !== 'baja') {
                result = 'Premium Investor';
            } else if (objetivo === 'patrimonio' && implicacion === 'media') {
                result = 'Wealth Membership';
            }
            onResult(result);
        };

        const questions = [
            {
                id: 1,
                question: '¿Cuál es tu principal objetivo financiero?',
                options: [
                    { value: 'trading', label: 'Generar ingresos con trading activo' },
                    { value: 'inversion', label: 'Construir una cartera a largo plazo' },
                    { value: 'patrimonio', label: 'Gestionar y hacer crecer un patrimonio elevado' },
                    { value: 'aprender', label: 'Aprender los fundamentos de la inversión' },
                ],
                name: 'objetivo'
            },
            {
                id: 2,
                question: '¿Cuál es tu nivel de experiencia en los mercados?',
                options: [
                    { value: 'principiante', label: 'Estoy empezando' },
                    { value: 'intermedio', label: 'Tengo conocimientos y algo de experiencia' },
                    { value: 'avanzado', label: 'Opero o invierto de forma regular' },
                ],
                name: 'experiencia'
            },
            {
                id: 3,
                question: '¿Qué nivel de implicación buscas?',
                options: [
                    { value: 'alta', label: 'Quiero herramientas y formación para gestionar yo mismo' },
                    { value: 'media', label: 'Busco asesoramiento y co-gestión con expertos' },
                    { value: 'baja', label: 'Prefiero mantenerme informado y aprender a mi ritmo' },
                ],
                name: 'implicacion'
            },
        ];

        const currentQuestion = questions.find(q => q.id === step);

        return (
            <div className="bg-card p-8 rounded-xl shadow-lg border">
                <h3 className="text-2xl font-bold text-center mb-6">Paso {step} de {questions.length}</h3>
                <p className="text-lg text-center mb-8">{currentQuestion.question}</p>
                <RadioGroup onValueChange={(value) => handleAnswer(currentQuestion.name, value)} className="space-y-4">
                    {currentQuestion.options.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`${currentQuestion.name}-${option.value}`} />
                            <Label htmlFor={`${currentQuestion.name}-${option.value}`} className="text-base">{option.label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        );
    };


    const Membresias = () => {
      const { toast } = useToast();
      const [loading, setLoading] = useState(false);
      const [email, setEmail] = useState('');
      const [showQuiz, setShowQuiz] = useState(false);
      const [quizResult, setQuizResult] = useState(null);

      const handleNewsletterSubscription = async (emailToSubscribe) => {
        if (!emailToSubscribe) {
          toast({ variant: "destructive", title: "Email requerido", description: "Por favor, introduce tu correo electrónico." });
          return;
        }
        setLoading(true);
        const { error } = await supabase.from('newsletter_subscriptions').insert({ email: emailToSubscribe });
        setLoading(false);
        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast({ variant: "destructive", title: "Ya estás suscrito", description: "Este correo electrónico ya está en nuestra lista." });
          } else {
            toast({ variant: "destructive", title: "Error", description: "Hubo un problema al procesar tu suscripción." });
          }
        } else {
          toast({ title: "¡Suscripción exitosa!", description: "Te has unido a nuestra newsletter gratuita." });
          setEmail('');
        }
      };

      const handleCtaClick = (plan) => {
        if (plan.ctaType === 'newsletter') {
          const userEmail = prompt("Por favor, introduce tu email para suscribirte a la newsletter gratuita:");
          if (userEmail) {
            handleNewsletterSubscription(userEmail);
          }
        } else {
          toast({
            title: `Próximamente: ${plan.name}`,
            description: "Esta membresía estará disponible pronto. ¡Gracias por tu interés!",
          });
        }
      };

      const handleFormSubmit = (e) => {
        e.preventDefault();
        handleNewsletterSubscription(email);
      };

      return (
        <>
          <Helmet>
            <title>Membresías - BSB Capital</title>
            <meta name="description" content="Elige la membresía de BSB Capital que mejor se adapte a tus necesidades de inversión y trading." />
          </Helmet>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-16"
          >
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-brand-text-primary">Elige tu camino hacia el <span className="main-gradient-text">éxito financiero</span></h1>
              <p className="mt-6 text-lg text-brand-text-secondary">
                Tenemos un plan para cada tipo de inversor. Desde el que empieza a explorar hasta el que busca una gestión patrimonial de élite.
              </p>
               <Button size="lg" className="mt-8" onClick={() => setShowQuiz(!showQuiz)}>
                {showQuiz ? 'Ocultar Guía' : 'Descubrir mi Membresía Ideal'}
              </Button>
            </div>

            {showQuiz && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-16 max-w-2xl mx-auto"
                >
                    {!quizResult ? (
                        <MembershipQuiz onResult={setQuizResult} />
                    ) : (
                        <div className="bg-card p-8 rounded-xl shadow-lg border text-center">
                            <h3 className="text-2xl font-bold">Tu membresía ideal es...</h3>
                            <p className="text-4xl font-bold main-gradient-text my-4">{quizResult}</p>
                            <p className="text-brand-text-secondary mb-6">Este plan parece el más adecuado para tus objetivos y nivel de experiencia.</p>
                            <Button onClick={() => { setQuizResult(null); setShowQuiz(false); }}>Ver todos los planes</Button>
                        </div>
                    )}
                </motion.div>
            )}

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {memberships.map((plan) => (
                <MembershipCard key={plan.name} plan={plan} onCtaClick={handleCtaClick} />
              ))}
            </div>
            
            <div className="mt-24">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-text-primary mb-12">Tabla Comparativa</h2>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 bg-card text-lg font-semibold">Beneficio</th>
                                {memberships.map(plan => (
                                    <th key={plan.name} className={`p-4 bg-card text-center font-semibold ${plan.highlight ? 'text-primary' : ''}`}>{plan.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonFeatures.map(({ feature, plans }) => (
                                <tr key={feature} className="border-b border-border">
                                    <td className="p-4 font-medium">{feature}</td>
                                    {memberships.map(plan => (
                                        <td key={plan.name} className="p-4 text-center">
                                            {typeof plans[plan.name] === 'boolean' ? (
                                                plans[plan.name] ? <Check className="h-6 w-6 text-green-500 mx-auto" /> : <X className="h-6 w-6 text-red-500 mx-auto" />
                                            ) : (
                                                <span className="font-semibold">{plans[plan.name]}</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-24 max-w-2xl mx-auto text-center bg-card p-8 rounded-xl shadow-lg border">
                <h2 className="text-3xl font-bold text-brand-text-primary">Empieza con Free Access</h2>
                <p className="mt-4 text-brand-text-secondary">Recibe nuestra newsletter gratuita con análisis y reflexiones financieras para empezar a conocernos.</p>
                <form onSubmit={handleFormSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                    <Input
                        id="newsletter-input"
                        type="email"
                        placeholder="Tu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="flex-grow"
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Suscribirme gratis'}
                    </Button>
                </form>
            </div>

          </motion.div>
        </>
      );
    };

    export default Membresias;