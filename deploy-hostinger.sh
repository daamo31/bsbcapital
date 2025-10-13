#!/bin/bash
# Script para build y deploy a Hostinger

echo "🔧 Instalando dependencias..."
npm install

echo "🏗️ Construyendo aplicación para producción..."
npm run build

echo "✅ Build completado. Los archivos están en la carpeta 'dist'"
echo "📁 Contenido a subir a Hostinger:"
ls -la dist/

echo ""
echo "🚀 SIGUIENTE PASO:"
echo "1. Sube todo el contenido de la carpeta 'dist' a public_html en Hostinger"
echo "2. Configura las variables de entorno en Hostinger"
echo "3. Configura el dominio y SSL"