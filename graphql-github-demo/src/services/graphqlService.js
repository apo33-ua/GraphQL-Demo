import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { gql } from '@apollo/client/core'

// Configurar cliente Apollo para GitHub GraphQL API
const token = import.meta.env.VITE_GITHUB_TOKEN

const httpLink = createHttpLink({
  uri: 'https://api.github.com/graphql',
  headers: token ? {
    // Con token: acceso completo sin límites estrictos
    authorization: `Bearer ${token}`
  } : {
  }
})

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

// Queries de ejemplo

export const SEARCH_REPOSITORIES = gql`
  query SearchRepositories($query: String!, $first: Int!) {
    search(query: $query, type: REPOSITORY, first: $first) {
      repositoryCount
      edges {
        node {
          ... on Repository {
            id
            name
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
    }
  }
`

export const GET_USER_INFO = gql`
  query GetUser($login: String!) {
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
      repositories(first: 10, orderBy: {field: STARGAZERS, direction: DESC}) {
        totalCount
        nodes {
          name
          stargazerCount
          description
          url
        }
      }
    }
  }
`

export const GET_REPOSITORY_DETAILS = gql`
  query GetRepository($owner: String!, $name: String!) {
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
      languages(first: 5) {
        edges {
          size
          node {
            name
            color
          }
        }
      }
      latestRelease {
        name
        tagName
        publishedAt
      }
    }
  }
`

export const GET_TRENDING_REPOS = gql`
  query GetTrending {
    search(query: "stars:>10000 sort:stars", type: REPOSITORY, first: 10) {
      nodes {
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
`

// Función auxiliar para ejecutar queries
export async function executeQuery(query, variables = {}) {
  try {
    const result = await apolloClient.query({
      query,
      variables,
      fetchPolicy: 'network-only'
    })
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error en GraphQL query:', error)
    return { data: null, error: error.message }
  }
}

// Comparación: mismo resultado con REST
export async function fetchWithREST(type, params) {
  const baseUrl = 'https://api.github.com'
  
  try {
    if (type === 'user') {
      // Con REST necesitamos múltiples llamadas
      const userResponse = await fetch(`${baseUrl}/users/${params.login}`)
      const userData = await userResponse.json()
      
      const reposResponse = await fetch(`${baseUrl}/users/${params.login}/repos?sort=stars&per_page=10`)
      const reposData = await reposResponse.json()
      
      return {
        calls: 2,
        data: {
          user: userData,
          repos: reposData
        }
      }
    } else if (type === 'search') {
      const response = await fetch(`${baseUrl}/search/repositories?q=${params.query}&per_page=${params.first}`)
      const data = await response.json()
      return {
        calls: 1,
        data
      }
    }
  } catch (error) {
    console.error('Error en REST call:', error)
    return { calls: 0, data: null, error: error.message }
  }
}

export default apolloClient
