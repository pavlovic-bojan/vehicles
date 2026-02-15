import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import VehiclesPage from '../../views/VehiclesPage.vue';
import en from '../../locales/en/index.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/vehicles', name: 'vehicles', component: VehiclesPage }],
});

vi.mock('../../api/vehicles.api', () => ({
  vehiclesApi: {
    list: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

describe('VehiclesPage', () => {
  beforeEach(async () => {
    await router.push('/vehicles');
    vi.clearAllMocks();
  });

  it('renders title and subtitle', async () => {
    const wrapper = mount(VehiclesPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="vehicles-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="vehicles-subtitle"]').exists()).toBe(true);
  });

  it('has add vehicle button and table', async () => {
    const wrapper = mount(VehiclesPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="button-add-vehicle"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="table-vehicles"]').exists()).toBe(true);
  });

  it('opens drawer when add vehicle is clicked', async () => {
    const wrapper = mount(VehiclesPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    await wrapper.find('[data-test="button-add-vehicle"]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="drawer"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="form-vehicle"]').exists()).toBe(true);
  });
});
