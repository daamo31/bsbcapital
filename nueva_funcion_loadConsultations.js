// ESTE ES EL CÓDIGO LIMPIO PARA REEMPLAZAR EN ConsultationManagement.jsx
// Reemplaza la función loadConsultations existente con esta versión limpia

const loadConsultations = async () => {
  try {
    console.log('🔍 Cargando consultas en admin dashboard...');
    console.log('👤 Usuario actual:', await supabase.auth.getUser());
    
    // ✅ USAR FUNCIÓN RPC CON PERMISOS ELEVADOS DIRECTAMENTE
    console.log('🚀 Usando función RPC get_all_consultations_admin...');
    
    const { data, error } = await supabase
      .rpc('get_all_consultations_admin');

    console.log('📊 Resultado RPC get_all_consultations_admin:', { 
      data, 
      error, 
      count: data?.length,
      firstRow: data?.[0]
    });
    
    if (error) {
      console.error('❌ Error en función RPC:', error);
      
      // Fallback: intentar query normal si la función no existe
      if (error.code === 'PGRST202' || error.message.includes('function') || error.message.includes('does not exist')) {
        console.log('🔄 Función RPC no encontrada, usando query normal como fallback...');
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('consultations')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (fallbackError) {
          console.error('❌ Error también en fallback:', fallbackError);
          
          if (fallbackError.code === 'PGRST116') {
            toast({
              variant: "destructive",
              title: "Error de permisos RLS",
              description: "Ejecuta el script create_admin_consultations_function.sql",
            });
          }
          
          throw fallbackError;
        }
        
        console.log('✅ Fallback exitoso:', fallbackData?.length || 0);
        setConsultations(fallbackData || []);
        return;
      }
      
      throw error;
    }
    
    console.log('✅ Consultas cargadas via RPC:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('📋 Muestra de datos cargados:', data.slice(0, 2));
      
      toast({
        title: "Consultorías cargadas",
        description: `Se cargaron ${data.length} consultorias usando función RPC`,
      });
    } else {
      toast({
        variant: "destructive", 
        title: "No hay consultorias",
        description: "No se encontraron consultorias en la base de datos",
      });
    }
    
    setConsultations(data || []);
  } catch (error) {
    console.error('Error loading consultations:', error);
    
    toast({
      variant: "destructive",
      title: "Error al cargar consultorías",
      description: error.message,
    });
  } finally {
    setLoading(false);
  }
};