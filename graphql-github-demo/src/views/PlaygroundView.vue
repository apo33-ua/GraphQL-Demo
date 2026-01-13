<template>
  <div class="playground">
    <h2>GraphQL Playground</h2>
    <p class="intro">Escribe tus propias queries y consulta los resultados en tiempo real</p>

    <div class="playground-container">
      <!-- Editor de Query -->
      <div class="query-editor">
        <div class="editor-header">
          <h3>Query Editor</h3>
          <div class="actions">
            <button @click="executeCurrentQuery" :disabled="loading" class="btn-run">
              {{ loading ? 'Ejecutando...' : 'Ejecutar' }}
            </button>
            <select v-model="selectedExample" @change="loadExample" class="example-select">
              <option value="">Ejemplos predefinidos...</option>
              <option value="user">Información de usuario</option>
              <option value="repo">Detalles de repositorio</option>
              <option value="search">Buscar repos</option>
              <option value="trending">Repos populares</option>
            </select>
          </div>
        </div>
        
        <textarea 
          v-model="queryText" 
          placeholder="Escribe tu query GraphQL aquí..."
          class="query-textarea"
          spellcheck="false"
        ></textarea>

        <div class="variables-section">
          <h4>Variables (JSON)</h4>
          <textarea 
            v-model="variablesText" 
            placeholder='{"login": "octocat"}'
            class="variables-textarea"
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <!-- Resultados -->
      <div class="results-panel">
        <div class="panel-header">
          <h3>Resultados</h3>
          <button v-if="result" @click="copyResult" class="btn-copy">
            {{ copied ? 'Copiado' : 'Copiar' }}
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Ejecutando query...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <h4>Error</h4>
          <pre>{{ error }}</pre>
        </div>

        <div v-else-if="result" class="result-display">
          <div class="result-meta">
            <span>{{ executionTime }}ms</span>
            <span>{{ resultSize }}KB</span>
          </div>
          <pre class="json-output">{{ formattedResult }}</pre>
        </div>

        <div v-else class="empty-state">
          <p>Escribe una query y haz clic en "Ejecutar"</p>
          <p class="hint">O selecciona un ejemplo del menú desplegable</p>
        </div>
      </div>
    </div>

    <!-- Documentación rápida -->
    <div class="quick-docs">
      <h3>Referencia Rápida</h3>
      <div class="docs-grid">
        <div class="doc-card">
          <h4>Sintaxis básica</h4>
          <pre>query {
  campo
  objeto {
    campo1
    campo2
  }
}</pre>
        </div>

        <div class="doc-card">
          <h4>Con variables</h4>
          <pre>query GetUser($login: String!) {
  user(login: $login) {
    name
    bio
  }
}</pre>
        </div>

        <div class="doc-card">
          <h4>Fragmentos</h4>
          <pre>fragment RepoInfo on Repository {
  name
  description
  stargazerCount
}</pre>
        </div>

        <div class="doc-card">
          <h4>Aliases</h4>
          <pre>query {
  vue: repository(
    owner: "vuejs"
    name: "vue"
  ) {
    name
  }
}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { executeQuery } from '@/services/graphqlService'
import { gql } from '@apollo/client/core'

const queryText = ref('')
const variablesText = ref('{}')
const selectedExample = ref('')
const loading = ref(false)
const result = ref(null)
const error = ref(null)
const executionTime = ref(0)
const resultSize = ref(0)
const copied = ref(false)

const examples = {
  user: {
    query: `query GetUser($login: String!) {
  user(login: $login) {
    login
    name
    bio
    avatarUrl
    url
    followers {
      totalCount
    }
    following {
      totalCount
    }
    repositories(first: 5, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes {
        name
        description
        stargazerCount
        url
      }
    }
  }
}`,
    variables: { login: 'torvalds' }
  },
  repo: {
    query: `query GetRepository($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    name
    description
    url
    stargazerCount
    forkCount
    watchers {
      totalCount
    }
    issues(states: OPEN) {
      totalCount
    }
    pullRequests(states: OPEN) {
      totalCount
    }
    primaryLanguage {
      name
      color
    }
  }
}`,
    variables: { owner: 'vuejs', name: 'vue' }
  },
  search: {
    query: `query SearchRepos($query: String!, $first: Int!) {
  search(query: $query, type: REPOSITORY, first: $first) {
    repositoryCount
    edges {
      node {
        ... on Repository {
          nameWithOwner
          description
          stargazerCount
          url
          primaryLanguage {
            name
            color
          }
        }
      }
    }
  }
}`,
    variables: { query: 'stars:>10000 language:javascript', first: 10 }
  },
  trending: {
    query: `query {
  search(query: "stars:>50000", type: REPOSITORY, first: 10) {
    nodes {
      ... on Repository {
        nameWithOwner
        description
        stargazerCount
        forkCount
        url
        primaryLanguage {
          name
          color
        }
        owner {
          login
          avatarUrl
        }
      }
    }
  }
}`,
    variables: {}
  }
}

const formattedResult = ref('')

function loadExample() {
  const example = examples[selectedExample.value]
  if (example) {
    queryText.value = example.query
    variablesText.value = JSON.stringify(example.variables, null, 2)
  }
}

async function executeCurrentQuery() {
  if (!queryText.value.trim()) {
    error.value = 'Por favor escribe una query'
    return
  }

  loading.value = true
  error.value = null
  result.value = null

  try {
    const variables = JSON.parse(variablesText.value || '{}')
    const query = gql(queryText.value)
    
    const start = performance.now()
    const response = await executeQuery(query, variables)
    const end = performance.now()
    
    executionTime.value = Math.round(end - start)
    
    if (response.error) {
      error.value = response.error
    } else {
      result.value = response.data
      const resultString = JSON.stringify(response.data, null, 2)
      formattedResult.value = resultString
      resultSize.value = (resultString.length / 1024).toFixed(2)
    }
  } catch (err) {
    error.value = err.message || 'Error al ejecutar la query'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function copyResult() {
  navigator.clipboard.writeText(formattedResult.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<style scoped>
.playground {
  max-width: 1600px;
  margin: 0 auto;
}

.playground-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.query-editor, .results-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
}

.editor-header, .panel-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-header h3, .panel-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-run {
  padding: 0.7rem 1.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-run:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn-run:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.example-select {
  padding: 0.7rem;
  border: 2px solid white;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.example-select option {
  color: #2d3748;
}

.query-textarea {
  width: 100%;
  min-height: 300px;
  padding: 1.5rem;
  border: none;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
  background: #f7fafc;
}

.variables-section {
  padding: 1.5rem;
  background: #edf2f7;
  border-top: 2px solid #e2e8f0;
}

.variables-section h4 {
  margin: 0 0 0.5rem;
  color: #2d3748;
  font-size: 1rem;
}

.variables-textarea {
  width: 100%;
  min-height: 80px;
  padding: 1rem;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  background: white;
}



.result-display {
  padding: 1.5rem;
}

.result-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-meta span {
  background: #edf2f7;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.json-output {
  background: #2d3748;
  color: #a0aec0;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  max-height: 500px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.btn-copy {
  padding: 0.5rem 1rem;
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-copy:hover {
  background: rgba(255,255,255,0.3);
}

.quick-docs {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.quick-docs h3 {
  font-size: 2rem;
  margin: 0 0 2rem;
  color: #2d3748;
}

.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.doc-card {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.doc-card h4 {
  margin: 0 0 1rem;
  color: #667eea;
  font-size: 1.1rem;
}

.doc-card pre {
  background: #2d3748;
  color: #a0aec0;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .playground-container {
    grid-template-columns: 1fr;
  }
}
</style>
