import { createRouter, createWebHistory } from "vue-router";

import Welcome from '../views/Welcome'
import Game from '../components/Game'
import CodeSweepersGame from '../components/CodeSweepersGame'

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
  },
  {
    path: '/csgame/:id',
    name: 'CodeSweepersGame',
    component: CodeSweepersGame
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router