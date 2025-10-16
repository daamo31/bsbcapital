import React from 'react';

const ResponsiveTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-2xl md:text-4xl lg:text-6xl font-bold text-center mb-8">
          📱 Test Responsive BSB Capital
        </h1>
        
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🧪 Prueba de Breakpoints</h2>
          
          {/* Indicadores visuales para cada breakpoint */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-100 block xs:hidden">
              📱 Extra Small (menor a 475px)
            </div>
            <div className="p-4 rounded-lg bg-orange-100 hidden xs:block sm:hidden">
              📱 XS (475px - 639px)
            </div>
            <div className="p-4 rounded-lg bg-yellow-100 hidden sm:block md:hidden">
              📟 Small (640px - 767px)
            </div>
            <div className="p-4 rounded-lg bg-green-100 hidden md:block lg:hidden">
              💻 Medium (768px - 1023px)
            </div>
            <div className="p-4 rounded-lg bg-blue-100 hidden lg:block xl:hidden">
              🖥️ Large (1024px - 1279px)
            </div>
            <div className="p-4 rounded-lg bg-purple-100 hidden xl:block 2xl:hidden">
              🖥️ XL (1280px - 1535px)
            </div>
            <div className="p-4 rounded-lg bg-pink-100 hidden 2xl:block">
              🖥️ 2XL (1536px+)
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">📊 Grid Test</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-blue-200 p-4 rounded">Item 1</div>
              <div className="bg-green-200 p-4 rounded">Item 2</div>
              <div className="bg-yellow-200 p-4 rounded">Item 3</div>
              <div className="bg-red-200 p-4 rounded">Item 4</div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">🔤 Typography Test</h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl">
              Este texto cambia de tamaño según el dispositivo
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <a 
            href="/" 
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            ← Volver a BSB Capital
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTest;