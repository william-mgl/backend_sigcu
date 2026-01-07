import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://evqshehtfgvwnlrgeruo.supabase.co' // REVISA QUE NO TENGA ESPACIOS
const supabaseKey = '123456789mm..mm'

const supabase = createClient(supabaseUrl, supabaseKey)

async function probarConexion() {
  console.log('--- Iniciando prueba de conexión ---');
  
  try {
    // Intentamos obtener la salud del sistema de Supabase
    const { data, error } = await supabase.from('_test_').select('*').limit(1);

    // Si llegamos aquí, hubo respuesta del servidor
    console.log('✅ ¡Conexión establecida con el servidor de Supabase!');
    
  } catch (err) {
    if (err.message.includes('fetch failed')) {
      console.error('❌ Error: No se pudo conectar a internet o la URL de Supabase es inválida.');
    } else {
      console.error('❌ Error inesperado:', err.message);
    }
  }
}

probarConexion();