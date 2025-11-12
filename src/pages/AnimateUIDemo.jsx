import React, { useState } from 'react';
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number';
import { TypingText, TypingTextCursor } from '@/components/animate-ui/primitives/texts/typing';
import { MorphingText } from '@/components/animate-ui/primitives/texts/morphing';
import { ShimmeringText } from '@/components/animate-ui/primitives/texts/shimmering';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { FlipButton, FlipButtonFront, FlipButtonBack } from '@/components/animate-ui/components/buttons/flip';
import { RippleButton } from '@/components/animate-ui/components/buttons/ripple';
import { Magnetic } from '@/components/animate-ui/primitives/effects/magnetic';
import { Tilt, TiltContent } from '@/components/animate-ui/primitives/effects/tilt';
import { Click } from '@/components/animate-ui/primitives/effects/click';
import { Particles, ParticlesEffect } from '@/components/animate-ui/primitives/effects/particles';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { HexagonBackground } from '@/components/animate-ui/components/backgrounds/hexagon';
import { GravityStarsBackground } from '@/components/animate-ui/components/backgrounds/gravity-stars';

const PremiumWhiteDemo = () => {
  const [clientCount, setClientCount] = useState(247);
  const [roi, setRoi] = useState(15.7);
  const [showHeroText, setShowHeroText] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(2847);
  const [experiences, setExperiences] = useState(12);

  const incrementStats = () => {
    setClientCount(prev => prev + Math.floor(Math.random() * 50) + 1);
    setRoi(prev => +(prev + (Math.random() * 2)).toFixed(1));
    setPortfolioValue(prev => prev + Math.floor(Math.random() * 500) + 50);
    setExperiences(prev => prev + 1);
  };

  const resetHeroAnimation = () => {
    setShowHeroText(false);
    setTimeout(() => setShowHeroText(true), 200);
  };

  // Paleta de colores verdosos elegantes
  const elegantGreenPalette = {
    emerald: {
      50: 'rgb(236, 253, 245)',
      100: 'rgb(209, 250, 229)', 
      200: 'rgb(167, 243, 208)',
      300: 'rgb(110, 231, 183)',
      400: 'rgb(52, 211, 153)',
      500: 'rgb(16, 185, 129)',
      600: 'rgb(5, 150, 105)',
      700: 'rgb(4, 120, 87)',
      800: 'rgb(6, 95, 70)',
      900: 'rgb(6, 78, 59)'
    },
    sage: {
      50: 'rgb(247, 250, 252)',
      100: 'rgb(236, 243, 247)',
      200: 'rgb(207, 225, 236)',
      300: 'rgb(148, 184, 200)',
      400: 'rgb(100, 150, 170)',
      500: 'rgb(69, 123, 145)',
      600: 'rgb(52, 97, 117)',
      700: 'rgb(43, 79, 96)',
      800: 'rgb(37, 67, 82)',
      900: 'rgb(32, 57, 70)'
    }
  };

  // Colores de fondo para burbujas verdosas suaves
  const softGreenBubbles = {
    first: '236,253,245',    // Emerald 50
    second: '209,250,229',   // Emerald 100  
    third: '167,243,208',    // Emerald 200
    fourth: '110,231,183',   // Emerald 300
    fifth: '148,184,200',    // Sage 300
    sixth: '100,150,170',    // Sage 400
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Fondo de estrellas muy sutil */}
      <GravityStarsBackground className="absolute inset-0 opacity-5" />
      
      <div className="relative z-10">
        {/* Hero Section Premium */}
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-20">
            {/* Logo/Brand animado */}
            <Tilt>
              <TiltContent>
                <div className="inline-block mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-xl border-2 border-emerald-300">
                    <span className="text-3xl">💎</span>
                  </div>
                </div>
              </TiltContent>
            </Tilt>

            {/* Título principal con efecto de escritura */}
            <div className="mb-8">
              {showHeroText && (
                <h1 className="text-6xl md:text-8xl font-extralight mb-6 text-gray-800">
                  <TypingText
                    text="CONSULTORÍA PREMIUM"
                    duration={120}
                    delay={300}
                  >
                    <TypingTextCursor />
                  </TypingText>
                </h1>
              )}
              <p className="text-2xl md:text-3xl text-gray-600 font-light tracking-wide">
                Excelencia en gestión patrimonial
              </p>
            </div>

            {/* CTA principal con efecto magnético */}
            <Magnetic strength={0.4} range={120}>
              <Click>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-16 py-6 text-xl font-light shadow-2xl rounded-full border-2 border-emerald-500"
                  onClick={resetHeroAnimation}
                >
                  Agenda tu Consulta
                  <span className="ml-3 text-2xl">→</span>
                </Button>
              </Click>
            </Magnetic>
          </div>

          {/* Estadísticas Premium con animaciones - 4 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* Clientes Satisfechos */}
            <Tilt>
              <TiltContent>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-2 border-emerald-200 hover:shadow-2xl hover:border-emerald-300 transition-all duration-500">
                  <div className="text-center">
                    <div className="text-5xl font-extralight text-emerald-800 mb-4">
                      <SlidingNumber value={clientCount} />
                    </div>
                    <h3 className="text-lg font-medium text-emerald-700 mb-2">Clientes VIP</h3>
                    <p className="text-emerald-600 text-sm">Patrimonios exclusivos</p>
                  </div>
                </div>
              </TiltContent>
            </Tilt>

            {/* ROI Promedio */}
            <Tilt>
              <TiltContent>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-2 border-teal-200 hover:shadow-2xl hover:border-teal-300 transition-all duration-500">
                  <div className="text-center">
                    <div className="text-5xl font-extralight text-teal-800 mb-4">
                      <SlidingNumber value={roi} decimalPlaces={1} />%
                    </div>
                    <h3 className="text-lg font-medium text-teal-700 mb-2">ROI Anual</h3>
                    <p className="text-teal-600 text-sm">Rendimiento sostenido</p>
                  </div>
                </div>
              </TiltContent>
            </Tilt>

            {/* Patrimonio Gestionado */}
            <Tilt>
              <TiltContent>
                <div className="bg-gradient-to-br from-green-50 to-green-100 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-2 border-green-200 hover:shadow-2xl hover:border-green-300 transition-all duration-500">
                  <div className="text-center">
                    <div className="text-4xl font-extralight text-green-800 mb-4">
                      €<SlidingNumber value={portfolioValue} />M
                    </div>
                    <h3 className="text-lg font-medium text-green-700 mb-2">AUM</h3>
                    <p className="text-green-600 text-sm">Assets Under Management</p>
                  </div>
                </div>
              </TiltContent>
            </Tilt>

            {/* Años de Experiencia */}
            <Tilt>
              <TiltContent>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-2 border-slate-200 hover:shadow-2xl hover:border-emerald-300 transition-all duration-500">
                  <div className="text-center">
                    <div className="text-5xl font-extralight text-slate-700 mb-4">
                      <SlidingNumber value={experiences} />+
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Años</h3>
                    <p className="text-slate-600 text-sm">Experiencia acumulada</p>
                  </div>
                </div>
              </TiltContent>
            </Tilt>
          </div>

          {/* Control interactivo */}
          <div className="text-center mb-20">
            <Magnetic strength={0.3}>
              <Button 
                onClick={incrementStats}
                variant="outline" 
                size="lg"
                className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 px-12 py-4 rounded-full font-light text-lg shadow-lg"
              >
                📊 Actualizar Métricas
              </Button>
            </Magnetic>
          </div>

          {/* Servicios Premium con más componentes */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-center mb-16 text-gray-800">
              Servicios de Élite
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* Gestión de Patrimonio */}
              <Magnetic strength={0.2} range={80}>
                <Tilt>
                  <TiltContent>
                    <Click>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 backdrop-blur-xl rounded-3xl p-10 shadow-xl border-2 border-emerald-200 hover:shadow-2xl hover:border-emerald-300 transition-all duration-700 cursor-pointer group">
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-emerald-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-2xl">📈</span>
                          </div>
                          <h3 className="text-2xl font-light text-emerald-800 mb-3">Gestión Patrimonial</h3>
                          <p className="text-emerald-700 leading-relaxed">
                            Estrategias personalizadas para multiplicar y proteger tu patrimonio familiar.
                          </p>
                        </div>
                        <div className="text-center pt-4 border-t border-emerald-200">
                          <span className="text-lg font-light text-emerald-800">Desde €1M</span>
                        </div>
                      </div>
                    </Click>
                  </TiltContent>
                </Tilt>
              </Magnetic>

              {/* Asesoría Fiscal */}
              <Magnetic strength={0.2} range={80}>
                <Tilt>
                  <TiltContent>
                    <Click>
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 backdrop-blur-xl rounded-3xl p-10 shadow-xl border-2 border-teal-200 hover:shadow-2xl hover:border-teal-300 transition-all duration-700 cursor-pointer group">
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-teal-200 to-teal-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-teal-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-2xl">⚖️</span>
                          </div>
                          <h3 className="text-2xl font-light text-teal-800 mb-3">Optimización Fiscal</h3>
                          <p className="text-teal-700 leading-relaxed">
                            Estructuras legales avanzadas para maximizar la eficiencia tributaria.
                          </p>
                        </div>
                        <div className="text-center pt-4 border-t border-teal-200">
                          <span className="text-lg font-light text-teal-800">Consulta Premium</span>
                        </div>
                      </div>
                    </Click>
                  </TiltContent>
                </Tilt>
              </Magnetic>

              {/* Family Office */}
              <Magnetic strength={0.2} range={80}>
                <Tilt>
                  <TiltContent>
                    <Click>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 backdrop-blur-xl rounded-3xl p-10 shadow-xl border-2 border-green-200 hover:shadow-2xl hover:border-green-300 transition-all duration-700 cursor-pointer group">
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-200 to-green-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-green-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-2xl">🏛️</span>
                          </div>
                          <h3 className="text-2xl font-light text-green-800 mb-3">Family Office</h3>
                          <p className="text-green-700 leading-relaxed">
                            Gestión integral del patrimonio familiar multi-generacional.
                          </p>
                        </div>
                        <div className="text-center pt-4 border-t border-green-200">
                          <span className="text-lg font-light text-green-800">Ultra Premium</span>
                        </div>
                      </div>
                    </Click>
                  </TiltContent>
                </Tilt>
              </Magnetic>
            </div>
          </div>

          {/* Sección con fondo hexagonal */}
          <div className="relative mb-20">
            <HexagonBackground 
              className="absolute inset-0 opacity-3" 
              hexagonSize={80}
              hexagonMargin={12}
            />
            <div className="relative bg-white/60 backdrop-blur-2xl rounded-3xl p-16 shadow-2xl border border-gray-200/80">
              <div className="text-center max-w-4xl mx-auto">
                <div className="text-8xl mb-8">✨</div>
                <blockquote className="text-3xl md:text-4xl font-extralight text-gray-800 mb-8 italic leading-relaxed">
                  "La diferencia entre una consultoría y una experiencia transformadora"
                </blockquote>
                <div className="flex items-center justify-center space-x-6">
                  <Tilt>
                    <TiltContent>
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full border border-gray-300"></div>
                    </TiltContent>
                  </Tilt>
                  <div className="text-left">
                    <p className="text-xl font-light text-gray-800">Isabella Martínez</p>
                    <p className="text-gray-600">Fundadora, Grupo Empresarial IM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nuevos efectos experimentales */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-center mb-12 text-gray-800">
              Efectos Experimentales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Efecto Hover Scale */}
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-emerald-700">Scale Hover</h3>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-3xl border-2 border-emerald-200 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-emerald-300">
                  <div className="text-4xl mb-3">🚀</div>
                  <p className="text-emerald-700">Escala al hover</p>
                </div>
              </div>

              {/* Efecto Rotating Border */}
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-teal-700">Rotating Border</h3>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400 rounded-3xl animate-spin opacity-30"></div>
                  <div className="relative bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-3xl border-2 border-teal-200 m-1">
                    <div className="text-4xl mb-3">⭐</div>
                    <p className="text-teal-700">Borde rotativo</p>
                  </div>
                </div>
              </div>

              {/* Efecto Pulse */}
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-green-700">Pulse Effect</h3>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl border-2 border-green-200 animate-pulse cursor-pointer">
                  <div className="text-4xl mb-3">💚</div>
                  <p className="text-green-700">Efecto pulso</p>
                </div>
              </div>

              {/* Efecto Bounce */}
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-emerald-700">Bounce Animation</h3>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-3xl border-2 border-emerald-200 cursor-pointer hover:animate-bounce">
                  <div className="text-4xl mb-3">🏀</div>
                  <p className="text-emerald-700">Click para bounce</p>
                </div>
              </div>

              {/* Efecto Shake */}
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-teal-700">Shake Effect</h3>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-3xl border-2 border-teal-200 cursor-pointer hover:animate-pulse transform transition-transform hover:rotate-1">
                  <div className="text-4xl mb-3">📳</div>
                  <p className="text-teal-700">Shake al hover</p>
                </div>
              </div>

              {/* Efecto Gradient Shift */}
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-green-700">Gradient Shift</h3>
                <div className="bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 p-8 rounded-3xl border-2 border-green-200 cursor-pointer bg-[length:200%_200%] animate-pulse hover:bg-right transition-all duration-1000">
                  <div className="text-4xl mb-3">🌈</div>
                  <p className="text-green-700">Gradiente dinámico</p>
                </div>
              </div>
            </div>
          </div>

          {/* Efectos CSS Personalizados */}
          <div className="mb-20">
            <h2 className="text-3xl font-light text-center mb-12 text-gray-800">
              Efectos CSS Avanzados
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Floating Cards */}
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-emerald-700 text-center">Floating Cards</h3>
                <Tilt>
                  <TiltContent>
                    <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-3xl border-2 border-emerald-200 cursor-pointer overflow-hidden">
                      {/* Efecto de brillo */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-emerald-300 rounded-xl mb-4 flex items-center justify-center">
                          <span className="text-xl">✨</span>
                        </div>
                        <h4 className="text-lg font-medium text-emerald-800 mb-2">Card Premium</h4>
                        <p className="text-emerald-600">Con efecto de brillo y movimiento suave</p>
                      </div>
                    </div>
                  </TiltContent>
                </Tilt>
                
                <Tilt>
                  <TiltContent>
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-3xl border-2 border-teal-200 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                      <div className="w-12 h-12 bg-teal-300 rounded-xl mb-4 flex items-center justify-center">
                        <span className="text-xl">🎯</span>
                      </div>
                      <h4 className="text-lg font-medium text-teal-800 mb-2">Card Flotante</h4>
                      <p className="text-teal-600">Se eleva al hacer hover</p>
                    </div>
                  </TiltContent>
                </Tilt>
              </div>

              {/* Animated Buttons */}
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-green-700 text-center">Botones Animados</h3>
                
                <Magnetic strength={0.3}>
                  <Click>
                    <button className="group relative w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-8 rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl">
                      <span className="relative z-10">Botón Magnético</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </button>
                  </Click>
                </Magnetic>
                
                <button className="group relative w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-8 rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl">
                  <span className="relative z-10 group-hover:text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
                    Texto Gradiente
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-teal-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                </button>
                
                <Magnetic>
                  <button className="relative w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-full overflow-hidden group">
                    <span className="relative z-10">Efecto Ondas</span>
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-green-400 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-20 transition-all duration-700"></div>
                      <div className="absolute inset-0 bg-green-300 rounded-full scale-0 group-hover:scale-125 opacity-0 group-hover:opacity-30 transition-all duration-500 delay-100"></div>
                    </div>
                  </button>
                </Magnetic>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-light text-center mb-12 text-gray-800">
              Variantes de Interacción
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-emerald-700">Magnético</h3>
                <Magnetic strength={0.5}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-3 shadow-lg">
                    Hover Me
                  </Button>
                </Magnetic>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-teal-700">Tilt Card</h3>
                <Tilt>
                  <TiltContent>
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl shadow-lg border-2 border-teal-200 cursor-pointer">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="text-teal-700">Inclínate</p>
                    </div>
                  </TiltContent>
                </Tilt>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-green-700">Click Effect</h3>
                <Click>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border-2 border-green-200 cursor-pointer">
                    <div className="text-2xl mb-2">⚡</div>
                    <p className="text-green-700">Click Me</p>
                  </div>
                </Click>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-slate-700">Typing Text</h3>
                <div className="bg-gradient-to-r from-emerald-50 to-white p-6 rounded-2xl shadow-lg border-2 border-emerald-200 min-h-[100px] flex items-center justify-center">
                  <TypingText text="Elegancia" duration={150} loop={true} holdDelay={2000}>
                    <TypingTextCursor />
                  </TypingText>
                </div>
              </div>
            </div>
          </div>

          {/* Nueva sección con efectos recién instalados */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-center mb-16 text-gray-800">
              <ShimmeringText 
                text="Efectos Modernos" 
                color="#059669"
                shimmeringColor="#34d399"
                duration={2}
              />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
              {/* Texto Morphing */}
              <div className="bg-white backdrop-blur-xl rounded-3xl p-10 shadow-xl border-2 border-emerald-100">
                <h3 className="text-2xl font-light text-emerald-800 mb-6 text-center">Texto Transformativo</h3>
                <div className="text-center text-3xl font-bold text-emerald-700 mb-4">
                  <MorphingText 
                    text={["Consultoría", "Estrategia", "Excelencia", "Resultados"]}
                    holdDelay={2000}
                    loop={true}
                    className="text-emerald-600"
                  />
                </div>
                <p className="text-gray-600 text-center">Palabras que cambian como tus resultados</p>
              </div>

              {/* Botón Flip como tarjeta */}
              <div className="bg-white backdrop-blur-xl rounded-3xl p-10 shadow-xl border-2 border-teal-100">
                <h3 className="text-2xl font-light text-teal-800 mb-6 text-center">Tarjeta Flip</h3>
                <div className="flex justify-center">
                  <FlipButton className="w-40 h-20">
                    <FlipButtonFront className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl text-lg font-light shadow-lg flex items-center justify-center w-full h-full">
                      Servicios
                    </FlipButtonFront>
                    <FlipButtonBack className="bg-gradient-to-r from-teal-700 to-teal-800 text-white rounded-2xl text-lg font-light shadow-lg flex items-center justify-center w-full h-full">
                      Premium
                    </FlipButtonBack>
                  </FlipButton>
                </div>
                <p className="text-gray-600 text-center mt-4">Hover para revelar</p>
              </div>

              {/* Botón con partículas */}
              <div className="bg-white backdrop-blur-xl rounded-3xl p-10 shadow-xl border-2 border-green-100">
                <h3 className="text-2xl font-light text-green-800 mb-6 text-center">Efectos de Partículas</h3>
                <div className="flex justify-center">
                  <Particles animate={true} className="relative">
                    <RippleButton
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-2xl text-lg font-light shadow-lg"
                    >
                      Click para Magia
                    </RippleButton>
                    <ParticlesEffect 
                      side="top" 
                      count={8} 
                      radius={40} 
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                  </Particles>
                </div>
                <p className="text-gray-600 text-center mt-4">Click para ver ondas</p>
              </div>
            </div>

            {/* Fila adicional con más efectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 backdrop-blur-xl rounded-3xl p-10 shadow-xl border-2 border-slate-200">
                <h3 className="text-2xl font-light text-slate-800 mb-6 text-center">Texto Brillante</h3>
                <div className="text-center text-4xl font-bold mb-4">
                  <ShimmeringText 
                    text="BSB Capital" 
                    color="#059669"
                    shimmeringColor="#34d399"
                    duration={3}
                  />
                </div>
                <p className="text-gray-600 text-center">Brillo que refleja nuestra calidad</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 backdrop-blur-xl rounded-3xl p-10 shadow-xl border-2 border-indigo-200">
                <h3 className="text-2xl font-light text-indigo-800 mb-6 text-center">Combinación de Efectos</h3>
                <div className="text-center">
                  <Magnetic strength={0.3} range={100}>
                    <Tilt>
                      <TiltContent>
                        <Particles animate={true} className="relative">
                          <RippleButton
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl text-lg font-light shadow-xl"
                          >
                            <ShimmeringText 
                              text="Ultra Premium" 
                              color="#ffffff"
                              shimmeringColor="#e0e7ff"
                              duration={1.5}
                            />
                          </RippleButton>
                          <ParticlesEffect 
                            side="top" 
                            count={12} 
                            radius={50} 
                            className="w-1.5 h-1.5 bg-purple-300 rounded-full"
                          />
                        </Particles>
                      </TiltContent>
                    </Tilt>
                  </Magnetic>
                </div>
                <p className="text-gray-600 text-center mt-4">Todos los efectos juntos</p>
              </div>
            </div>
          </div>

          {/* CTA Final con múltiples efectos */}
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extralight mb-12 text-gray-800">
              ¿Preparado para la excelencia?
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Magnetic strength={0.6} range={150}>
                <Click>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white px-12 py-6 shadow-2xl rounded-full text-xl font-light border-2 border-emerald-600"
                  >
                    Comenzar Ahora
                  </Button>
                </Click>
              </Magnetic>
              
              <Magnetic strength={0.3}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-12 py-6 rounded-full text-xl font-light shadow-lg"
                >
                  Más Información
                </Button>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      {/* Fondo de burbujas personalizadas con colores verdosos suaves */}
      <BubbleBackground 
        className="absolute inset-0 opacity-15" 
        colors={softGreenBubbles}
        interactive={true}
      />
    </div>
  );
};

export default PremiumWhiteDemo;