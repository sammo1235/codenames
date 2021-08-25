import { createRouter, createWebHistory } from "vue-router";

import Welcome from '../views/Welcome'
import Game from '../components/Game'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome
  },
  {
    path: '/game/:id',
    name: 'Game',
    component: Game
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router