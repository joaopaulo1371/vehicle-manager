import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/vehicles' },
      { path: 'vehicles', component: () => import('pages/VehiclesPage.vue') },
      { path: 'vehicles/new', component: () => import('pages/VehicleFormPage.vue') },
      { path: 'vehicles/:id', component: () => import('pages/VehicleDetailsPage.vue') },
      { path: 'vehicles/:id/edit', component: () => import('pages/VehicleFormPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
