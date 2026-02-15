import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import DriversPage from '../../views/DriversPage.vue';
import en from '../../locales/en/index.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/drivers', name: 'drivers', component: DriversPage }],
});

vi.mock('../../api/drivers.api', () => ({
  driversApi: {
    list: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

describe('DriversPage', () => {
  beforeEach(async () => {
    await router.push('/drivers');
    vi.clearAllMocks();
  });

  it('renders title and subtitle', async () => {
    const wrapper = mount(DriversPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="drivers-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="drivers-subtitle"]').exists()).toBe(true);
  });

  it('has add driver button and table', async () => {
    const wrapper = mount(DriversPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="button-add-driver"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="table-drivers"]').exists()).toBe(true);
  });

  it('opens drawer when add driver is clicked', async () => {
    const wrapper = mount(DriversPage, {
      global: { plugins: [createPinia(), i18n, router] },
    });
    await wrapper.vm.$nextTick();
    await wrapper.find('[data-test="button-add-driver"]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="drawer"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="form-driver"]').exists()).toBe(true);
  });
});
