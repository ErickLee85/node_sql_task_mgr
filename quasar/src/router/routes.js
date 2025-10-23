const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue')
  },
  {
    path: '/',
    component: () => import('layouts/AuthenticatedLayout.vue'),
    children: [
      {
        path: 'tasks',
        component: () => import('pages/TasksPage.vue'),
        meta: { requiresAuth: true }
      },
      // {
      //   path: 'tasks/:id',
      //   component: () => import('pages/TaskDetailPage.vue'),
      //   meta: { requiresAuth: true }
      // }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
