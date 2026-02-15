import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import MainLayout from '../../layouts/MainLayout.vue';
import DashboardPage from '../../views/DashboardPage.vue';
import en from '../../locales/en/index.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', name: 'dashboard', component: DashboardPage },
        { path: 'vehicles', name: 'vehicles', component: { template: '<div />' } },
      ],
    },
  ],
});

describe('MainLayout', () => {
  it('renders header with logo and navigation', async () => {
    await router.push('/');
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [createPinia(), i18n, router],
        stubs: { RouterView: true },
      },
    });
    expect(wrapper.find('[data-test="app-logo"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="sidebar"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="main-content"]').exists()).toBe(true);
  });

  it('has menu toggle and user menu buttons', async () => {
    await router.push('/');
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [createPinia(), i18n, router],
        stubs: { RouterView: true },
      },
    });
    expect(wrapper.find('[data-test="button-menu-toggle"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="button-user-menu"]').exists()).toBe(true);
  });

  it('has nav links for dashboard and vehicles', async () => {
    await router.push('/');
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [createPinia(), i18n, router],
        stubs: { RouterView: true },
      },
    });
    expect(wrapper.find('[data-test="nav-dashboard"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="nav-vehicles"]').exists()).toBe(true);
  });
});
