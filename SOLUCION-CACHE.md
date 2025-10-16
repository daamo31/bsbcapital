# 🔄 GUÍA PARA SOLUCIONAR PROBLEMA DE CACHE EN HOSTINGER

## ❌ PROBLEMA IDENTIFICADO
Tu sitio web en Hostinger muestra **contenido antiguo** porque:
1. El `.htaccess` actual tiene cache de **1 año** para CSS/JS
2. El HTML tiene cache de **1 día**
3. Los navegadores y el servidor están sirviendo versiones en cache

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. **DEPLOY CON CACHE BUSTING**
```bash
# Usar este comando en lugar de npm run build
./deploy-cache-bust.sh
```

**¿Qué hace el script?**
- ✅ Agrega timestamp único a todos los archivos CSS/JS
- ✅ Crea manifest.json para rastrear versiones
- ✅ Genera .htaccess optimizado para permitir actualizaciones
- ✅ Crea version.json para debugging

### 2. **ARCHIVOS GENERADOS**
```
dist/
├── index.html (actualizado)
├── .htaccess (configuración de cache optimizada)
├── version.json (para debugging)
├── manifest.json (versionado)
└── assets/
    ├── index-cd21d56b-1760614280356.css (con timestamp)
    └── index-5dad4fd8-1760614280356.js (con timestamp)
```

### 3. **PASOS PARA DEPLOY**

#### **Paso 1: Subir archivos a Hostinger**
1. Accede a tu panel de Hostinger
2. Ve al File Manager
3. **ELIMINA** el contenido actual de public_html/
4. **SUBE** todo el contenido de la carpeta `dist/`
5. **ASEGÚRATE** de que se suba el archivo `.htaccess`

#### **Paso 2: Verificar la actualización**
1. Visita: `https://tudominio.com/version.json`
   - Deberías ver la nueva timestamp
2. Visita: `https://tudominio.com/?v=1760614279`
   - El parámetro `?v=` fuerza la recarga
3. Abre DevTools → Network → Desactiva cache → Recarga

#### **Paso 3: Forzar actualización en todos los navegadores**
- Comparte esta URL: `https://tudominio.com/?v=1760614279`
- O instruye a los usuarios: **Ctrl+F5** (PC) / **Cmd+Shift+R** (Mac)

## 🔧 CONFIGURACIÓN DE CACHE OPTIMIZADA

**Nuevo .htaccess-no-cache:**
```apache
# HTML: Cache de solo 5 minutos (permite actualizaciones rápidas)
ExpiresByType text/html "access plus 5 minutes"

# CSS/JS: Cache largo pero con nombres únicos
ExpiresByType text/css "access plus 1 year"
ExpiresByType application/javascript "access plus 1 year"

# Headers que fuerzan revalidación
Header set Cache-Control "no-cache, no-store, must-revalidate"
```

## 🛠️ COMANDOS DE DEBUGGING

### **Verificar cache del servidor:**
```bash
curl -I https://tudominio.com/ | grep -i cache
```

### **Ver versión actual:**
```bash
curl https://tudominio.com/version.json
```

### **Forzar recarga completa:**
```
https://tudominio.com/?v=1760614279&no-cache=true
```

## 📅 RUTINA DE DEPLOY FUTURO

**Para cada actualización:**
1. `./deploy-cache-bust.sh` (genera build con timestamp único)
2. Subir contenido de `dist/` a Hostinger
3. Verificar `version.json` 
4. Compartir URL con `?v=TIMESTAMP` si es urgente

## 🚨 SOLUCIÓN DE EMERGENCIA

**Si el cache persiste:**
1. Renombra temporalmente `index.html` a `index-nuevo.html`
2. Visita `https://tudominio.com/index-nuevo.html`
3. Si funciona, el problema era cache del index.html

## ✅ RESULTADO ESPERADO
- ✅ Cambios se ven **inmediatamente** en producción
- ✅ Cache optimizado para rendimiento
- ✅ Facilidad para forzar actualizaciones
- ✅ Debugging transparente con version.json

---

**Timestamp de esta solución:** 1760614279
**Próximo deploy:** Usar siempre `./deploy-cache-bust.sh`