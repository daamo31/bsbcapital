#!/bin/bash

# 🚀 Script de Deploy para BSB Capital - Solución Cache Busting
# Ejecuta: ./deploy-hostinger.sh

echo "🔧 BSB Capital - Deploy con Cache Busting Forzado"
echo "================================================"

# 1. Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf dist/

# 2. Build con variables de producción
echo "🏗️ Creando build de producción..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build"
    exit 1
fi

# 3. Verificar archivos generados
echo "📁 Archivos generados:"
ls -la dist/assets/

# 4. Mostrar hash de archivos para verificar cambios
echo "🔍 Hashes de archivos CSS/JS:"
find dist/assets/ -name "*.css" -o -name "*.js" | head -2

echo ""
echo "✅ Build completado exitosamente!"
echo "📤 Sube la carpeta 'dist/' completa a Hostinger"
echo ""
echo "🔧 Pasos en Hostinger:"
echo "1. Sube TODO el contenido de dist/ a public_html/"
echo "2. Asegúrate de que el .htaccess se copie"
echo "3. Limpia cache en el panel de Hostinger"
echo "4. Abre en navegador incógnito para verificar"
echo ""
echo "🌐 Los archivos tienen timestamp: $(date +%s)"