import { createWebHashHistory, createRouter } from 'vue-router'
import Home from '../pages/Home.vue'
import Results from '../pages/Results.vue'
import Info from '../pages/Info.vue'
import Catalog from '../pages/Catalog.vue'
import Agreements from '../pages/Agreements.vue'
import Upload from '../pages/Upload.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/results',
    name: 'Results',
    component: Results
  },
  {
    path: '/info',
    name: 'Info',
    component: Info
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: Catalog
  },
  {
    path: '/agreements',
    name: 'Agreements',
    component: Agreements
  },
  {
    path: '/upload',
    name: 'Upload',
    component: Upload
  }
]

const router = createRouter({
  //history: createWebHistory(),
  history: createWebHashHistory(),
  routes
})

export default router
