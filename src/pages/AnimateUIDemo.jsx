import React, { useState } from 'react';
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number';
import { TypingText, TypingTextCursor } from '@/components/animate-ui/primitives/texts/typing';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Magnetic } from '@/components/animate-ui/primitives/effects/magnetic';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';

const AnimateUIDemo = () => {
  const [number, setNumber] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  const incrementNumber = () => {
    setNumber(prev => prev + Math.floor(Math.random() * 100));
  };

  const resetTyping = () => {
    setShowTyping(false);
    setTimeout(() => setShowTyping(true), 100);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Fondo animado con burbujas */}
      <BubbleBackground className="absolute inset-0 opacity-30" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🎨 Animate UI Demo
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre los componentes animados que harán que tu web se vea increíble.
              Estos son algunos ejemplos de lo que puedes hacer con Animate UI.
            </p>
          </div>

          {/* Grid de componentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            
            {/* Sliding Number Demo */}
            <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                📊 Números Animados
              </h2>
              <p className="text-muted-foreground mb-4">
                Perfecto para mostrar estadísticas, contadores, precios, etc.
              </p>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-4">
                  <SlidingNumber value={number} />
                </div>
                <Button onClick={incrementNumber} variant="default">
                  Incrementar Número
                </Button>
              </div>
            </div>

            {/* Typing Effect Demo */}
            <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                ⌨️ Efecto de Escritura
              </h2>
              <p className="text-muted-foreground mb-4">
                Ideal para títulos, presentaciones y llamadas de atención.
              </p>
              <div className="min-h-[100px] flex items-center justify-center">
                {showTyping && (
                  <div className="text-2xl font-medium text-center">
                    <TypingText
                      text="¡Tu web nunca se vio tan genial! ✨"
                      duration={80}
                    >
                      <TypingTextCursor />
                    </TypingText>
                  </div>
                )}
              </div>
              <div className="text-center">
                <Button onClick={resetTyping} variant="outline">
                  Reproducir Animación
                </Button>
              </div>
            </div>

            {/* Magnetic Effect Demo */}
            <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                🧲 Efecto Magnético
              </h2>
              <p className="text-muted-foreground mb-4">
                Los elementos siguen tu cursor creando una experiencia interactiva.
              </p>
              <div className="flex justify-center items-center min-h-[120px]">
                <Magnetic>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-medium cursor-pointer">
                    Pasa el cursor por aquí 👆
                  </div>
                </Magnetic>
              </div>
            </div>

            {/* Animated Button Demo */}
            <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                🎬 Botones Animados
              </h2>
              <p className="text-muted-foreground mb-4">
                Botones con animaciones suaves que mejoran la experiencia del usuario.
              </p>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    Botón Principal ✨
                  </Button>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline">
                    Secundario
                  </Button>
                  <Button variant="ghost">
                    Fantasma
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* Casos de uso */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              💡 ¿Dónde usar estos componentes?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-card/50 rounded-lg border border-border">
                <div className="text-2xl mb-3">📈</div>
                <h3 className="font-semibold mb-2">Dashboards</h3>
                <p className="text-sm text-muted-foreground">
                  Números animados para mostrar KPIs, estadísticas y métricas en tiempo real.
                </p>
              </div>

              <div className="text-center p-6 bg-card/50 rounded-lg border border-border">
                <div className="text-2xl mb-3">🏠</div>
                <h3 className="font-semibold mb-2">Landing Pages</h3>
                <p className="text-sm text-muted-foreground">
                  Textos de escritura y botones magnéticos para captar la atención.
                </p>
              </div>

              <div className="text-center p-6 bg-card/50 rounded-lg border border-border">
                <div className="text-2xl mb-3">💰</div>
                <h3 className="font-semibold mb-2">E-commerce</h3>
                <p className="text-sm text-muted-foreground">
                  Precios animados y botones interactivos para mejorar las conversiones.
                </p>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mt-16 bg-muted/30 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
              🚀 Cómo implementar en tu proyecto
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold">Instalar componentes específicos</h3>
                  <p className="text-muted-foreground">
                    Usa <code className="bg-muted px-2 py-1 rounded text-sm">npx shadcn@latest add @animate-ui/[component-name]</code> para agregar componentes individuales.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold">Importar y usar</h3>
                  <p className="text-muted-foreground">
                    Importa los componentes desde <code className="bg-muted px-2 py-1 rounded text-sm">@/components/animate-ui/...</code> y úsalos como cualquier componente React.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold">Personalizar y extender</h3>
                  <p className="text-muted-foreground">
                    Todos los componentes son editables y se adaptan a tu sistema de diseño existente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimateUIDemo;