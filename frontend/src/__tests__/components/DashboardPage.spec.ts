import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import DashboardPage from '../../views/DashboardPage.vue';
import en from '../../locales/en/index.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
});

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders dashboard title and subtitle', () => {
    const wrapper = mount(DashboardPage, {
      global: { plugins: [createPinia(), i18n] },
    });
    expect(wrapper.find('[data-test="dashboard-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="dashboard-subtitle"]').exists()).toBe(true);
  });

  it('shows loading state initially', () => {
    const wrapper = mount(DashboardPage, {
      global: { plugins: [createPinia(), i18n] },
    });
    expect(wrapper.find('[data-test="row-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="loading-text"]').exists()).toBe(true);
  });

  it('shows empty state after loading', async () => {
    const wrapper = mount(DashboardPage, {
      global: { plugins: [createPinia(), i18n] },
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(wrapper.find('[data-test="row-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="row-loading"]').exists()).toBe(false);
  });

  it('has filter buttons and table with columns', () => {
    const wrapper = mount(DashboardPage, {
      global: { plugins: [createPinia(), i18n] },
    });
    expect(wrapper.find('[data-test="button-filter-new"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="button-filter-in-progress"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="table-tickets"]').exists()).toBe(true);
  });
});
