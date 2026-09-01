import { createRouter, createWebHashHistory } from 'vue-router';
import { adminAuth } from './stores/auth';
import LoginView from './views/LoginView.vue';
import AdminLayout from './views/AdminLayout.vue';
import OverviewView from './views/OverviewView.vue';
import OrdersView from './views/OrdersView.vue';
import OrderDetailView from './views/OrderDetailView.vue';
import WarehouseView from './views/WarehouseView.vue';
import FinanceView from './views/FinanceView.vue';
import TicketsView from './views/TicketsView.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: LoginView, meta: { public: true } },
    {
      path: '/', component: AdminLayout, children: [
        { path: '', redirect: '/overview' },
        { path: 'overview', component: OverviewView },
        { path: 'orders', component: OrdersView },
        { path: 'orders/:id', component: OrderDetailView },
        { path: 'warehouse', component: WarehouseView },
        { path: 'finance', component: FinanceView },
        { path: 'tickets', component: TicketsView },
      ],
    },
  ],
});

router.beforeEach((to) => {
  if (!to.meta.public && !adminAuth.authenticated) return { path: '/login', query: { redirect: to.fullPath } };
  if (to.path === '/login' && adminAuth.authenticated) return '/overview';
  return true;
});
