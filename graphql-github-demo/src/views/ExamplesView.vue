<template>
  <div class="examples">
    <h2>💡 Ejemplos Prácticos</h2>
    <p class="intro">Casos de uso reales con GitHub GraphQL API</p>

    <div class="example-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </div>

    <!-- Tab: Usuario -->
    <div v-if="activeTab === 'user'" class="tab-content">
      <h3>Buscar información de usuario</h3>
      <div class="search-box">
        <input 
          v-model="username" 
          type="text" 
          placeholder="Ej: torvalds, gaearon, tj..."
          @keyup.enter="fetchUser"
        >
        <button @click="fetchUser" :disabled="loading">
          {{ loading ? '⏳' : '🔍' }} Buscar
        </button>
      </div>

      <div v-if="userData" class="result">
        <div class="user-profile">
          <img :src="userData.avatarUrl" :alt="userData.name" class="avatar">
          <div class="user-info">
            <h4>{{ userData.name || userData.login }}</h4>
            <p class="login">@{{ userData.login }}</p>
            <p class="bio">{{ userData.bio }}</p>
            <div class="stats">
              <span>👥 {{ userData.followers.totalCount }} followers</span>
              <span>📚 {{ userData.repositories.totalCount }} repos</span>
            </div>
            <a :href="userData.url" target="_blank" class="github-link">
              Ver en GitHub →
            </a>
          </div>
        </div>

        <div class="top-repos">
          <h5>Top Repositorios</h5>
          <div v-for="repo in userData.repositories.nodes" :key="repo.name" class="repo-card">
            <div class="repo-header">
              <h6>{{ repo.name }}</h6>
              <span class="stars">⭐ {{ repo.stargazerCount }}</span>
            </div>
            <p>{{ repo.description || 'Sin descripción' }}</p>
            <a :href="repo.url" target="_blank">Ver repositorio →</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Repositorio -->
    <div v-if="activeTab === 'repo'" class="tab-content">
      <h3>Detalles de repositorio</h3>
      <div class="search-box">
        <input 
          v-model="repoOwner" 
          type="text" 
          placeholder="Owner (ej: vuejs)"
          style="flex: 1"
        >
        <span style="padding: 0 0.5rem; color: #a0aec0;">/</span>
        <input 
          v-model="repoName" 
          type="text" 
          placeholder="Repo (ej: vue)"
          style="flex: 1"
        >
        <button @click="fetchRepo" :disabled="loading">
          {{ loading ? '⏳' : '🔍' }} Buscar
        </button>
      </div>

      <div v-if="repoData" class="result">
        <div class="repo-details">
          <h4>{{ repoData.name }}</h4>
          <p class="description">{{ repoData.description }}</p>
          
          <div class="metrics">
            <div class="metric">
              <span class="metric-value">⭐ {{ repoData.stargazerCount }}</span>
              <span class="metric-label">Stars</span>
            </div>
            <div class="metric">
              <span class="metric-value">🍴 {{ repoData.forkCount }}</span>
              <span class="metric-label">Forks</span>
            </div>
            <div class="metric">
              <span class="metric-value">👀 {{ repoData.watchers.totalCount }}</span>
              <span class="metric-label">Watchers</span>
            </div>
            <div class="metric">
              <span class="metric-value">🐛 {{ repoData.issues.totalCount }}</span>
              <span class="metric-label">Issues</span>
            </div>
            <div class="metric">
              <span class="metric-value">🔀 {{ repoData.pullRequests.totalCount }}</span>
              <span class="metric-label">PRs</span>
            </div>
          </div>

          <div v-if="repoData.primaryLanguage" class="language">
            <span 
              class="language-dot" 
              :style="{ backgroundColor: repoData.primaryLanguage.color }"
            ></span>
            {{ repoData.primaryLanguage.name }}
          </div>

          <a :href="repoData.url" target="_blank" class="github-link">
            Ver en GitHub →
          </a>
        </div>
      </div>
    </div>

    <!-- Tab: Búsqueda -->
    <div v-if="activeTab === 'search'" class="tab-content">
      <h3>Buscar repositorios</h3>
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder='Ej: "stars:>10000 language:javascript"'
          @keyup.enter="searchRepos"
        >
        <button @click="searchRepos" :disabled="loading">
          {{ loading ? '⏳' : '🔍' }} Buscar
        </button>
      </div>

      <div v-if="searchResults" class="result">
        <p class="count">{{ searchResults.repositoryCount }} repositorios encontrados</p>
        <div class="repos-grid">
          <div 
            v-for="edge in searchResults.edges" 
            :key="edge.node.nameWithOwner"
            class="repo-card"
          >
            <div class="repo-header">
              <h6>{{ edge.node.nameWithOwner }}</h6>
              <span class="stars">⭐ {{ edge.node.stargazerCount }}</span>
            </div>
            <p>{{ edge.node.description || 'Sin descripción' }}</p>
            <div class="repo-footer">
              <span 
                v-if="edge.node.primaryLanguage" 
                class="language-tag"
                :style="{ color: edge.node.primaryLanguage.color }"
              >
                {{ edge.node.primaryLanguage.name }}
              </span>
              <a :href="edge.node.url" target="_blank">Ver →</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Trending -->
    <div v-if="activeTab === 'trending'" class="tab-content">
      <h3>Repositorios más populares</h3>
      <button @click="fetchTrending" :disabled="loading" class="btn-load">
        {{ loading ? '⏳ Cargando...' : '🔥 Cargar Top Repos' }}
      </button>

      <div v-if="trendingData" class="result">
        <div class="repos-grid">
          <div 
            v-for="repo in trendingData.nodes" 
            :key="repo.nameWithOwner"
            class="repo-card featured"
          >
            <div class="repo-header">
              <img :src="repo.owner.avatarUrl" :alt="repo.owner.login" class="owner-avatar">
              <div>
                <h6>{{ repo.nameWithOwner }}</h6>
                <span class="stars">⭐ {{ repo.stargazerCount.toLocaleString() }}</span>
              </div>
            </div>
            <p>{{ repo.description || 'Sin descripción' }}</p>
            <div class="repo-footer">
              <span 
                v-if="repo.primaryLanguage" 
                class="language-tag"
                :style="{ color: repo.primaryLanguage.color }"
              >
                {{ repo.primaryLanguage.name }}
              </span>
              <span>🍴 {{ repo.forkCount.toLocaleString() }}</span>
              <a :href="repo.url" target="_blank">Ver →</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  executeQuery, 
  GET_USER_INFO, 
  GET_REPOSITORY_DETAILS,
  SEARCH_REPOSITORIES,
  GET_TRENDING_REPOS 
} from '@/services/graphqlService'

const activeTab = ref('user')
const loading = ref(false)
const error = ref(null)

// User tab
const username = ref('torvalds')
const userData = ref(null)

// Repo tab
const repoOwner = ref('vuejs')
const repoName = ref('vue')
const repoData = ref(null)

// Search tab
const searchQuery = ref('stars:>10000 language:typescript')
const searchResults = ref(null)

// Trending tab
const trendingData = ref(null)

const tabs = [
  { id: 'user', name: 'Usuario', icon: '👤' },
  { id: 'repo', name: 'Repositorio', icon: '📦' },
  { id: 'search', name: 'Búsqueda', icon: '🔍' },
  { id: 'trending', name: 'Trending', icon: '🔥' }
]

async function fetchUser() {
  if (!username.value.trim()) return
  loading.value = true
  error.value = null
  userData.value = null

  try {
    const { data, error: err } = await executeQuery(GET_USER_INFO, { 
      login: username.value 
    })
    
    if (err) {
      error.value = err
    } else {
      userData.value = data.user
    }
  } catch (err) {
    error.value = 'Error al buscar usuario'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function fetchRepo() {
  if (!repoOwner.value.trim() || !repoName.value.trim()) return
  loading.value = true
  error.value = null
  repoData.value = null

  try {
    const { data, error: err } = await executeQuery(GET_REPOSITORY_DETAILS, { 
      owner: repoOwner.value,
      name: repoName.value
    })
    
    if (err) {
      error.value = err
    } else {
      repoData.value = data.repository
    }
  } catch (err) {
    error.value = 'Error al buscar repositorio'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function searchRepos() {
  if (!searchQuery.value.trim()) return
  loading.value = true
  error.value = null
  searchResults.value = null

  try {
    const { data, error: err } = await executeQuery(SEARCH_REPOSITORIES, { 
      query: searchQuery.value,
      first: 12
    })
    
    if (err) {
      error.value = err
    } else {
      searchResults.value = data.search
    }
  } catch (err) {
    error.value = 'Error en la búsqueda'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function fetchTrending() {
  loading.value = true
  error.value = null
  trendingData.value = null

  try {
    const { data, error: err } = await executeQuery(GET_TRENDING_REPOS)
    
    if (err) {
      error.value = err
    } else {
      trendingData.value = data.search
    }
  } catch (err) {
    error.value = 'Error al cargar trending'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.examples {
  max-width: 1400px;
  margin: 0 auto;
}

.example-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tab {
  padding: 1rem 2rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  color: #4a5568;
}

.tab:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.tab-content {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.tab-content h3 {
  font-size: 1.8rem;
  margin: 0 0 1.5rem;
  color: #2d3748;
}



.user-profile {
  display: flex;
  gap: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.user-info {
  flex: 1;
}

.user-info h4 {
  font-size: 2rem;
  margin: 0 0 0.5rem;
  color: #2d3748;
}

.login {
  color: #718096;
  font-size: 1.2rem;
  margin: 0 0 1rem;
}

.bio {
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 1rem;
}

.stats {
  display: flex;
  gap: 2rem;
  margin: 1rem 0;
  font-weight: 600;
}

.top-repos h5 {
  font-size: 1.5rem;
  margin: 0 0 1rem;
  color: #2d3748;
}



.repo-details {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  border-radius: 12px;
}

.repo-details h4 {
  font-size: 2rem;
  margin: 0 0 1rem;
  color: #2d3748;
}

.description {
  font-size: 1.1rem;
  color: #4a5568;
  margin: 0 0 2rem;
  line-height: 1.6;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.metric {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.metric-label {
  color: #718096;
  font-size: 0.9rem;
}

.count {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.owner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
}
</style>
