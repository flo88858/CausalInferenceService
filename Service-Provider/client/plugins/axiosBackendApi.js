import axios from 'axios'

export default {
  install(app) {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2NGZjMjFkOTY0MzU2YzFjNDlmN2VlZjAiLCJpYXQiOjE2OTUyMzg1NTAsImV4cCI6MTY5NzgzMDU1MH0.4Q8Dr3tvzLWNo0oIa17ApFxRHYL7CrCxvK6kH9WDjfA'

    const backendApi = axios.create({
      baseURL: 'http://localhost:8001/api', // Using the proxy
      // baseURL: 'http://localhost:4000', // Using dev server
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    app.config.globalProperties.$backendApi = backendApi
  }
}
