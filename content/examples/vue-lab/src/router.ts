import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import TasksView from './views/TasksView.vue';

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'tasks', component: TasksView },
  { path: '/about', name: 'about', component: () => import('./views/AboutView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({ history: createWebHistory(), routes });
