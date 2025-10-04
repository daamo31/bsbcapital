# 🚀 Guía de Deploy a Producción - BSB Capital

## ⚠️ **IMPORTANTE - Seguridad de API Keys**

### 📍 **Estado Actual**
- ✅ **Desarrollo:** Funciona inmediatamente (API key incluida en código)
- ⚠️ **Producción:** Requiere configuración de variable de entorno

## 🔒 **Para Deploy Seguro a Producción**

### Paso 1: Configurar API Key en Supabase (OBLIGATORIO)

#### Opción A: Dashboard Web
1. Ve a: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/settings/edge-functions
2. En "Environment Variables":
   - **Variable Name:** `RESEND_API_KEY`
   - **Value:** `re_Te7ktzMc_Mc8vbmFez55QdgjnGhNMzW7M`
3. Guarda los cambios

#### Opción B: CLI (si tienes permisos)
```bash
supabase secrets set RESEND_API_KEY=re_Te7ktzMc_Mc8vbmFez55QdgjnGhNMzW7M
```

### Paso 2: Verificar Configuración
```bash
# Ver variables de entorno configuradas
supabase secrets list
```

### Paso 3: Verificar en Logs
Los logs de la función mostrarán:
- ✅ **Producción:** "Usando API key de variable de entorno (seguro para producción)"
- ⚠️ **Desarrollo:** "Usando API key de desarrollo - NO usar en producción"

## 🧪 **Testing de Configuración**

### Test de Desarrollo (Actual)
```javascript
// Este funciona AHORA sin configuración
const testDev = async () => {
  const { data, error } = await supabase.functions.invoke('resend-emails', {
    body: {
      type: 'test',
      to: 'danieldelamo31@gmail.com',
      data: { name: 'Test Desarrollo' }
    }
  });
  console.log('Dev test:', { data, error });
};
```

### Test de Producción
```javascript
// Este solo funcionará después de configurar la variable de entorno
const testProd = async () => {
  // Mismo código, pero usará la API key de variable de entorno
  const { data, error } = await supabase.functions.invoke('resend-emails', {
    body: {
      type: 'test',
      to: 'danieldelamo31@gmail.com',
      data: { name: 'Test Producción' }
    }
  });
  console.log('Prod test:', { data, error });
};
```

## 🔄 **Flujo de Deploy Recomendado**

### 1. **Testing Local** (Ya funciona)
- Usar función actual con API key incluida
- Probar todos los tipos de email
- Verificar integración completa

### 2. **Staging/Pre-producción**
- Configurar `RESEND_API_KEY` en variables de entorno
- Verificar que los logs muestran "API key de variable de entorno"
- Probar flujo completo

### 3. **Producción**
- Variables de entorno configuradas ✅
- API key segura (no en código) ✅
- Logs de producción limpios ✅

## 🛡️ **Buenas Prácticas de Seguridad**

### ✅ **Sí hacer:**
- Usar variables de entorno para API keys en producción
- Rotar API keys periódicamente
- Monitorear logs de uso
- Tener API keys separadas para dev/prod

### ❌ **No hacer:**
- Dejar API keys en código fuente en producción
- Compartir API keys en chat/email
- Usar misma API key para dev y prod
- Subir API keys a repositorios públicos

## 🔧 **Comandos de Mantenimiento**

### Ver logs de función
```bash
supabase functions logs resend-emails --follow
```

### Redeploy función
```bash
supabase functions deploy resend-emails
```

### Verificar estado
```bash
supabase projects list
supabase functions list
```

## 📊 **Monitoreo en Producción**

### Verificar en Dashboard
- Ve a: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/functions
- Revisa logs de `resend-emails`
- Confirma que aparece: "API key de variable de entorno"

### Alertas a Configurar
- Errores de envío de email
- Límites de Resend alcanzados
- Fallos de autenticación

## 🎯 **Estado de Preparación**

### ✅ **Listo para Desarrollo**
- Función desplegada y funcional
- API key incluida para testing
- EmailTester operativo

### 🔄 **Para Producción (Pendiente)**
- [ ] Configurar `RESEND_API_KEY` en variables de entorno de Supabase
- [ ] Verificar logs muestran uso de variable de entorno
- [ ] Probar funcionamiento en producción

### 🚀 **Deploy Final**
Una vez configurada la variable de entorno:
1. ✅ Función usa API key segura
2. ✅ Código no expone credenciales
3. ✅ Listo para usuarios reales

---

## 📞 **Próximos Pasos Inmediatos**

1. **AHORA:** Probar EmailTester con función actual (funciona)
2. **ANTES DE PRODUCCIÓN:** Configurar `RESEND_API_KEY` en Supabase
3. **DEPLOY:** Verificar logs y funcionamiento

**La función está lista - solo falta configurar la variable de entorno para producción segura.** 🔒