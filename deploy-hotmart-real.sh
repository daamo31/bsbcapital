#!/bin/bash

# 🚀 Deploy BSB Capital con Hotmart Real
# ====================================

echo "🎯 Iniciando deploy de BSB Capital con Hotmart configurado..."

# Configurar variables de entorno para producción
export VITE_HOTMART_PRODUCT_ID=6308462
export VITE_HOTMART_CLIENT_ID=e0a0d160-576f-4a13-84f8-9d55965204ae
export VITE_HOTMART_CLIENT_SECRET=33c5e175-88ee-4d8c-a2f2-225f14d03435
export VITE_HOTMART_EMBED_MODE=true
export VITE_SITE_URL=https://bsbcapital.io

echo "✅ Variables de Hotmart configuradas"
echo "   Product ID: $VITE_HOTMART_PRODUCT_ID"
echo "   Client ID: ${VITE_HOTMART_CLIENT_ID:0:8}..."
echo "   Embed Mode: $VITE_HOTMART_EMBED_MODE"

# Build del proyecto
echo "🔨 Construyendo proyecto..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    echo "❌ Error: Build falló"
    exit 1
fi

echo "✅ Build completado"

# Subir archivos (ajustar según tu método de deploy)
echo "🚀 Desplegando a producción..."

# Aquí agregarías tu método específico de deploy
# Por ejemplo:
# rsync -avz dist/ usuario@tu-servidor:/path/to/web/
# o
# scp -r dist/* usuario@tu-servidor:/public_html/

echo "🎉 Deploy completado!"
echo ""
echo "🔗 URLs de prueba:"
echo "   Academia: https://bsbcapital.io/academia"
echo "   Ejemplo: https://bsbcapital.io/examples/ejemplo-uso-hotmart"
echo "   Demo: https://bsbcapital.io/content/hotmart-professional-integration"
echo ""
echo "📋 Verificaciones post-deploy:"
echo "   ✓ Login como admin en /academia"
echo "   ✓ Probar video embedded"
echo "   ✓ Verificar que no hay redirects externos"
echo "   ✓ Confirmar branding BSB Capital mantenido"