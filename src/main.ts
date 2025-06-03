// src/main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import request from './api/request'
import App from './App.vue'
import router from './router'
import * as Icons from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import '@/assets/css/global.css'
import './style.css'

const app = createApp(App)

// 全局注册Element Plus
app.use(ElementPlus, {
  size: 'default',
  zIndex: 2000
})

// 注册图标
Object.entries(Icons).forEach(([key, component]) => {
  app.component(key, component)
})

// 挂载请求实例
app.config.globalProperties.$request = request

// 挂载路由
app.use(router)

// 启动应用
app.mount('#app')