<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'

const showTokenWarning = ref(false)

onMounted(() => {
  // Verificar si hay token configurado
  const hasToken = import.meta.env.VITE_GITHUB_TOKEN
  if (!hasToken) {
    showTokenWarning.value = true
  }
})

function dismissWarning() {
  showTokenWarning.value = false
}
</script>

<template>
  <div id="app">
    <!-- Advertencia de token -->
    <div v-if="showTokenWarning" class="token-warning">
      <div class="warning-content">
        <span class="warning-icon">⚠️</span>
        <div class="warning-text">
          <strong>Token de GitHub no configurado</strong>
          <p>Para que la app funcione, necesitas crear un token en 
            <a href="https://github.com/settings/tokens" target="_blank">github.com/settings/tokens</a>
            y agregarlo en un archivo <code>.env</code>
          </p>
        </div>
        <button @click="dismissWarning" class="dismiss-btn">✕</button>
      </div>
    </div>

    <header class="header">
      <div class="container">
        <h1>🚀 GraphQL vs REST</h1>
        <p class="subtitle">Demo interactiva con GitHub API</p>
        <nav class="nav">
          <RouterLink to="/">Inicio</RouterLink>
          <RouterLink to="/comparison">Comparación</RouterLink>
          <RouterLink to="/playground">Playground</RouterLink>
          <RouterLink to="/examples">Ejemplos</RouterLink>
        </nav>
      </div>
    </header>
    
    <main class="main">
      <div class="container">
        <RouterView />
      </div>
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>Demo educativa - ADI 2025/26</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h1 {
  margin: 0;
  font-size: 2.5rem;
}

.subtitle {
  margin: 0.5rem 0 1.5rem;
  opacity: 0.9;
  font-size: 1.1rem;
}

.nav {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;

.token-warning {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.warning-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.warning-icon {
  font-size: 1.5rem;
}

.warning-text {
  flex: 1;
}

.warning-text strong {
  display: block;
  margin-bottom: 0.25rem;
}

.warning-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.95;
}

.warning-text code {
  background: rgba(255,255,255,0.2);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.warning-text a {
  color: white;
  text-decoration: underline;
  font-weight: 600;
}

.dismiss-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dismiss-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}
  transition: all 0.3s;
  font-weight: 500;
}

.nav a:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}

.nav a.router-link-active {
  background: rgba(255,255,255,0.3);
}

.main {
  min-height: calc(100vh - 300px);
  padding: 2rem 0;
}

.footer {
  background: #2d3748;
  color: white;
  padding: 1.5rem 0;
  text-align: center;
  margin-top: 4rem;
}

.footer p {
  margin: 0;
  opacity: 0.8;
}
</style>
