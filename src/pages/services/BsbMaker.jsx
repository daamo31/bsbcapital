import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ArrowRight, Check, Zap, BrainCircuit, ShieldCheck, BarChart, Rocket, AlertTriangle, Sparkles, Loader2, Target, BookOpen } from 'lucide-react';

const PreRegistrationForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !agreed) {
      toast({
        title: 'Formulario incompleto',
        description: 'Por favor, rellena todos los campos obligatorios y acepta los términos.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);

    const { data: insertData, error: insertError } = await supabase
      .from('bsb_maker_preregistrations')
      .insert([
        { name: name, email: email, experience_level: experience || null },
      ])
      .select()
      .single();

    if (insertError) {
      setLoading(false);
      toast({
        title: 'Error en el registro',
        description: 'Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
      console.error('Error inserting data:', insertError);
      return;
    }

    try {
      const { error: functionError } = await supabase.functions.invoke('send-preregistration-email', {
        body: JSON.stringify({ name, email }),
      });

      if (functionError) {
        throw functionError;
      }

      toast({
        title: '¡Preregistro completado!',
        description: 'Gracias por tu interés. Hemos enviado un correo de confirmación a tu email.',
      });
      setName('');
      setEmail('');
      setExperience('');
      setAgreed(false);

    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      toast({
        title: 'Preregistro guardado, pero...',
        description: 'No pudimos enviar el correo de confirmación. No te preocupes, tu registro está guardado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto glass-card shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-2xl gap-2">
          <Rocket className="text-primary" />
          Preregistro Exclusivo BSB Maker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-6">Sé de los primeros en probar nuestro asistente de trading con IA.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">👤 Nombre y apellidos</Label>
            <Input id="name" type="text" placeholder="Tu nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">📧 Email</Label>
            <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">📈 Nivel de experiencia en trading</Label>
            <Select onValueChange={setExperience} value={experience}>
              <SelectTrigger id="experience">
                <SelectValue placeholder="Selecciona tu nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Principiante">Principiante</SelectItem>
                <SelectItem value="Intermedio">Intermedio</SelectItem>
                <SelectItem value="Avanzado">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} required />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Acepto recibir actualizaciones sobre BSB Maker y los términos de uso.
              </label>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-11 px-8 rounded-md font-medium"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reservar mi acceso anticipado'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const BsbMaker = () => {
  return (
    <>
      <Helmet>
        <title>BSB Maker: Preregistro - Tu Copiloto de Trading con IA</title>
        <meta name="description" content="El futuro del trading está en construcción. Únete al preregistro exclusivo de BSB Maker y sé de los primeros en probar nuestro copiloto de trading con IA." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 text-center relative">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight"
            >
              <span className="accent-gradient-text">🚀 BSB Maker:</span> tu asistente de trading con IA
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto"
            >
              El futuro del trading está en construcción… y tú puedes ser de los primeros en vivirlo.
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10"
            >
              <Button asChild size="lg" className="shadow-lg">
                <a href="#preregistro">🚀 Preregistro Exclusivo BSB Maker <ArrowRight className="ml-2" /></a>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Section 1: Problema */}
        <div className="py-24 aurora-background">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold">El mercado no espera</h2>
            <p className="mt-4 text-lg text-text-secondary">
              Mientras otros dudan, los movimientos ya suceden. Las oportunidades se esfuman en segundos y el exceso de información provoca decisiones tardías o impulsivas.
            </p>
          </div>
        </div>

        {/* Section 2: Solución */}
        <div className="py-24 aurora-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">              El futuro del trading está en construcción… y tú puedes ser de los primeros en vivirlo.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureItem icon={<BarChart />} text="Analiza el mercado en tiempo real para detectar oportunidades antes de que aparezcan en los titulares." />
              <FeatureItem icon={<Target />} text="Optimiza tus entradas y salidas, calculando niveles clave con la lógica de un trader institucional." />
              <FeatureItem icon={<ShieldCheck />} text="Gestiona riesgo y apalancamiento con fórmulas claras, sin improvisaciones ni emociones." />
              <FeatureItem icon={<BookOpen />} text="Te ahorra tiempo, traduce los datos complejos en decisiones concretas." />
            </div>
          </div>
        </div>

        {/* New Section: Beneficios BSB Maker */}
        <div className="py-24 aurora-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="accent-gradient-text">BSB MAKER</span>
              </h2>
              <h3 className="text-2xl md:text-3xl font-semibold mb-12 text-text-primary">
                Beneficios que notarás desde el primer momento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-center p-6 rounded-lg bg-card border border-border shadow-lg"
                >
                  <div className="flex justify-center items-center mb-4 h-16 w-16 bg-primary/10 rounded-full mx-auto text-primary">
                    <Zap size={32} />
                  </div>
                  <p className="font-semibold text-lg text-foreground">Toma decisiones más rápidas y efectivas.</p>
                </motion.div>



                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center p-6 rounded-lg bg-card border border-border shadow-lg"
                >
                  <div className="flex justify-center items-center mb-4 h-16 w-16 bg-primary/10 rounded-full mx-auto text-primary">
                    <ShieldCheck size={32} />
                  </div>
                  <p className="font-semibold text-lg text-foreground">Reduce errores por exceso de información o impulsividad.</p>
                </motion.div>



                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center p-6 rounded-lg bg-card border border-border shadow-lg"
                >
                  <div className="flex justify-center items-center mb-4 h-16 w-16 bg-primary/10 rounded-full mx-auto text-primary">
                    <BrainCircuit size={32} />
                  </div>
                  <p className="font-semibold text-lg text-foreground">Accede a estrategias de trading profesional sin ser un experto.</p>
                </motion.div>



                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-center p-6 rounded-lg bg-card border border-border shadow-lg"
                >
                  <div className="flex justify-center items-center mb-4 h-16 w-16 bg-primary/10 rounded-full mx-auto text-primary">
                    <Rocket size={32} />
                  </div>
                  <p className="font-semibold text-lg text-foreground">Sé parte de un proyecto innovador desde sus inicios.</p>
                </motion.div>

              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Exclusividad */}
        <div className="py-24 bg-brand-green-100 text-brand-green-900">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-gold-600">Estamos construyendo algo único</h2>
              <p className="mt-4 text-lg text-white/90">
                BSB Maker combina nuestra especialización profunda en criptoactivos con tecnología avanzada para crear un asistente de trading único. Forma parte del ecosistema que está transformando la manera de invertir en activos digitales.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative p-8 rounded-xl bg-gradient-to-br from-brand-green-600/30 to-brand-green-900/30 border border-transparent shadow-lg 
                         before:absolute before:inset-0 before:rounded-xl before:border before:border-yellow-300/50 before:p-2
                         before:bg-gradient-to-br before:from-yellow-300/20 before:via-transparent before:to-transparent
                         before:animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            >
              <div className="relative">
                <h3 className="text-2xl font-bold flex items-center gap-3 text-white"><Sparkles className="text-yellow-300" /> Preregistro anticipado:</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start text-white"><Check className="text-yellow-300 mr-3 mt-1 flex-shrink-0" />Acceso temprano a la beta.</li>
                  <li className="flex items-start text-white"><Check className="text-yellow-300 mr-3 mt-1 flex-shrink-0" />Beneficios exclusivos para los primeros usuarios.</li>
                  <li className="flex items-start text-white"><Check className="text-yellow-300 mr-3 mt-1 flex-shrink-0" />Participa en dar forma al futuro del trading con IA.</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Call to Action & Form */}
        <div id="preregistro" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3"><AlertTriangle className="text-destructive" /> Plazas limitadas</h2>
              <p className="mt-4 text-lg text-text-secondary">
                Una vez cerremos el preregistro, no habrá acceso hasta el lanzamiento oficial.
              </p>
            </div>
            <PreRegistrationForm />
          </div>
        </div>

      </motion.div>
    </>
  );
};

const FeatureItem = ({ icon, text }) => (
  <div className="text-center p-6 rounded-lg glass-card flex flex-col items-center">
    <div className="flex justify-center items-center mb-4 h-16 w-16 bg-primary/10 rounded-full mx-auto text-primary">
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <p className="font-semibold text-lg">{text}</p>
  </div>
);

export default BsbMaker;