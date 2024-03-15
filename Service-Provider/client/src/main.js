import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axiosBackendApi from '../plugins/axiosBackendApi.js'

createApp(App).use(router).use(axiosBackendApi).mount('#app')
