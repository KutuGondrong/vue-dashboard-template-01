import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';
import { installRouterBridge } from '@/core/router/routerBridge';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useThemeStore } from '@/core/stores/themeStore';
import '@/index.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

installRouterBridge(router);

const authStore = useAuthStore();
const themeStore = useThemeStore();

authStore.initAuth();
themeStore.initTheme();

app.mount('#app');

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.unmount();
  });
  import.meta.hot.accept();
}
