# Pruebas de Formularios - ConsultationPostPayment

## Descripción

Suite completa de pruebas unitarias para los formularios de post-pago de consultas. Las pruebas verifican:

- ✅ Renderizado correcto de cada tipo de formulario
- ✅ Campos específicos según el tipo de consulta
- ✅ Envío de emails de confirmación (cliente)
- ✅ Envío de emails de notificación (admin)
- ✅ Funcionalidad "Completar Más Tarde" (sin emails)
- ✅ Validación de campos obligatorios

## Tipos de Formularios Probados

### 1. Financial Planning (financial_planning)

- **Nombre visible**: "Optimización de cartera"
- **Email enviado**: `sendConsultationPortfolioOptimization()`
- **Campos específicos**: País, ingresos, ahorros, deudas

### 2. Crypto & Web3 (portfolio)

- **Nombre visible**: "Crypto & Web3"
- **Email enviado**: `sendConsultationCryptoWeb3()`
- **Campos específicos**: Objetivos, experiencia, tamaño de cartera

### 3. Onboarding Crypto (onboarding_crypto)

- **Nombre visible**: "Onboarding cripto"
- **Email enviado**: `sendConsultationCryptoOnboarding()`
- **Campos específicos**: Experiencia cripto, capital inicial, objetivos

### 4. Gestión de Tesorería (crypto_advanced)

- **Nombre visible**: "Gestión de tesorería cripto para empresas"
- **Email enviado**: `sendConsultationTreasuryCrypto()`
- **Campos específicos**: Nombre empresa, país, contacto, volumen cripto

## Instalación

Instalar dependencias de testing:

```bash
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Comandos

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar pruebas en modo watch (recomendado durante desarrollo)

```bash
npm test -- --watch
```

### Ejecutar pruebas con interfaz visual

```bash
npm run test:ui
```

### Generar reporte de cobertura

```bash
npm run test:coverage
```

### Ejecutar solo pruebas específicas

```bash
# Solo formulario Financial Planning
npm test -- --grep "Financial Planning"

# Solo pruebas de emails
npm test -- --grep "email"

# Solo pruebas de "Completar Más Tarde"
npm test -- --grep "Completar Más Tarde"
```

## Estructura de las Pruebas

```
src/
├── pages/
│   ├── ConsultationPostPayment.jsx
│   └── __tests__/
│       └── ConsultationPostPayment.test.jsx
├── test/
│   └── setup.js
└── components/
    └── consultations/
        └── forms/
            ├── FinancialPlanningForm.jsx
            ├── OnboardingCryptoForm.jsx
            ├── GenericConsultationForm.jsx
            └── TreasuryEnterpriseForm.jsx
```

## Verificación de Emails

Las pruebas mockean el servicio `emailService` para verificar:

1. **Email de confirmación al cliente** - Se envía al completar el formulario
2. **Email de notificación al admin** - Se envía a info@bsbcapital.io
3. **NO se envían emails** - Al usar "Completar Más Tarde"

### Ejemplo de verificación:

```javascript
// Verifica que se envió el email correcto
expect(emailService.sendConsultationCryptoWeb3).toHaveBeenCalledWith(
  expect.objectContaining({
    name: 'Test User',
    email: 'test@example.com',
    consultationType: 'Crypto & Web3',
  })
);

// Verifica que NO se enviaron emails
expect(emailService.sendConsultationCryptoWeb3).not.toHaveBeenCalled();
```

## Casos de Prueba Incluidos

### ✅ Renderizado de Formularios

- [x] Muestra el nombre correcto del tipo de consulta
- [x] Renderiza el formulario específico según el tipo
- [x] Muestra fecha, hora y duración correctamente

### ✅ Validación

- [x] Valida campos obligatorios antes de enviar
- [x] Muestra mensajes de error apropiados
- [x] Valida formato de email

### ✅ Envío de Emails

- [x] Envía email de confirmación al cliente
- [x] Envía email de notificación al admin
- [x] Usa el template correcto según tipo de consulta
- [x] NO envía emails al usar "Completar Más Tarde"

### ✅ Guardado Parcial

- [x] Guarda progreso en form_data_json
- [x] Permite continuar después
- [x] No valida campos al guardar parcialmente
- [x] Redirige a área de cliente

## Resultados Esperados

Al ejecutar `npm test`, deberías ver algo como:

```
 ✓ src/pages/__tests__/ConsultationPostPayment.test.jsx (12 tests) 1234ms
   ✓ ConsultationPostPayment - Formularios
     ✓ Formulario Financial Planning (Optimización de cartera)
       ✓ debe renderizar el formulario de Financial Planning correctamente
       ✓ debe mostrar campos específicos de Financial Planning
       ✓ debe enviar emails correctos al completar formulario Financial Planning
     ✓ Formulario Crypto Web3 (portfolio)
       ✓ debe mostrar el nombre correcto "Crypto & Web3"
       ✓ debe usar GenericConsultationForm para tipo portfolio
       ✓ debe enviar email crypto web3 al completar formulario portfolio
     ✓ Formulario Onboarding Crypto
       ✓ debe renderizar OnboardingCryptoForm
       ✓ debe enviar email de onboarding crypto
     ✓ Formulario Gestión de Tesorería Cripto
       ✓ debe mostrar nombre correcto
       ✓ debe renderizar TreasuryEnterpriseForm con campos empresariales
       ✓ debe enviar email de treasury crypto
     ✓ Funcionalidad "Completar Más Tarde"
       ✓ debe guardar datos parciales sin enviar emails

Test Files  1 passed (1)
     Tests  12 passed (12)
  Start at  15:30:00
  Duration  1.23s
```

## Troubleshooting

### Error: "Cannot find module '@testing-library/react'"

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Error: "window is not defined"

Asegúrate de que `vitest.config.js` tiene:

```javascript
test: {
  environment: 'jsdom';
}
```

### Los mocks no funcionan

Verifica que los mocks están antes de los imports en el archivo de prueba.

## CI/CD Integration

Para integrar en GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Próximas Mejoras

- [ ] Tests E2E con Playwright
- [ ] Tests de integración con Supabase real
- [ ] Tests de accesibilidad (a11y)
- [ ] Tests de performance
- [ ] Snapshots de UI

## Soporte

Para preguntas o problemas, contactar al equipo de desarrollo.
