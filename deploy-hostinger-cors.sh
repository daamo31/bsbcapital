#!/bin/bash

echo "🚀 DEPLOY HOSTINGER CON CORS FIX"
echo "==============================="

# 1. Verificar que el .htaccess tiene configuración CORS
echo "🔍 Verificando configuración CORS en .htaccess..."

if grep -q "Access-Control-Allow-Origin" dist/.htaccess; then
    echo "✅ CORS configurado en .htaccess"
else
    echo "❌ CORS no encontrado en .htaccess"
    echo "📝 Copiando configuración CORS..."
    cp public/.htaccess dist/.htaccess
fi

# 2. Mostrar configuración CORS actual
echo ""
echo "🔧 Configuración CORS actual:"
echo "-----------------------------"
grep -A 5 -B 1 "CORS Headers" dist/.htaccess || echo "No se encontró configuración CORS"

echo ""
echo "📁 Archivos listos para subir a Hostinger:"
echo "==========================================="
ls -la dist/

echo ""
echo "🔧 INSTRUCCIONES DE DEPLOY:"
echo "1. Subir TODO el contenido de la carpeta 'dist/' a public_html/"
echo "2. Asegurar que el archivo .htaccess se copie correctamente"
echo "3. Verificar permisos del .htaccess (644)"
echo ""
echo "🧪 PARA PROBAR:"
echo "1. Ir a https://bsbcapital.io"
echo "2. Abrir DevTools (F12) > Console"
echo "3. Buscar errores CORS - NO deberían aparecer"
echo "4. Probar login/registro"
echo ""
echo "📋 Si persisten los errores:"
echo "- Verificar que .htaccess se subió correctamente"
echo "- Verificar permisos del archivo .htaccess"
echo "- Contactar soporte Hostinger si mod_headers no está habilitado"

# 3. Verificar tamaño de archivos críticos
echo ""
echo "📊 TAMAÑOS DE ARCHIVOS PRINCIPALES:"
echo "=================================="
du -h dist/index.html
du -h dist/assets/*.js 2>/dev/null | head -3
echo "Total: $(du -sh dist | cut -f1)"