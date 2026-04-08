import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 引入路由
// 引入 Element Plus 和對應的 CSS
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(router) // 使用路由
// 註冊 Element Plus
app.use(ElementPlus)

app.mount('#app')