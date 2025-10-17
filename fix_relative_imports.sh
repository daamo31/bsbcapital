#!/bin/bash

# Script para corregir importaciones relativas en componentes movidos
PROJECT_ROOT="/Users/daniel/Downloads/horizons-export-817ad863-5db3-450e-8aa2-198248142884"

echo "Corrigiendo importaciones relativas en componentes movidos..."

# Corregir importaciones de contextos y hooks desde componentes
find "$PROJECT_ROOT/src/components/auth" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../contexts/|from '\''@/contexts/|g'
find "$PROJECT_ROOT/src/components/auth" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../lib/|from '\''@/lib/|g'
find "$PROJECT_ROOT/src/components/auth" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../hooks/|from '\''@/hooks/|g'

find "$PROJECT_ROOT/src/components/academy" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../contexts/|from '\''@/contexts/|g'
find "$PROJECT_ROOT/src/components/academy" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../lib/|from '\''@/lib/|g'
find "$PROJECT_ROOT/src/components/academy" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../hooks/|from '\''@/hooks/|g'

find "$PROJECT_ROOT/src/components/consultations" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../contexts/|from '\''@/contexts/|g'
find "$PROJECT_ROOT/src/components/consultations" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../lib/|from '\''@/lib/|g'
find "$PROJECT_ROOT/src/components/consultations" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../hooks/|from '\''@/hooks/|g'

find "$PROJECT_ROOT/src/components/hotmart" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../contexts/|from '\''@/contexts/|g'
find "$PROJECT_ROOT/src/components/hotmart" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../lib/|from '\''@/lib/|g'
find "$PROJECT_ROOT/src/components/hotmart" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../hooks/|from '\''@/hooks/|g'

find "$PROJECT_ROOT/src/components/layout" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../contexts/|from '\''@/contexts/|g'
find "$PROJECT_ROOT/src/components/layout" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../lib/|from '\''@/lib/|g'
find "$PROJECT_ROOT/src/components/layout" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../hooks/|from '\''@/hooks/|g'

find "$PROJECT_ROOT/src/components/common" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../contexts/|from '\''@/contexts/|g'
find "$PROJECT_ROOT/src/components/common" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../lib/|from '\''@/lib/|g'
find "$PROJECT_ROOT/src/components/common" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''../hooks/|from '\''@/hooks/|g'

# Corregir importaciones de UI components que usan rutas relativas incorrectas
find "$PROJECT_ROOT/src/components" -name "*.jsx" -o -name "*.js" | xargs sed -i '' 's|from '\''./ui/|from '\''@/components/ui/|g'

echo "Importaciones relativas corregidas"