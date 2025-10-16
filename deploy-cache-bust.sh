#!/bin/bash

# Script para deploy con cache busting automático
# Uso: ./deploy-cache-bust.sh

echo "🚀 Iniciando deploy con cache busting..."

# 1. Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf dist/

# 2. Crear build de producción con timestamp único
echo "🔨 Creando build de producción..."
CACHE_BUST_TIME=$(date +%s)
echo "Cache bust timestamp: $CACHE_BUST_TIME"

# Construir con variable de entorno para cache busting
VITE_CACHE_BUST=$CACHE_BUST_TIME npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build. Abortando deploy."
    exit 1
fi

# 3. Mostrar archivos generados
echo "📦 Archivos generados:"
ls -la dist/assets/

# 4. Copiar .htaccess optimizado
echo "⚙️ Configurando cache headers..."
cp .htaccess-no-cache dist/.htaccess

# 5. Crear archivo de versión para debugging
echo "📝 Creando archivo de versión..."
cat > dist/version.json << EOF
{
  "version": "$(date '+%Y-%m-%d %H:%M:%S')",
  "timestamp": $CACHE_BUST_TIME,
  "git_commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "cache_bust": true
}
EOF

# 6. Mensaje final
echo "✅ Build completado con cache busting!"
echo "📋 Próximos pasos:"
echo "   1. Sube el contenido de 'dist/' a Hostinger"
echo "   2. Asegúrate de que .htaccess se copie correctamente"
echo "   3. Visita tu sitio con ?v=$CACHE_BUST_TIME para forzar recarga"
echo ""
echo "🔗 URL de prueba: https://tudominio.com/?v=$CACHE_BUST_TIME"
echo "🔗 Versión: https://tudominio.com/version.json"

# 7. Opcional: mostrar comandos para debugging
echo ""
echo "🛠️ Comandos de debugging:"
echo "   curl -I https://tudominio.com/ | grep -i cache"
echo "   curl https://tudominio.com/version.json"