# 📖 Arquitectura de Calidad de Código - BSB Capital

Este documento explica **cómo** y **por qué** se configuró cada herramienta de calidad de código en el proyecto.

---

## 🎯 Objetivo General

Implementar un sistema de **"shift-left testing"** donde los errores se detectan lo antes posible en el ciclo de desarrollo:

```
Escribir código → Pre-commit (lint) → Tests → Build → Deploy
       ↓              ↓                 ↓
    Errores      Errores de         Errores de
    sintaxis     estilo/formato     lógica
```

---

## 1️⃣ Husky + lint-staged

### ¿Qué es?

- **Husky**: Herramienta que permite ejecutar scripts en los "hooks" de Git (pre-commit, pre-push, etc.)
- **lint-staged**: Ejecuta linters solo en los archivos que están en "staging" (los que vas a commitear)

### ¿Por qué se usa?

1. **Prevención de código sucio**: Bloquea commits que no cumplan con los estándares
2. **Rapidez**: Solo analiza archivos modificados, no todo el proyecto
3. **Automatización**: No dependes de que el desarrollador recuerde ejecutar el linter

### Cómo está configurado

#### `.husky/pre-commit`

```bash
npx lint-staged
```

Este archivo se ejecuta automáticamente antes de cada `git commit`.

#### `package.json` → `lint-staged`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

**Explicación:**

- Para archivos JS/JSX/TS/TSX: Primero ESLint corrige errores, luego Prettier formatea
- Para JSON/CSS/MD: Solo Prettier formatea (no tienen linting)
- `--fix` y `--write`: Corrigen automáticamente lo que pueden

#### `.prettierrc`

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

**Por qué estas reglas:**

- `singleQuote: true`: Consistencia con el estilo del proyecto
- `printWidth: 100`: Balance entre legibilidad y líneas muy largas
- `trailingComma: "es5"`: Facilita diffs en Git (cada línea es independiente)
- `endOfLine: "lf"`: Evita problemas entre Windows/Mac/Linux

### Flujo de ejecución

```
git add archivo.js
git commit -m "feat: nueva función"
    ↓
Husky intercepta el commit
    ↓
lint-staged ejecuta:
  1. eslint --fix archivo.js
  2. prettier --write archivo.js
    ↓
¿Hay errores no auto-corregibles?
    ↓
  SÍ → Commit bloqueado, muestra errores
  NO → Commit exitoso ✓
```

---

## 2️⃣ Vitest (Tests Unitarios)

### ¿Qué es?

Vitest es un framework de testing ultrarrápido, compatible con Vite y con la misma API que Jest.

### ¿Por qué Vitest y no Jest?

| Característica | Vitest             | Jest                    |
| -------------- | ------------------ | ----------------------- |
| Velocidad      | ⚡ Muy rápido      | 🐢 Más lento            |
| Configuración  | Usa vite.config.js | jest.config.js separado |
| Hot Reload     | ✅ Sí              | ❌ No                   |
| ESM nativo     | ✅ Sí              | ⚠️ Complicado           |

### Cómo está configurado

#### `vite.config.js` → `test`

```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  // ...resto de config
});
```

**Explicación:**

- `globals: true`: No necesitas importar `describe`, `it`, `expect` en cada test
- `environment: 'jsdom'`: Simula un navegador para testear componentes React
- `setupFiles`: Se ejecuta antes de cada archivo de tests
- `include`: Patrón de archivos que son tests

#### `src/test/setup.js`

```javascript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup(); // Limpia el DOM después de cada test
});

// Mocks necesarios para el entorno de test
global.ResizeObserver = class ResizeObserver { ... };
global.IntersectionObserver = class IntersectionObserver { ... };
```

**Por qué estos mocks:**

- `ResizeObserver` y `IntersectionObserver`: APIs del navegador que no existen en Node.js
- Sin estos mocks, los componentes que usan Radix UI fallarían

### Estructura de un test

```javascript
import { describe, it, expect } from 'vitest';

describe('Nombre del grupo', () => {
  it('debería hacer algo', () => {
    const resultado = miFuncion(input);
    expect(resultado).toBe(valorEsperado);
  });
});
```

**Anatomía:**

- `describe`: Agrupa tests relacionados
- `it` (o `test`): Un caso de prueba individual
- `expect`: Aserción que verifica el resultado

---

## 3️⃣ Tests de Stripe (stripeProducts.js)

### ¿Por qué centralizar los Price IDs?

**Antes (disperso):**

```javascript
// En Consultoria.jsx
const priceId = 'price_1RtYGs...';

// En MembresiasDB.jsx
const priceId = 'price_1SSshW...';

// En AcademiaCatalog.jsx
const priceId = 'price_1SaXVj...';
```

**Después (centralizado):**

```javascript
// En stripeProducts.js
export const CONSULTATION_PRICES = { ... };
export const PACKAGE_PRICES = { ... };
export const MEMBERSHIP_PRICES = { ... };
export const ACADEMY_PRICES = { ... };
```

**Ventajas:**

1. **Un solo lugar para actualizar** si Stripe cambia un Price ID
2. **Tests automáticos** que verifican que todos los IDs son válidos
3. **Documentación implícita** de todos los productos
4. **Prevención de errores** por typos en Price IDs

### Qué testea stripeProducts.test.js

```javascript
// 1. Validación de formato de Price IDs
expect(isValidStripePriceId('price_1RtYGs...')).toBe(true);

// 2. Precios correctos
expect(CONSULTATION_PRICES['30min'].price).toBe(200);

// 3. Descuentos calculados correctamente
expect(member.regular_price - member.member_price).toBe(15); // 20% de 75

// 4. Todos los productos tienen Price IDs válidos
Object.values(PACKAGE_PRICES).forEach((pkg) => {
  expect(isValidStripePriceId(pkg.stripe_price_id_annual)).toBe(true);
});
```

---

## 4️⃣ Storybook

### ¿Qué es?

Herramienta para desarrollar y documentar componentes UI de forma aislada.

### ¿Por qué se usa?

1. **Desarrollo aislado**: Crear componentes sin necesidad de la app completa
2. **Documentación visual**: Ver todos los estados de un componente
3. **Testing visual**: Detectar regresiones de UI
4. **Colaboración**: Diseñadores pueden ver componentes sin ejecutar la app

### Cómo está configurado

```
.storybook/
├── main.js      # Configuración principal
└── preview.js   # Decoradores globales
```

---

## 📊 Resumen de Archivos Clave

| Archivo                     | Propósito                    |
| --------------------------- | ---------------------------- |
| `.husky/pre-commit`         | Hook que ejecuta lint-staged |
| `.prettierrc`               | Reglas de formateo           |
| `vite.config.js` → `test`   | Configuración de Vitest      |
| `src/test/setup.js`         | Setup global de tests        |
| `src/lib/stripeProducts.js` | Price IDs centralizados      |
| `src/lib/*.test.js`         | Tests unitarios              |
| `.storybook/`               | Configuración de Storybook   |

---

## 🔄 Flujo de Desarrollo Completo

```
1. Escribir código
   ↓
2. git add archivos
   ↓
3. git commit
   ↓
4. Husky ejecuta lint-staged
   ├─ ESLint corrige errores
   └─ Prettier formatea
   ↓
5. ¿Errores? → Corregir y volver a 2
   ↓
6. Commit exitoso
   ↓
7. npm test (CI/CD)
   ↓
8. Deploy
```

---

## ❓ FAQ

### ¿Por qué usar `--fix` en ESLint?

Corrige automáticamente errores simples (espacios, punto y coma, imports no usados), ahorrando tiempo al desarrollador.

### ¿Por qué tests unitarios si hay tests manuales?

Los tests manuales son lentos, propensos a errores humanos, y no escalan. Los tests unitarios:

- Se ejecutan en segundos
- Detectan regresiones inmediatamente
- Documentan el comportamiento esperado

### ¿Por qué jsdom en lugar de happy-dom?

jsdom tiene mejor compatibilidad con Testing Library y es el estándar de facto para tests de React.

### ¿Por qué 30 tests no cubren todo el código?

Los tests actuales cubren la **lógica crítica** (precios, pagos). Se pueden agregar más tests incrementalmente siguiendo el principio "test as you go".
