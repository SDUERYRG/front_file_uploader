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
  {
    path: '/register',
    component: () => import('../Register.vue')
  },
    {
        path: '/front',
        component: () => import('../Front.vue'),
        children:[
            { path: 'home', name: 'Home', meta: { name: '系统首页' }, component: () => import('@/Front/Home.vue') },
            { path: 'person', name: 'Person', meta: { name: '个人页面' }, component: () => import('@/Front/Person.vue') },
            { path: 'fileList', name: 'FileList', meta: { name: '文件分类' }, component: () => import('@/Front/FileList.vue') },
            { path: 'search', name: 'Search', meta: { name: '文件搜索' }, component: () => import('@/Front/Search.vue') },
            { path: 'detail', name: 'Detail', meta: { name: '文件详情' }, component: () => import('@/Front/Detail.vue') },
            { path: 'collect', name: 'Collect', meta: { name: '我的收藏' }, component: () => import('@/Front/Collect.vue') },
            { path: 'Looked', name: 'Looked', meta: { name: '浏览历史' }, component: () => import('@/Front/Looked.vue') },
            { path: 'download', name: 'Download', meta: { name: '我的下载' }, component: () => import('@/Front/Download.vue') },
            { path: 'upload', name: 'Upload', meta: { name: '我的上传' }, component: () => import('@/Front/Upload.vue') },
        ]
    }
];

//路由创建
const router = createRouter({
    history: createWebHistory(),
    routes,
  })
  //路由导出
  export default router;