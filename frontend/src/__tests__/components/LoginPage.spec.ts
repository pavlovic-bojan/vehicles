import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import LoginPage from '../../views/LoginPage.vue';
import en from '../../locales/en/index.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/register', name: 'register', component: { template: '<div />' } },
    { path: '/forgot-password', name: 'forgot-password', component: { template: '<div />' } },
  ],
});

describe('LoginPage', () => {
  it('renders login title and form', async () => {
    await router.push('/login');
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [createPinia(), i18n, router],
      },
    });
    expect(wrapper.find('[data-test="login-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="form-login"]').exists()).toBe(true);
  });

  it('has Google and Facebook login buttons with data-test', async () => {
    await router.push('/login');
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [createPinia(), i18n, router],
      },
    });
    expect(wrapper.find('[data-test="button-login-google"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="button-login-facebook"]').exists()).toBe(true);
  });

  it('has sign in button and link to register', async () => {
    await router.push('/login');
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [createPinia(), i18n, router],
      },
    });
    expect(wrapper.find('[data-test="button-sign-in"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="link-register"]').exists()).toBe(true);
  });
});
