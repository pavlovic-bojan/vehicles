<template>
  <div class="main-layout" :class="{ 'main-layout--dark': isDark }">
    <header class="main-layout__header">
      <button type="button" class="main-layout__menu-btn" aria-label="Toggle menu" data-test="button-menu-toggle" @click="sidebarOpen = !sidebarOpen">
        <span class="main-layout__menu-icon"></span>
        <span class="main-layout__menu-icon"></span>
        <span class="main-layout__menu-icon"></span>
      </button>
      <div class="main-layout__logo" data-test="app-logo">
        <span class="main-layout__logo-small">{{ $t('layout.logoSmall') }}</span>
        <span class="main-layout__logo-title">{{ $t('layout.logoTitle') }}</span>
      </div>
      <div class="main-layout__header-right">
        <div class="main-layout__lang-wrap" data-test="dropdown-language">
          <button type="button" class="main-layout__icon-btn main-layout__icon-btn--lang" data-test="button-language" @click="langOpen = !langOpen">
            <span class="main-layout__flag" :aria-label="currentLangLabel">{{ currentLangFlag }}</span>
            <span class="main-layout__arrow">▼</span>
          </button>
          <div v-if="langOpen" class="main-layout__dropdown" data-test="dropdown-language-menu">
            <button v-for="opt in langOptions" :key="opt.locale" type="button" class="main-layout__dropdown-item main-layout__dropdown-item--lang" :data-test="`lang-${opt.locale}`" @click="setLocale(opt.locale); langOpen = false">
              <span class="main-layout__flag-option">{{ opt.flag }}</span>
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>
        <button type="button" class="main-layout__icon-btn" :aria-label="$t('layout.darkMode')" data-test="button-dark-mode" @click="isDark = !isDark">
          {{ isDark ? '☀' : '☽' }}
        </button>
        <button type="button" class="main-layout__icon-btn" :aria-label="$t('layout.notifications')" data-test="button-notifications">
          🔔
        </button>
        <div class="main-layout__user-wrap" data-test="dropdown-user">
          <button type="button" class="main-layout__user-btn" data-test="button-user-menu" @click="userOpen = !userOpen">
            <span class="main-layout__avatar">{{ userInitials }}</span>
            <span class="main-layout__arrow">▼</span>
          </button>
          <div v-if="userOpen" class="main-layout__dropdown main-layout__dropdown--user" data-test="dropdown-user-menu">
            <div class="main-layout__user-info">
              <strong>{{ authStore.user?.name }}</strong>
              <span class="main-layout__user-role">{{ $t('layout.role') }}: {{ authStore.user?.role }}</span>
            </div>
            <router-link :to="{ name: 'dashboard' }" class="main-layout__dropdown-item" data-test="link-profile" @click="userOpen = false">{{ $t('layout.profile') }}</router-link>
            <button type="button" class="main-layout__dropdown-item main-layout__dropdown-item--danger" data-test="button-logout" @click="logout">{{ $t('auth.logout') }}</button>
          </div>
        </div>
      </div>
    </header>
    <div class="main-layout__body">
    <aside class="main-layout__sidebar" :class="{ 'main-layout__sidebar--open': sidebarOpen }" data-test="sidebar">
      <div class="main-layout__sidebar-inner">
        <div class="main-layout__nav-label">{{ $t('layout.navigation') }}</div>
        <nav class="main-layout__nav">
        <router-link v-for="item in navItems" :key="item.name" :to="item.to" class="main-layout__nav-item" :class="{ 'main-layout__nav-item--active': isActive(item.to) }" :data-test="`nav-${item.name}`" @click="sidebarOpen = false">
          <span class="main-layout__nav-icon">{{ item.icon }}</span>
          <span>{{ $t(item.label) }}</span>
        </router-link>
        </nav>
      </div>
    </aside>
    <main class="main-layout__content" data-test="main-content">
      <router-view />
    </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { locale } = useI18n();
const sidebarOpen = ref(true);
const langOpen = ref(false);
const userOpen = ref(false);
const isDark = ref(false);

const langOptions = [
  { locale: 'en', flag: '🇬🇧', label: 'English' },
  { locale: 'sr-lat', flag: '🇷🇸', label: 'Srpski (latinica)' },
  { locale: 'sr-cyr', flag: '🇷🇸', label: 'Српски (ћирилица)' },
];

const currentLangFlag = computed(() => langOptions.find((o) => o.locale === locale.value)?.flag ?? '🇬🇧');
const currentLangLabel = computed(() => langOptions.find((o) => o.locale === locale.value)?.label ?? 'English');

const navItems = [
  { name: 'dashboard', to: '/', label: 'layout.dashboard', icon: '📋' },
  { name: 'vehicles', to: '/vehicles', label: 'layout.vehicles', icon: '🚚' },
  { name: 'drivers', to: '/drivers', label: 'layout.drivers', icon: '👤' },
  { name: 'trips', to: '/trips', label: 'layout.trips', icon: '🛣' },
  { name: 'notifications', to: '/notifications', label: 'layout.notifications', icon: '🔔' },
];

const userInitials = computed(() => {
  const name = authStore.user?.name ?? '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '—';
});

function isActive(to: string) {
  if (to === '/') return route.path === '/';
  return route.path.startsWith(to);
}

function setLocale(l: string) {
  locale.value = l;
}

function logout() {
  userOpen.value = false;
  authStore.clearAuth();
  router.push({ name: 'login' });
}

function closeDropdowns(e: MouseEvent) {
  const t = e.target as HTMLElement;
  if (!t.closest('.main-layout__lang-wrap') && !t.closest('.main-layout__user-wrap')) {
    langOpen.value = false;
    userOpen.value = false;
  }
}

function applyDarkTheme(dark: boolean) {
  const el = document.documentElement;
  const body = document.body;
  if (dark) {
    el.classList.add('dark-theme');
    body.classList.add('dark-theme');
  } else {
    el.classList.remove('dark-theme');
    body.classList.remove('dark-theme');
  }
}

watch(isDark, applyDarkTheme, { immediate: true });

onMounted(() => document.addEventListener('click', closeDropdowns));
onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
  applyDarkTheme(false);
});
</script>

<style scoped>
.main-layout { display: flex; flex-direction: column; min-height: 100vh; background: #f5f5f5; }
.main-layout--dark { background: #1e1e1e; color: #e0e0e0; }
.main-layout__body { display: flex; flex: 1; min-height: 0; }
.main-layout__header { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: #fff; border-bottom: 1px solid #e0e0e0; position: sticky; top: 0; z-index: 100; }
.main-layout--dark .main-layout__header { background: #2d2d2d; border-color: #444; }
.main-layout__menu-btn { display: flex; flex-direction: column; gap: 4px; padding: 8px; border: none; background: transparent; cursor: pointer; }
.main-layout__menu-icon { width: 20px; height: 2px; background: #333; }
.main-layout--dark .main-layout__menu-icon { background: #ccc; }
.main-layout__logo { display: flex; flex-direction: column; }
.main-layout__logo-small { font-size: 0.75rem; color: #666; }
.main-layout__logo-title { font-size: 1.1rem; font-weight: 600; }
.main-layout__header-right { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; }
.main-layout__icon-btn { padding: 0.4rem 0.6rem; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 0.9rem; }
.main-layout--dark .main-layout__icon-btn { background: #3d3d3d; border-color: #555; }
.main-layout__lang-wrap, .main-layout__user-wrap { position: relative; }
.main-layout__flag { font-size: 1.25rem; line-height: 1; margin-right: 4px; }
.main-layout__icon-btn--lang { display: flex; align-items: center; gap: 0.25rem; }
.main-layout__dropdown-item--lang { display: flex; align-items: center; gap: 0.5rem; }
.main-layout__flag-option { font-size: 1.25rem; line-height: 1; }
.main-layout__arrow { font-size: 0.6rem; }
.main-layout__user-btn { display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid #ddd; border-radius: 20px; background: #fff; cursor: pointer; }
.main-layout__avatar { width: 28px; height: 28px; border-radius: 50%; background: #1976d2; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; }
.main-layout__dropdown { position: absolute; top: 100%; right: 0; margin-top: 4px; min-width: 160px; background: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 200; }
.main-layout__dropdown--user { min-width: 200px; }
.main-layout__dropdown-item { display: block; width: 100%; padding: 0.5rem 1rem; border: none; background: none; text-align: left; cursor: pointer; font-size: 0.9rem; color: #333; text-decoration: none; }
.main-layout__dropdown-item:hover { background: #f0f0f0; }
.main-layout__dropdown-item--danger { color: #c62828; }
.main-layout__user-info { padding: 0.75rem 1rem; border-bottom: 1px solid #eee; }
.main-layout__user-role { display: block; font-size: 0.8rem; color: #666; margin-top: 2px; }
.main-layout__sidebar { width: 0; overflow: hidden; background: #fff; border-right: none; flex-shrink: 0; transition: width 0.2s ease; }
.main-layout__sidebar--open { width: 240px; border-right: 1px solid #e0e0e0; }
.main-layout__sidebar-inner { width: 240px; padding: 1rem 0; min-height: 100%; }
.main-layout--dark .main-layout__sidebar { background: #2d2d2d; }
.main-layout--dark .main-layout__sidebar--open { border-color: #444; }
.main-layout__nav-label { font-size: 0.7rem; font-weight: 600; color: #888; text-transform: uppercase; padding: 0 1rem 0.5rem; }
.main-layout__nav { display: flex; flex-direction: column; }
.main-layout__nav-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; color: #333; text-decoration: none; font-size: 0.9rem; border: none; background: none; width: 100%; text-align: left; cursor: pointer; }
.main-layout__nav-item:hover { background: #f5f5f5; }
.main-layout__nav-item--active { background: #e3f2fd; color: #1976d2; }
.main-layout--dark .main-layout__nav-item { color: #e0e0e0; }
.main-layout--dark .main-layout__nav-item:hover { background: #3d3d3d; }
.main-layout--dark .main-layout__nav-item--active { background: #1a3a52; color: #64b5f6; }
.main-layout__nav-icon { font-size: 1rem; }
.main-layout__content { flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow: auto; min-width: 0; }
.main-layout--dark .main-layout__content { background: #1e1e1e; }
.main-layout--dark .main-layout__body { background: #1e1e1e; }
.main-layout--dark .main-layout__logo-small { color: #aaa; }
.main-layout--dark .main-layout__logo-title { color: #e0e0e0; }
.main-layout--dark .main-layout__dropdown { background: #2d2d2d; border-color: #444; }
.main-layout--dark .main-layout__dropdown-item { color: #e0e0e0; }
.main-layout--dark .main-layout__dropdown-item:hover { background: #3d3d3d; }
.main-layout--dark .main-layout__user-info { border-color: #444; }
.main-layout--dark .main-layout__user-role { color: #aaa; }
.main-layout--dark .main-layout__user-btn { background: #3d3d3d; border-color: #555; }
.main-layout--dark .main-layout__nav-label { color: #888; }
/* Dark theme for dashboard (and any content in main area) */
.main-layout--dark .main-layout__content :deep(.dashboard) { background: transparent; }
.main-layout--dark .main-layout__content :deep(.dashboard__title),
.main-layout--dark .main-layout__content :deep(.dashboard__subtitle) { color: #e0e0e0; }
.main-layout--dark .main-layout__content :deep(.dashboard__btn) { background: #2d2d2d; border-color: #555; color: #e0e0e0; }
.main-layout--dark .main-layout__content :deep(.dashboard__btn:hover) { background: #3d3d3d; }
.main-layout--dark .main-layout__content :deep(.dashboard__btn--secondary) { color: #aaa; }
.main-layout--dark .main-layout__content :deep(.dashboard__table-wrap) { background: #2d2d2d; border-color: #444; }
.main-layout--dark .main-layout__content :deep(.dashboard__table th) { background: #3d3d3d; color: #ccc; }
.main-layout--dark .main-layout__content :deep(.dashboard__table td) { border-color: #444; color: #e0e0e0; }
.main-layout--dark .main-layout__content :deep(.dashboard__row-loading td),
.main-layout--dark .main-layout__content :deep(.dashboard__row-empty td) { color: #999; }
</style>
