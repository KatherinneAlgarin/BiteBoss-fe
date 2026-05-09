/**
 * API Diagnostics Tool
 * Uso: Abre la consola en DevTools y ejecuta estos comandos
 */

export async function diagnoseAPI() {
  console.log('=== 🔍 DIAGNÓSTICO DE API ===\n');

  const API_URL = 'http://localhost:3000';
  
  // 1. Verificar conectividad básica
  console.log('1️⃣  Verificando conectividad a:', API_URL);
  try {
    await fetch(`${API_URL}/api/proveedores`, {
      method: 'OPTIONS',
    }).catch(e => {
      throw new Error(`No se puede alcanzar ${API_URL}. Error: ${e.message}`);
    });
    console.log('   ✅ Servidor respondiendo');
  } catch (err) {
    console.error('   ❌', err instanceof Error ? err.message : err);
    return;
  }

  // 2. Verificar token
  console.log('\n2️⃣  Verificando autenticación');
  try {
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
    if (!token) {
      console.warn('   ⚠️  No hay token disponible (usuario no autenticado)');
    } else {
      console.log('   ✅ Token presente:', token.substring(0, 20) + '...');
    }
  } catch (err) {
    console.error('   ❌ Error al obtener token:', err);
  }

  // 3. Hacer petición de prueba
  console.log('\n3️⃣  Haciendo petición GET a /api/proveedores');
  try {
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`${API_URL}/api/proveedores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'omit',
    });

    console.log('   📊 Respuesta:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Datos recibidos:', data);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('   ❌ Error:', errorData);
    }
  } catch (err) {
    console.error('   ❌ Error en petición:', err instanceof Error ? err.message : err);
  }

  // 4. Información del navegador
  console.log('\n4️⃣  Información del navegador');
  console.log('   Origin:', window.location.origin);
  console.log('   Protocol:', window.location.protocol);
  console.log('   Host:', window.location.host);

  console.log('\n=== FIN DIAGNÓSTICO ===\n');
}

// Para usar en React, crear un comando global
if (import.meta.env.DEV) {
  (window as any).diagnoseAPI = diagnoseAPI;
  console.log('🔧 Diagnóstico disponible: window.diagnoseAPI()');
}