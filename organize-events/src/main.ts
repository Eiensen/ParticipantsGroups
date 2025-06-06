/* eslint-disable */
import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./firebase/config"  // Initialize Firebase
import "./assets/main.css"

const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error("Global error:", err)
  console.error("Component:", vm)
  console.error("Info:", info)
}

app.use(router)
app.mount("#app")
