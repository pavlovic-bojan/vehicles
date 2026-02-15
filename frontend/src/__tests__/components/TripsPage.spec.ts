import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import TripsPage from '../../views/TripsPage.vue';
import en from '../../locales/en/index.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/trips', name: 'trips', component: TripsPage }],
});

vi.mock('../../api/trips.api', () => ({
  tripsApi: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) },
}));
vi.mock('../../api/vehicles.api', () => ({
  vehiclesApi: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) },
}));
vi.mock('../../api/drivers.api', () => ({
  driversApi: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) },
}));

describe('TripsPage', () => {
  beforeEach(async () => {
    await router.push('/trips');
    vi.clearAllMocks();
  });

  it('renders title and subtitle', async () => {
    const wrapper = mount(TripsPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="trips-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="trips-subtitle"]').exists()).toBe(true);
  });

  it('has add trip button and table', async () => {
    const wrapper = mount(TripsPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="button-add-trip"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="table-trips"]').exists()).toBe(true);
  });

  it('opens drawer when add trip is clicked', async () => {
    const wrapper = mount(TripsPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    await wrapper.find('[data-test="button-add-trip"]').trigger('click');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 100));
    expect(wrapper.find('[data-test="drawer"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="form-trip"]').exists()).toBe(true);
  });
});
