<template>
  <div class="home">
    <div class="hero">
      <h2>¿Qué es GraphQL?</h2>
      <p class="lead">
        GraphQL es un lenguaje de consulta para APIs y un runtime para ejecutar esas consultas. 
        A diferencia de REST, permite al cliente pedir <strong>exactamente</strong> los datos que necesita.
      </p>
    </div>

    <div class="features">
      <div class="feature-card">
        <div class="icon">📊</div>
        <h3>Una sola llamada</h3>
        <p>Obtén toda la información relacionada en una única petición</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">🎯</div>
        <h3>Datos exactos</h3>
        <p>Pide solo los campos que necesitas, sin over-fetching</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">🔍</div>
        <h3>Autodocumentado</h3>
        <p>El schema describe exactamente qué puedes consultar</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">⚡</div>
        <h3>Tipado fuerte</h3>
        <p>Los tipos garantizan la estructura de los datos</p>
      </div>
    </div>

    <div class="example-section">
      <h2>Ejemplo rápido</h2>
      <div class="code-comparison">
        <div class="code-block">
          <h4>REST (múltiples llamadas)</h4>
          <pre><code>// 1. Obtener usuario
GET /users/octocat

// 2. Obtener repos
GET /users/octocat/repos

// 3. Obtener followers
GET /users/octocat/followers

<span class="comment">// ⚠️ 3 llamadas HTTP diferentes</span></code></pre>
        </div>
        
        <div class="code-block highlight">
          <h4>GraphQL (una sola llamada)</h4>
          <pre><code>query {
  user(login: "octocat") {
    name
    bio
    repositories(first: 10) {
      nodes { name }
    }
    followers {
      totalCount
    }
  }
}

<span class="comment">// ✅ Una sola llamada HTTP</span></code></pre>
        </div>
      </div>
    </div>

    <div class="cta">
      <h3>Explora las demos interactivas</h3>
      <div class="button-group">
        <router-link to="/comparison" class="btn btn-primary">Ver Comparación</router-link>
        <router-link to="/playground" class="btn btn-secondary">Probar Playground</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  margin-bottom: 3rem;
}

.hero h2 {
  font-size: 3rem !important;
  margin: 0 0 1rem;
}

.lead {
  font-size: 1.3rem;
  line-height: 1.8;
  color: #4a5568;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0,0,0,0.15);
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #667eea;
  margin: 0 0 0.5rem;
}

.example-section {
  margin: 4rem 0;
}

.example-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2d3748;
}

.code-comparison {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.code-block {
  background: #2d3748;
  border-radius: 12px;
  padding: 1.5rem;
  overflow-x: auto;
}

.code-block.highlight {
  border: 3px solid #667eea;
  background: #1a202c;
}

.code-block h4 {
  color: #e2e8f0;
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.code-block pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
}

.code-block code {
  color: #a0aec0;
}

.comment {
  color: #68d391;
  font-style: italic;
}

.cta {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin: 4rem 0;
  color: white;
}

.cta h3 {
  font-size: 2rem;
  margin: 0 0 2rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-3px);
}
</style>
