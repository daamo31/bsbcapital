-- Agregar tu video de Hotmart a course_content
-- Ejecutar DESPUÉS de setup_final.sql

-- 🎬 VIDEO del módulo
INSERT INTO course_content (
    content_id,                          -- ID único interno
    title, 
    description,
    content_type,
    hotmart_product_id,                  -- Tu Product ID de Hotmart
    hotmart_video_id,                    -- Tu Video ID de Hotmart
    required_access_level,               -- 'basic', 'premium', 'enterprise'
    is_free,                             -- true = gratuito
    module_id,                           -- Para agrupar contenido
    order_index
) VALUES (
    'modulo_0_bienvenida_video',         -- ✅ ID único del video
    'Módulo 0. Bienvenida y mentalidad inversora | Píldora formativa: La inflación', -- ✅ Título real
    'Módulo de bienvenida e introducción a la mentalidad inversora con píldora formativa sobre inflación', -- ✅ Descripción
    'video',
    '6308462',                           -- ✅ Tu Product ID real
    '115212598',                         -- ✅ Tu Video ID real
    'basic',                             -- 🔄 basic/premium/enterprise
    false,                               -- 🔄 true si es gratuito
    'modulo_0_bienvenida',               -- ✅ ID del módulo
    1                                    -- Orden 1 (primero el video)
);

-- 📄 PDF descargable del mismo módulo (se obtiene via API de Hotmart)
INSERT INTO course_content (
    content_id,                          -- ID único interno
    title, 
    description,
    content_type,
    hotmart_product_id,                  -- Mismo producto
    required_access_level,               -- Mismo nivel que el video
    is_free,                             -- Mismo acceso que el video
    module_id,                           -- Mismo módulo
    order_index
) VALUES (
    'modulo_0_bienvenida_pdf',           -- ✅ ID único del PDF
    'Módulo 0 - Material de apoyo (PDF)', -- Título del PDF
    'Material de apoyo en PDF para descargar del módulo de bienvenida',
    'document',                          -- Tipo: documento
    '6308462',                           -- Mismo producto
    'basic',                             -- Mismo nivel de acceso
    false,                               -- Mismo que el video
    'modulo_0_bienvenida',               -- Mismo módulo
    2                                    -- Orden 2 (después del video)
);

-- Ejemplo para contenido gratuito de introducción:
INSERT INTO course_content (
    content_id, title, description, content_type,
    hotmart_product_id, hotmart_video_id, 
    required_access_level, is_free, order_index
) VALUES (
    'intro_gratuita', 
    'Introducción Gratuita', 
    'Video de demostración gratuito para todos',
    'video',
    '6308462',
    'TU_VIDEO_INTRO_ID',
    'basic',
    true,                                -- ✅ Contenido gratuito
    0                                    -- Orden 0 (antes que todo)
);

-- Ver el contenido agregado
SELECT 
    content_id, 
    title, 
    content_type,
    module_id,
    order_index,
    required_access_level, 
    is_free 
FROM course_content 
WHERE module_id IN ('modulo_0_bienvenida') 
ORDER BY order_index;