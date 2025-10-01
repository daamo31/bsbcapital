#!/bin/bash

echo "🚀 Aplicando datos seed a Supabase..."

# Ejecutar el script SQL en tu proyecto de Supabase
supabase db remote exec sql "$(cat manual_seed.sql)"

echo "✅ ¡Datos aplicados exitosamente!"
echo "🎯 Tu sistema de membresías está listo"