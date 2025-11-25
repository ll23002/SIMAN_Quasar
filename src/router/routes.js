const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '',name:'inicio', component: () => import('pages/DashboardPage.vue') },
    { path: '/cuentas',name:'cuentas', component: () => import('pages/CuentasPage.vue') },
    { path: '/productos',name:'productos', component: () => import('pages/ProductosPage.vue') },
      { path: '/facturas',name: 'facturas', component: () => import('pages/facturasPage.vue') },
      { path: '/asientos',name: 'asientos', component: () => import('pages/asientosPage.vue') },
      { path: '/mayor', name: 'mayor', component: () => import('pages/LibroMayorPage.vue')},
      { path: '/balance', name: 'balance', component: () => import('pages/BalanzaPage.vue')},
      { path: '/ventas', name: 'ventas', component: () => import('pages/VentasPage.vue')},
      { path: '/ventas_diarias', name: 'ventas_diarias', component: () => import('pages/VentasDiariasPage.vue')},
      { path: '/balanceGeneral', name: 'balanceGeneral', component: () => import('pages/BalanceGeneral.vue')},
      { path: '/PerdidasYGanancias', name: 'PerdidasYGanancias', component: () => import('pages/PerdidasYGanancias.vue')},
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
