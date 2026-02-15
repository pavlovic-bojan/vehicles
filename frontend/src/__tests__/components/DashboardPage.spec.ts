import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
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
    { path: '/', name: 'dashboard', component: DashboardPage },
    { path: '/vehicles', name: 'vehicles', component: { template: '<div/>' } },
    { path: '/drivers', name: 'drivers', component: { template: '<div/>' } },
    { path: '/trips', name: 'trips', component: { template: '<div/>' } },
    { path: '/fuel', name: 'fuel', component: { template: '<div/>' } },
    { path: '/locations', name: 'locations', component: { template: '<div/>' } },
  ],
});

vi.mock('../../api/vehicles.api', () => ({ vehiclesApi: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) } }));
vi.mock('../../api/drivers.api', () => ({ driversApi: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) } }));
vi.mock('../../api/trips.api', () => ({ tripsApi: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) } }));
vi.mock('../../api/fuel.api', () => ({ fuelApi: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) } }));
vi.mock('../../api/locations.api', () => ({ locationsApi: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) } }));

describe('DashboardPage', () => {
  beforeEach(async () => {
    await router.push('/');
    vi.clearAllMocks();
  });

  it('renders dashboard title and subtitle', async () => {
    const wrapper = mount(DashboardPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="dashboard-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="dashboard-subtitle"]').exists()).toBe(true);
  });

  it('shows loading state initially', () => {
    const wrapper = mount(DashboardPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    expect(wrapper.find('[data-test="row-loading"]').exists()).toBe(true);
  });

  it('shows overview with cards after loading', async () => {
    const wrapper = mount(DashboardPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 200));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="dashboard-overview"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="card-vehicles"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="card-drivers"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="card-trips"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="card-fuel"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="card-locations"]').exists()).toBe(true);
  });
});
