import { createRouter, createWebHistory } from 'vue-router';



const routes = [
    {
        path: "/home",
        component: () => import("../Home.vue"), // 导入 Home 组件
    },
  {
    path: '/',
    component: () => import('../Login.vue')
  },
];

//路由创建
const router = createRouter({
    history: createWebHistory(),
    routes,
  })
  //路由导出
  export default router;