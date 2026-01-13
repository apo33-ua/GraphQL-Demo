<template>
  <div class="comparison">
    <h2>REST vs GraphQL: Comparación lado a lado</h2>
    <p class="intro">Veamos las diferencias clave entre ambos enfoques</p>

    <div class="comparison-grid">
      <!-- REST -->
      <div class="approach-section">
        <h3 class="rest-title">REST</h3>
        
        <div class="info-card">
          <h4>Estructura</h4>
          <ul>
            <li>Múltiples endpoints</li>
            <li>Cada endpoint devuelve una estructura fija</li>
            <li>Verbos HTTP (GET, POST, PUT, DELETE)</li>
          </ul>
        </div>

        <div class="info-card">
          <h4>Ejemplo: Obtener usuario,repos y followers</h4>
          <div class="code">
            <pre>GET /api/users/octocat
GET /api/users/octocat/repos
GET /api/users/octocat/followers</pre>
          </div>
          <p class="note">3 llamadas HTTP separadas</p>
        </div>

        <div class="info-card">
          <h4>Problemas comunes</h4>
          <ul>
            <li><strong>Over-fetching:</strong> Recibes datos que no necesitas</li>
            <li><strong>Under-fetching:</strong> Necesitas hacer múltiples llamadas</li>
            <li><strong>Versionado:</strong> Necesitas /api/v1, /api/v2...</li>
          </ul>
        </div>
      </div>

      <!-- GraphQL -->
      <div class="approach-section highlight">
        <h3 class="graphql-title">GraphQL</h3>
        
        <div class="info-card">
          <h4>Estructura</h4>
          <ul>
            <li>Un solo endpoint (normalmente /graphql)</li>
            <li>El cliente define la estructura de respuesta</li>
            <li>Solo POST (o GET para queries simples)</li>
          </ul>
        </div>

        <div class="info-card">
          <h4>Ejemplo: Obtener usuario y repos</h4>
          <div class="code">
            <pre>POST /graphql
{
  user(login: "octocat") {
    name
    bio
    repositories(first: 10) {
      nodes { name, stars }
    }
    followers { totalCount }
  }
}</pre>
          </div>
          <p class="note success">Una sola llamada HTTP</p>
        </div>

        <div class="info-card">
          <h4>Ventajas</h4>
          <ul>
            <li><strong>Datos exactos:</strong> Solo recibes lo que pides</li>
            <li><strong>Una llamada:</strong> Datos relacionados en una petición</li>
            <li><strong>Sin versionado:</strong> Evoluciona sin romper clientes</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="practical-demo">
      <h3>Demo Práctica</h3>
      <p>Busca repositorios y compara las respuestas</p>
      
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Ej: vue, react, nodejs..."
          @keyup.enter="performSearch"
        >
        <button @click="performSearch" :disabled="loading">
          {{ loading ? 'Buscando...' : 'Buscar' }}
        </button>
      </div>

      <div v-if="results" class="results">
        <div class="result-card">
          <h4>REST Response</h4>
          <div class="stats">
            <span>Tiempo: {{ restTime }}ms</span>
            <span>Llamadas: {{ restCalls }}</span>
            <span>Tamaño: ~{{ restSize }}KB</span>
          </div>
          <div class="json-preview">
            <pre>{{ restDataPreview }}</pre>
          </div>
        </div>

        <div class="result-card highlight">
          <h4>GraphQL Response</h4>
          <div class="stats">
            <span>Tiempo: {{ graphqlTime }}ms</span>
            <span>Llamadas: 1</span>
            <span>Tamaño: ~{{ graphqlSize }}KB</span>
          </div>
          <div class="json-preview">
            <pre>{{ graphqlDataPreview }}</pre>
          </div>
        </div>
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { executeQuery, SEARCH_REPOSITORIES, fetchWithREST } from '@/services/graphqlService'

const searchQuery = ref('vue')
const loading = ref(false)
const results = ref(null)
const error = ref(null)

// Métricas
const restTime = ref(0)
const restCalls = ref(0)
const restSize = ref(0)
const graphqlTime = ref(0)
const graphqlSize = ref(0)

const restDataPreview = ref('')
const graphqlDataPreview = ref('')

async function performSearch() {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  error.value = null
  results.value = null

  try {
    // REST
    const restStart = performance.now()
    const restResult = await fetchWithREST('search', { 
      query: searchQuery.value, 
      first: 5 
    })
    const restEnd = performance.now()
    
    restTime.value = Math.round(restEnd - restStart)
    restCalls.value = restResult.calls || 1
    restSize.value = Math.round(JSON.stringify(restResult.data).length / 1024)
    restDataPreview.value = JSON.stringify(restResult.data, null, 2).substring(0, 500) + '...'

    // GraphQL
    const graphqlStart = performance.now()
    const graphqlResult = await executeQuery(SEARCH_REPOSITORIES, {
      query: searchQuery.value,
      first: 5
    })
    const graphqlEnd = performance.now()
    
    graphqlTime.value = Math.round(graphqlEnd - graphqlStart)
    graphqlSize.value = Math.round(JSON.stringify(graphqlResult.data).length / 1024)
    graphqlDataPreview.value = JSON.stringify(graphqlResult.data, null, 2).substring(0, 500) + '...'

    results.value = true

  } catch (err) {
    error.value = 'Error al realizar la búsqueda. Verifica tu conexión.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.comparison {
  max-width: 1400px;
  margin: 0 auto;
}

.intro {
  margin-bottom: 3rem;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.approach-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.approach-section.highlight {
  border: 3px solid #667eea;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
}

.rest-title {
  color: #e53e3e;
  font-size: 1.8rem;
  margin: 0 0 1.5rem;
}

.graphql-title {
  color: #e570e7;
  font-size: 1.8rem;
  margin: 0 0 1.5rem;
}



.practical-demo {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.practical-demo h3 {
  font-size: 2rem;
  margin: 0 0 1rem;
  color: #2d3748;
}

.search-box {
  margin: 2rem 0;
}

.results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.result-card {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.result-card.highlight {
  border-color: #667eea;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
}

.result-card h4 {
  margin: 0 0 1rem;
  color: #2d3748;
  font-size: 1.3rem;
}

.stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.stats span {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}

.json-preview {
  background: #2d3748;
  padding: 1rem;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.json-preview pre {
  margin: 0;
  color: #a0aec0;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
}

</style>
