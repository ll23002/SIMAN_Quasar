const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') },
    { path: '/cuentas', component: () => import('pages/CuentasPage.vue') },
    { path: '/productos', component: () => import('pages/ProductosPage.vue') },
      { path: '/facturas', component: () => import('pages/facturasPage.vue') },
      { path: '/asientos', component: () => import('pages/asientosPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
