<template>
  <div class="drivers-page" data-test="page-drivers">
    <h1 class="drivers-page__title" data-test="drivers-title">{{ $t('drivers.title') }}</h1>
    <p class="drivers-page__subtitle" data-test="drivers-subtitle">{{ $t('drivers.subtitle') }}</p>
    <div class="drivers-page__actions">
      <button type="button" class="drivers-page__btn drivers-page__btn--primary" data-test="button-add-driver" @click="openDrawer()">
        {{ $t('drivers.addDriver') }}
      </button>
    </div>
    <div class="drivers-page__table-wrap" data-test="table-wrap">
      <table class="drivers-page__table" data-test="table-drivers">
        <thead>
          <tr>
            <th>{{ $t('drivers.name') }}</th>
            <th>{{ $t('drivers.licenseNumber') }}</th>
            <th>{{ $t('drivers.licenseExpiry') }}</th>
            <th>{{ $t('drivers.phone') }}</th>
            <th>{{ $t('drivers.status') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="drivers-page__row-loading" data-test="row-loading">
            <td colspan="6">{{ $t('common.loading') }}</td>
          </tr>
          <tr v-else-if="items.length === 0" class="drivers-page__row-empty" data-test="row-empty">
            <td colspan="6">{{ $t('drivers.noDrivers') }}</td>
          </tr>
          <tr v-else v-for="d in items" :key="d.id" :data-test="`row-driver-${d.id}`">
            <td>{{ d.name }}</td>
            <td>{{ d.licenseNumber || '—' }}</td>
            <td>{{ d.licenseExpiry ? formatDate(d.licenseExpiry) : '—' }}</td>
            <td>{{ d.phone || '—' }}</td>
            <td>{{ $t(statusLabel(d.status)) }}</td>
            <td>
              <button type="button" class="drivers-page__btn drivers-page__btn--small" data-test="button-edit-driver" @click="openDrawer(d)">{{ $t('drivers.editDriver') }}</button>
              <button type="button" class="drivers-page__btn drivers-page__btn--small drivers-page__btn--danger" :data-test="`button-delete-driver-${d.id}`" @click="confirmDelete(d)">{{ $t('common.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="drawerOpen" class="drivers-page__drawer-overlay" data-test="drawer-overlay" @click="closeDrawer"></div>
    <aside class="drivers-page__drawer" :class="{ 'drivers-page__drawer--open': drawerOpen }" data-test="drawer">
      <div class="drivers-page__drawer-inner">
        <h2 class="drivers-page__drawer-title" data-test="drawer-title">{{ editingId ? $t('drivers.editDriver') : $t('drivers.addDriver') }}</h2>
        <form class="drivers-page__form" data-test="form-driver" @submit.prevent="submitForm">
          <label class="drivers-page__label">{{ $t('drivers.name') }} *</label>
          <input v-model="form.name" type="text" class="drivers-page__input" data-test="input-name" required />
          <label class="drivers-page__label">{{ $t('drivers.licenseNumber') }}</label>
          <input v-model="form.licenseNumber" type="text" class="drivers-page__input" data-test="input-license-number" />
          <label class="drivers-page__label">{{ $t('drivers.licenseExpiry') }}</label>
          <input v-model="form.licenseExpiry" type="date" class="drivers-page__input" data-test="input-license-expiry" />
          <label class="drivers-page__label">{{ $t('drivers.phone') }}</label>
          <input v-model="form.phone" type="text" class="drivers-page__input" data-test="input-phone" />
          <label class="drivers-page__label">{{ $t('drivers.status') }}</label>
          <select v-model="form.status" class="drivers-page__input" data-test="select-status">
            <option value="ACTIVE">{{ $t('drivers.statusActive') }}</option>
            <option value="PAUSED">{{ $t('drivers.statusPaused') }}</option>
            <option value="FROZEN">{{ $t('drivers.statusFrozen') }}</option>
          </select>
          <div class="drivers-page__form-actions">
            <button type="submit" class="drivers-page__btn drivers-page__btn--primary" :disabled="saving" data-test="button-save-driver">{{ $t('common.save') }}</button>
            <button type="button" class="drivers-page__btn drivers-page__btn--secondary" data-test="button-cancel-drawer" @click="closeDrawer">{{ $t('common.cancel') }}</button>
          </div>
        </form>
      </div>
    </aside>

    <div v-if="deleteTarget" class="drivers-page__dialog-overlay" data-test="dialog-overlay" @click="deleteTarget = null"></div>
    <div v-if="deleteTarget" class="drivers-page__dialog" data-test="dialog-delete">
      <p class="drivers-page__dialog-text">{{ $t('drivers.confirmDelete') }}</p>
      <div class="drivers-page__dialog-actions">
        <button type="button" class="drivers-page__btn drivers-page__btn--danger" data-test="button-confirm-delete" @click="doDelete">{{ $t('common.yes') }}</button>
        <button type="button" class="drivers-page__btn drivers-page__btn--secondary" data-test="button-cancel-delete" @click="deleteTarget = null">{{ $t('common.no') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { driversApi, type Driver as DriverType, type DriverStatus } from '../api/drivers.api';

const loading = ref(true);
const items = ref<DriverType[]>([]);
const drawerOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const deleteTarget = ref<DriverType | null>(null);

const form = ref({
  name: '',
  licenseNumber: '',
  licenseExpiry: '',
  phone: '',
  status: 'ACTIVE' as DriverStatus,
});

const statusLabelMap: Record<DriverStatus, string> = {
  ACTIVE: 'drivers.statusActive',
  PAUSED: 'drivers.statusPaused',
  FROZEN: 'drivers.statusFrozen',
};

function statusLabel(s: DriverStatus): string {
  return statusLabelMap[s] || s;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

async function load() {
  loading.value = true;
  try {
    const { data } = await driversApi.list();
    items.value = data.data;
  } finally {
    loading.value = false;
  }
}

function openDrawer(driver?: DriverType) {
  editingId.value = driver?.id ?? null;
  form.value = {
    name: driver?.name ?? '',
    licenseNumber: driver?.licenseNumber ?? '',
    licenseExpiry: driver?.licenseExpiry ? driver.licenseExpiry.slice(0, 10) : '',
    phone: driver?.phone ?? '',
    status: (driver?.status as DriverStatus) ?? 'ACTIVE',
  };
  drawerOpen.value = true;
}

function closeDrawer() {
  drawerOpen.value = false;
  editingId.value = null;
}

async function submitForm() {
  saving.value = true;
  try {
    const id = editingId.value;
    const payload = {
      name: form.value.name,
      licenseNumber: form.value.licenseNumber || undefined,
      licenseExpiry: form.value.licenseExpiry || undefined,
      phone: form.value.phone || undefined,
      status: form.value.status,
    };
    if (id) {
      await driversApi.update(id, payload);
    } else {
      await driversApi.create(payload);
    }
    closeDrawer();
    await load();
  } finally {
    saving.value = false;
  }
}

function confirmDelete(d: DriverType) {
  deleteTarget.value = d;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  try {
    await driversApi.delete(deleteTarget.value.id);
    deleteTarget.value = null;
    await load();
  } finally {
    deleteTarget.value = null;
  }
}

onMounted(() => load());
</script>

<style scoped>
.drivers-page { width: 100%; }
.drivers-page__title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem; color: #333; }
.drivers-page__subtitle { font-size: 0.9rem; color: #666; margin: 0 0 1.5rem; }
.drivers-page__actions { margin-bottom: 1rem; }
.drivers-page__btn { padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: 1px solid transparent; }
.drivers-page__btn--primary { background: #1976d2; color: #fff; }
.drivers-page__btn--secondary { background: #f5f5f5; color: #333; border-color: #ddd; }
.drivers-page__btn--danger { background: #c62828; color: #fff; }
.drivers-page__btn--small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
.drivers-page__table-wrap { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; background: #fff; }
.drivers-page__table { width: 100%; border-collapse: collapse; }
.drivers-page__table th { text-align: left; padding: 0.75rem 1rem; background: #f5f5f5; font-size: 0.8rem; font-weight: 600; color: #666; }
.drivers-page__table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; font-size: 0.9rem; }
.drivers-page__row-loading td, .drivers-page__row-empty td { text-align: center; padding: 2rem; color: #888; }
.drivers-page__drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; }
.drivers-page__drawer { position: fixed; top: 0; right: 0; width: 360px; max-width: 100%; height: 100%; background: #fff; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 101; transform: translateX(100%); transition: transform 0.2s; }
.drivers-page__drawer--open { transform: translateX(0); }
.drivers-page__drawer-inner { padding: 1.5rem; }
.drivers-page__drawer-title { font-size: 1.25rem; margin: 0 0 1rem; }
.drivers-page__form { display: flex; flex-direction: column; gap: 0.75rem; }
.drivers-page__label { font-size: 0.875rem; font-weight: 500; color: #333; }
.drivers-page__input { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; width: 100%; box-sizing: border-box; }
.drivers-page__form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.drivers-page__dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 102; }
.drivers-page__dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 103; min-width: 280px; }
.drivers-page__dialog-text { margin: 0 0 1rem; }
.drivers-page__dialog-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
</style>
