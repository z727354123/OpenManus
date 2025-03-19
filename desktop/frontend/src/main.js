import './assets/css/main.css'

import files from '@/assets/js/files'
import utils from '@/assets/js/utils'
import verify from '@/assets/js/verify'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './locales/i18n'
import router from './router'

// import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
/* Dark theme configuration */
import '@/assets/less/dark.css'
import '@/assets/less/light.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
// Configure Vue production flags
window.__VUE_PROD_DEVTOOLS__ = false
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)

// Globally reference router
app.use(router)

app.use(i18n)

// Register Element Plus Message component globally (required for use in utils)
app.use(ElMessage)

// Global configuration of ElementPlus
// ElSelect.props.placeholder.default = '请选择'
// When ElementPlus is imported, a global configuration object can be passed in which contains size and zIndex properties
// size is used to set the default size of form components, and zIndex is used to set the layer level of pop-up components.
// app.use(ElementPlus, { locale, size: 'default', zIndex: 2000 })

// Configure global providers for shared utilities
app.provide('utils', utils)


app.provide('files', files)
app.provide('verify', verify)

/* app.provide('uuid', uuidv4) */

app.mount('#app')
