
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/lista', component: () => import('pages/Lista.vue') },
      { path: '/historico', component: () => import('pages/Historico.vue') },
      { path: '/comprar', component: () => import('pages/Comprar.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
