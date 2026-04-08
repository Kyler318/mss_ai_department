import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const routes = [
  { path: '/login', component: () => import('../components/AuthPage.vue') },
  { path: '/', redirect: '/rental' },
  { path: '/rental', component: () => import('../components/RentalForm.vue') },
  { path: '/management', component: () => import('../components/RecordManagement.vue'), meta: { requiresAuth: true } },
  { path: '/it-form', component: () => import('../components/ITSupportForm.vue'), meta: { requiresAuth: true } },
  { path: '/it-management', component: () => import('../components/ITSupportManagement.vue'), meta: { requiresAuth: true } },
  { path: '/inventory', component: () => import('../components/InventoryManagement.vue'), meta: { requiresAuth: true } },
  { path: '/dashboard', component: () => import('../components/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/tasks', component: () => import('../components/NonTeachingTasks.vue'), meta: { requiresAuth: true } },
  { path: '/leave-app', component: () => import('../components/LeaveApplication.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 確保 Firebase 初始化完成再判斷權限
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// 路由守衛 (Route Guard)
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const currentUser = await getCurrentUser();

  if (requiresAuth && !currentUser) {
    next('/login'); // 需要權限但未登入，強制跳轉到登入頁
  } else if (to.path === '/login' && currentUser) {
    next('/'); // 已登入但試圖去登入頁，直接導向首頁
  } else {
    next(); // 正常放行
  }
});

export default router;