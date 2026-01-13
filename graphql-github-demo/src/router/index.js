import { createRouter, createWebHistory } from 'vue-router'
import ComparisonView from '../views/ComparisonView.vue'
import PlaygroundView from '../views/PlaygroundView.vue'
import ExamplesView from '../views/ExamplesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'comparison',
      component: ComparisonView
    },
    {
      path: '/playground',
      name: 'playground',
      component: PlaygroundView
    },
    {
      path: '/examples',
      name: 'examples',
      component: ExamplesView
    }
  ]
})

export default router
