// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import YouTubePage from '@/views/YouTubePage.vue';
import TikTokPage from '@/views/TikTokPage.vue';
import InstagramPage from '@/views/InstagramPage.vue';
import FacebookPage from '@/views/FacebookPage.vue';

const routes = [
  { path: '/', redirect: '/youtube' },
  { path: '/youtube', name: 'YouTube', component: YouTubePage },
  { path: '/tiktok', name: 'TikTok', component: TikTokPage },
  { path: '/instagram', name: 'Instagram', component: InstagramPage },
  { path: '/facebook', name: 'Facebook', component: FacebookPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
