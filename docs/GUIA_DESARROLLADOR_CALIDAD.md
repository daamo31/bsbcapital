# 🛠️ Guía para Desarrolladores - Calidad de Código

Esta guía documenta las herramientas de calidad de código configuradas en el proyecto.

---

## 📋 Resumen de Configuraciones

| Herramienta             | Propósito           | Comando                          |
| ----------------------- | ------------------- | -------------------------------- |
| **Husky + lint-staged** | Pre-commit hooks    | Automático al hacer `git commit` |
| **Vitest**              | Tests unitarios     | `npm test`                       |
| **Storybook**           | Documentación de UI | `npm run storybook`              |

---

## 1️⃣ Pre-commit Hooks (Husky + lint-staged)

### Archivos de Configuración

| Archivo                        | Descripción                                |
| ------------------------------ | ------------------------------------------ |
| `.husky/pre-commit`            | Script que se ejecuta antes de cada commit |
| `.prettierrc`                  | Reglas de formateo de código               |
| `package.json` → `lint-staged` | Configuración de qué comandos ejecutar     |

### ¿Cómo funciona?

1. Haces `git add` de tus archivos
2. Ejecutas `git commit -m "tu mensaje"`
3. **Automáticamente** se ejecuta:
   - ESLint (corrige errores de linting)
   - Prettier (formatea el código)
4. Si hay errores que no se pueden auto-corregir, el commit se **bloquea**

### Configuración en `package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

### Reglas de Prettier (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### ¿Qué hacer si el commit falla?

```bash
# Ver los errores
npm run lint

# Corregir manualmente y volver a intentar
git add .
git commit -m "tu mensaje"
```

---

## 2️⃣ Tests Unitarios (Vitest)

### Archivos de Configuración

| Archivo                               | Descripción                       |
| ------------------------------------- | --------------------------------- |
| `vite.config.js` → `test`             | Configuración de Vitest           |
| `src/test/setup.js`                   | Setup global para todos los tests |
| `src/lib/consultationPricing.test.js` | Tests de lógica de precios        |

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo)
npm test -- --watch

# Ejecutar un archivo específico
npm test -- --run src/lib/consultationPricing.test.js

# Ver UI de Vitest (muy útil para debug)
npm run test:ui

# Ver cobertura de código
npm run test:coverage
```

### Configuración en `vite.config.js`

```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  // ... resto de config
});
```

### Setup Global (`src/test/setup.js`)

Incluye mocks necesarios para el entorno de testing:

- `@testing-library/jest-dom` para assertions del DOM
- Mock de `window.matchMedia`
- Mock de `IntersectionObserver`
- Mock de `ResizeObserver`

### ¿Cómo crear un nuevo test?

1. Crea un archivo con extensión `.test.js` o `.spec.js`
2. Usa la estructura de Vitest:

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tuFuncion } from './tuArchivo';

describe('Nombre del grupo de tests', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpia mocks entre tests
  });

  it('debería hacer algo específico', () => {
    const resultado = tuFuncion(input);
    expect(resultado).toBe(valorEsperado);
  });
});
```

### Tests Existentes: `consultationPricing.test.js`

Cubre la lógica crítica de precios:

| Test                    | Descripción                               |
| ----------------------- | ----------------------------------------- |
| `CONSULTATION_PRODUCTS` | Verifica precios de consultoría 30/60 min |
| `getMemberDiscountInfo` | Calcula descuentos para miembros          |
| `formatPrice`           | Formateo correcto en EUR                  |

---

## 3️⃣ Storybook (Documentación de UI)

### Archivos de Configuración

| Archivo                 | Descripción                       |
| ----------------------- | --------------------------------- |
| `.storybook/main.js`    | Configuración principal           |
| `.storybook/preview.js` | Decoradores y parámetros globales |
| `src/stories/`          | Carpeta con stories de ejemplo    |

### Comandos Disponibles

```bash
# Iniciar Storybook en desarrollo (puerto 6006)
npm run storybook

# Build estático para producción
npm run build-storybook
```

### ¿Cómo crear una Story?

1. Crea un archivo `TuComponente.stories.jsx` junto a tu componente
2. Estructura básica:

```jsx
import TuComponente from './TuComponente';

export default {
  title: 'Categoria/TuComponente',
  component: TuComponente,
  tags: ['autodocs'],
  argTypes: {
    // Define controles para las props
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
};

// Story por defecto
export const Default = {
  args: {
    children: 'Texto del botón',
    variant: 'primary',
  },
};

// Variantes
export const Secondary = {
  args: {
    children: 'Botón secundario',
    variant: 'secondary',
  },
};
```

### Acceder a Storybook

1. Ejecuta `npm run storybook`
2. Abre el navegador en `http://localhost:6006`
3. Navega por los componentes en el sidebar

---

## 🔄 Flujo de Trabajo Recomendado

### Para desarrollo diario:

```bash
# 1. Inicia el servidor de desarrollo
npm run dev

# 2. En otra terminal, ejecuta los tests en modo watch
npm test -- --watch

# 3. (Opcional) Abre Storybook para documentar componentes
npm run storybook
```

### Antes de hacer commit:

```bash
# 1. Asegúrate de que los tests pasan
npm test -- --run

# 2. Haz commit (lint-staged se ejecutará automáticamente)
git add .
git commit -m "feat: descripción de cambios"
```

---

## 📁 Estructura de Archivos Relacionados

```
proyecto/
├── .husky/
│   └── pre-commit          # Hook de pre-commit
├── .prettierrc             # Configuración de Prettier
├── .storybook/
│   ├── main.js             # Config principal Storybook
│   └── preview.js          # Decoradores globales
├── src/
│   ├── test/
│   │   └── setup.js        # Setup de tests
│   ├── lib/
│   │   └── consultationPricing.test.js  # Tests de precios
│   └── stories/            # Stories de Storybook
├── package.json            # Scripts y dependencias
└── vite.config.js          # Configuración de Vite + Vitest
```

---

## ❓ Solución de Problemas

### Los tests fallan con "ReferenceError: matchMedia/ResizeObserver is not defined"

→ Verifica que `src/test/setup.js` tiene los mocks correctos

### Husky no se ejecuta en commits

→ Ejecuta `npm run prepare` para reinicializar Husky

### Storybook no carga los estilos

→ Importa tus CSS globales en `.storybook/preview.js`

### ESLint bloquea el commit pero no veo errores

→ Ejecuta `npm run lint` para ver los errores detallados

---

## 📚 Referencias

- [Vitest Documentation](https://vitest.dev/)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)

---

## 4️⃣ Testing de Stripe (Sistema de Pagos)

### Estado: ✅ Todo Configurado para Probar

### Archivo de Configuración Centralizado

| Archivo                          | Descripción                                 |
| -------------------------------- | ------------------------------------------- |
| `src/lib/stripeProducts.js`      | Todos los Price IDs de Stripe centralizados |
| `src/lib/stripeProducts.test.js` | 20 tests para validar productos             |

### Ejecutar Tests de Stripe

```bash
# Tests de productos Stripe (20 tests)
npm test -- --run src/lib/stripeProducts.test.js

# Tests de pricing de consultorías (10 tests)
npm test -- --run src/lib/consultationPricing.test.js

# Todos los tests de /lib (30 tests)
npm test -- --run src/lib/
```

### Inventario Completo de Productos Stripe

#### Consultorías

| Producto   | Price ID                         | Precio |
| ---------- | -------------------------------- | ------ |
| 30 minutos | `price_1RtYGsJmSk3VG9oicAWmQ4sN` | 200€   |
| 60 minutos | `price_1RtYFkJmSk3VG9oi8wUdMK5k` | 300€   |
| **TEST**   | `price_1SKG4NJmSk3VG9oi6CjvmqLC` | 1€     |

#### Paquetes BSB Capital

| Producto          | Price ID                         | Precio |
| ----------------- | -------------------------------- | ------ |
| Onboarding Cripto | `price_1SSshWJmSk3VG9oiU1cBNWgf` | 390€   |
| Inversor Premium  | `price_1SDKb2JmSk3VG9oiJr1unLZZ` | 2400€  |
| Gestión Tesorería | `price_1SSsfoJmSk3VG9oi70AskCZv` | 1200€  |

#### Membresía Exclusiva BSB

| Plan    | Price ID                         | Precio   |
| ------- | -------------------------------- | -------- |
| Mensual | `price_1SaXofJmSk3VG9oigjDZtcF6` | 40€/mes  |
| Anual   | `price_1SaXpNJmSk3VG9oifsW4ajZ2` | 400€/año |

#### Academia

| Plan    | Price ID                         | Precio   |
| ------- | -------------------------------- | -------- |
| Mensual | `price_1SaXVjJmSk3VG9oix0Pu2N9J` | 29€/mes  |
| Anual   | `price_1SDKgoJmSk3VG9oiamJj88De` | 290€/año |

### Probar Flujo de Checkout

Para probar el flujo completo de pago sin cobrar el precio real:

1. **Usa el Price ID de TEST**: `price_1SKG4NJmSk3VG9oi6CjvmqLC`
2. Ve a `/consultoria` y selecciona "Prueba" como duración
3. Completa el flujo de reserva
4. En Stripe Checkout, usa la tarjeta de prueba: `4242 4242 4242 4242`

### Tarjetas de Prueba de Stripe

| Tarjeta               | Resultado               |
| --------------------- | ----------------------- |
| `4242 4242 4242 4242` | ✅ Pago exitoso         |
| `4000 0000 0000 0002` | ❌ Tarjeta rechazada    |
| `4000 0000 0000 9995` | ❌ Fondos insuficientes |

> **Nota**: Usa cualquier fecha futura y cualquier CVC de 3 dígitos.

### Usar stripeProducts.js en tu código

```javascript
import {
  CONSULTATION_PRICES,
  PACKAGE_PRICES,
  MEMBERSHIP_PRICES,
  ACADEMY_PRICES,
  TEST_PRICE_ID,
  isValidStripePriceId,
} from '@/lib/stripeProducts';

// Obtener price ID de test
const testPriceId = TEST_PRICE_ID;

// Validar un price ID
if (isValidStripePriceId(priceId)) {
  // Price ID válido
}

// Acceder a productos
const onboarding = PACKAGE_PRICES.onboarding_crypto;
console.log(onboarding.stripe_price_id_annual); // price_1SSshW...
```

### Verificar que Todo Funciona

```bash
# 1. Ejecutar todos los tests
npm test -- --run src/lib/
# Resultado esperado: 30 tests passed

# 2. Iniciar la app
npm run dev

# 3. Ir a /consultoria, seleccionar "Prueba", completar flujo
# 4. Verificar redirección a Stripe Checkout
```
