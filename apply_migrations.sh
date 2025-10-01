#!/bin/bash

# ================================================================
# SCRIPT DE APLICACIÓN DE MIGRACIONES - BSB Capital
# Fecha: 01/10/2024
# Descripción: Aplica todas las migraciones del sistema de membresías
# ================================================================

echo "🚀 Aplicando migraciones del sistema de membresías BSB Capital..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar que tenemos las herramientas necesarias
if ! command -v supabase &> /dev/null; then
    show_error "Supabase CLI no está instalado"
    echo "Instala con: npm install -g supabase"
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "supabase/config.toml" ]; then
    show_error "No se encontró supabase/config.toml"
    echo "Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar conexión a Supabase
show_message "Verificando conexión a Supabase..."
if ! supabase status &> /dev/null; then
    show_warning "Supabase local no está corriendo"
    show_message "Intentando conectar a Supabase remoto..."
    
    # Pedir confirmación para aplicar en producción
    echo
    read -p "¿Quieres aplicar las migraciones en tu proyecto de Supabase en la nube? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        show_error "Migración cancelada"
        exit 1
    fi
    
    # Aplicar migraciones remotas
    show_message "Aplicando migraciones en Supabase remoto..."
    
    # Aplicar migración principal
    show_message "1/4 Aplicando nuevas tablas..."
    if supabase db push; then
        show_success "Nuevas tablas aplicadas"
    else
        show_error "Error aplicando nuevas tablas"
        exit 1
    fi
else
    # Aplicar migraciones localmente
    show_message "Aplicando migraciones localmente..."
    
    # 1. Aplicar migración principal
    show_message "1/4 Aplicando nuevas tablas..."
    if supabase migration apply 20241001_add_membership_system; then
        show_success "Nuevas tablas aplicadas"
    else
        show_error "Error aplicando nuevas tablas"
        exit 1
    fi
    
    # 2. Aplicar funciones de integración
    show_message "2/4 Aplicando funciones de integración..."
    if supabase migration apply 20241001_integration_functions; then
        show_success "Funciones de integración aplicadas"
    else
        show_error "Error aplicando funciones de integración"
        exit 1
    fi
fi

# 3. Aplicar datos seed
show_message "3/4 Aplicando datos iniciales..."
if psql "$DATABASE_URL" -f supabase/seed.sql &> /dev/null; then
    show_success "Datos iniciales aplicados"
elif supabase db reset &> /dev/null; then
    show_success "Base de datos reseteada con datos iniciales"
else
    show_warning "No se pudieron aplicar datos iniciales automáticamente"
    echo "Ejecuta manualmente: psql \$DATABASE_URL -f supabase/seed.sql"
fi

# 4. Migrar datos existentes
show_message "4/4 Migrando datos existentes..."
if psql "$DATABASE_URL" -c "SELECT migrate_legacy_data_to_new_system();" &> /dev/null; then
    show_success "Datos existentes migrados"
else
    show_warning "No se pudieron migrar datos existentes automáticamente"
    echo "Ejecuta manualmente: SELECT migrate_legacy_data_to_new_system();"
fi

echo
echo "=================================================="
show_success "¡Migraciones completadas!"
echo
show_message "Próximos pasos:"
echo "1. Verifica que todo funciona: SELECT * FROM verify_migration_integrity();"
echo "2. Configura las variables de Stripe en tu .env.local"
echo "3. Prueba el sistema de membresías en tu aplicación"
echo
show_warning "Si algo sale mal, puedes hacer rollback con: SELECT rollback_migration();"
echo