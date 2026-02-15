<template>
  <div class="locations-page" data-test="page-locations">
    <h1 class="locations-page__title" data-test="locations-title">{{ $t('locations.title') }}</h1>
    <p class="locations-page__subtitle" data-test="locations-subtitle">{{ $t('locations.subtitle') }}</p>
    <div class="locations-page__actions">
      <button type="button" class="locations-page__btn locations-page__btn--primary" data-test="button-add-location" @click="openDrawer()">
        {{ $t('locations.addLocation') }}
      </button>
      <select v-model="filterType" class="locations-page__filter" data-test="filter-type">
        <option value="">{{ $t('common.all') }}</option>
        <option value="PARKING">{{ $t('locations.typeParking') }}</option>
        <option value="SERVICE">{{ $t('locations.typeService') }}</option>
      </select>
    </div>
    <div class="locations-page__table-wrap" data-test="table-wrap">
      <table class="locations-page__table" data-test="table-locations">
        <thead>
          <tr>
            <th>{{ $t('locations.name') }}</th>
            <th>{{ $t('locations.type') }}</th>
            <th>{{ $t('locations.address') }}</th>
            <th>{{ $t('locations.status') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="locations-page__row-loading" data-test="row-loading">
            <td colspan="5">{{ $t('common.loading') }}</td>
          </tr>
          <tr v-else-if="filteredItems.length === 0" class="locations-page__row-empty" data-test="row-empty">
            <td colspan="5">{{ $t('locations.noLocations') }}</td>
          </tr>
          <tr v-else v-for="loc in filteredItems" :key="loc.id" :data-test="`row-location-${loc.id}`">
            <td>{{ loc.name }}</td>
            <td>{{ loc.type === 'PARKING' ? $t('locations.typeParking') : $t('locations.typeService') }}</td>
            <td>{{ loc.address || '—' }}</td>
            <td>{{ $t(statusLabel(loc.status)) }}</td>
            <td>
              <button type="button" class="locations-page__btn locations-page__btn--small" data-test="button-edit-location" @click="openDrawer(loc)">{{ $t('locations.editLocation') }}</button>
              <button type="button" class="locations-page__btn locations-page__btn--small locations-page__btn--danger" :data-test="`button-delete-location-${loc.id}`" @click="confirmDelete(loc)">{{ $t('common.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="drawerOpen" class="locations-page__drawer-overlay" data-test="drawer-overlay" @click="closeDrawer"></div>
    <aside class="locations-page__drawer" :class="{ 'locations-page__drawer--open': drawerOpen }" data-test="drawer">
      <div class="locations-page__drawer-inner">
        <h2 class="locations-page__drawer-title" data-test="drawer-title">{{ editingId ? $t('locations.editLocation') : $t('locations.addLocation') }}</h2>
        <form class="locations-page__form" data-test="form-location" @submit.prevent="submitForm">
          <label class="locations-page__label">{{ $t('locations.name') }} *</label>
          <input v-model="form.name" type="text" class="locations-page__input" data-test="input-name" required />
          <label class="locations-page__label">{{ $t('locations.type') }} *</label>
          <select v-model="form.type" class="locations-page__input" data-test="select-type" required :disabled="!!editingId">
            <option value="">{{ $t('locations.selectType') }}</option>
            <option value="PARKING">{{ $t('locations.typeParking') }}</option>
            <option value="SERVICE">{{ $t('locations.typeService') }}</option>
          </select>
          <label class="locations-page__label">{{ $t('locations.address') }}</label>
          <input v-model="form.address" type="text" class="locations-page__input" data-test="input-address" />
          <label class="locations-page__label">{{ $t('locations.status') }}</label>
          <select v-model="form.status" class="locations-page__input" data-test="select-status">
            <option value="ACTIVE">{{ $t('locations.statusActive') }}</option>
            <option value="PAUSED">{{ $t('locations.statusPaused') }}</option>
            <option value="FROZEN">{{ $t('locations.statusFrozen') }}</option>
          </select>
          <div class="locations-page__form-actions">
            <button type="submit" class="locations-page__btn locations-page__btn--primary" :disabled="saving" data-test="button-save-location">{{ $t('common.save') }}</button>
            <button type="button" class="locations-page__btn locations-page__btn--secondary" data-test="button-cancel-drawer" @click="closeDrawer">{{ $t('common.cancel') }}</button>
          </div>
        </form>
      </div>
    </aside>

    <div v-if="deleteTarget" class="locations-page__dialog-overlay" data-test="dialog-overlay" @click="deleteTarget = null"></div>
    <div v-if="deleteTarget" class="locations-page__dialog" data-test="dialog-delete">
      <p class="locations-page__dialog-text">{{ $t('locations.confirmDelete') }}</p>
      <div class="locations-page__dialog-actions">
        <button type="button" class="locations-page__btn locations-page__btn--danger" data-test="button-confirm-delete" @click="doDelete">{{ $t('common.yes') }}</button>
        <button type="button" class="locations-page__btn locations-page__btn--secondary" data-test="button-cancel-delete" @click="deleteTarget = null">{{ $t('common.no') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { locationsApi, type Location as LocationType, type LocationStatus } from '../api/locations.api';

const loading = ref(true);
const items = ref<LocationType[]>([]);
const drawerOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const deleteTarget = ref<LocationType | null>(null);
const filterType = ref<'PARKING' | 'SERVICE' | ''>('');

const form = ref({
  name: '',
  type: 'PARKING' as 'PARKING' | 'SERVICE',
  address: '',
  status: 'ACTIVE' as LocationStatus,
});

const statusLabelMap: Record<LocationStatus, string> = {
  ACTIVE: 'locations.statusActive',
  PAUSED: 'locations.statusPaused',
  FROZEN: 'locations.statusFrozen',
};

function statusLabel(s: LocationStatus): string {
  return statusLabelMap[s] || s;
}

const filteredItems = computed(() => {
  if (!filterType.value) return items.value;
  return items.value.filter((l) => l.type === filterType.value);
});

async function load() {
  loading.value = true;
  try {
    const { data } = await locationsApi.list();
    items.value = data.data;
  } finally {
    loading.value = false;
  }
}

function openDrawer(loc?: LocationType) {
  editingId.value = loc?.id ?? null;
  form.value = {
    name: loc?.name ?? '',
    type: (loc?.type as 'PARKING' | 'SERVICE') ?? 'PARKING',
    address: loc?.address ?? '',
    status: (loc?.status as LocationStatus) ?? 'ACTIVE',
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
      type: form.value.type,
      address: form.value.address || undefined,
      status: form.value.status,
    };
    if (id) {
      await locationsApi.update(id, payload);
    } else {
      await locationsApi.create(payload);
    }
    closeDrawer();
    await load();
  } finally {
    saving.value = false;
  }
}

function confirmDelete(loc: LocationType) {
  deleteTarget.value = loc;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  try {
    await locationsApi.delete(deleteTarget.value.id);
    deleteTarget.value = null;
    await load();
  } finally {
    deleteTarget.value = null;
  }
}

onMounted(() => load());
</script>

<style scoped>
.locations-page { width: 100%; }
.locations-page__title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem; color: #333; }
.locations-page__subtitle { font-size: 0.9rem; color: #666; margin: 0 0 1.5rem; }
.locations-page__actions { margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.locations-page__btn { padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: 1px solid transparent; }
.locations-page__btn--primary { background: #1976d2; color: #fff; }
.locations-page__btn--secondary { background: #f5f5f5; color: #333; border-color: #ddd; }
.locations-page__btn--danger { background: #c62828; color: #fff; }
.locations-page__btn--small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
.locations-page__filter { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem; }
.locations-page__table-wrap { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; background: #fff; }
.locations-page__table { width: 100%; border-collapse: collapse; }
.locations-page__table th { text-align: left; padding: 0.75rem 1rem; background: #f5f5f5; font-size: 0.8rem; font-weight: 600; color: #666; }
.locations-page__table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; font-size: 0.9rem; }
.locations-page__row-loading td, .locations-page__row-empty td { text-align: center; padding: 2rem; color: #888; }
.locations-page__drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; }
.locations-page__drawer { position: fixed; top: 0; right: 0; width: 360px; max-width: 100%; height: 100%; background: #fff; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 101; transform: translateX(100%); transition: transform 0.2s; }
.locations-page__drawer--open { transform: translateX(0); }
.locations-page__drawer-inner { padding: 1.5rem; }
.locations-page__drawer-title { font-size: 1.25rem; margin: 0 0 1rem; }
.locations-page__form { display: flex; flex-direction: column; gap: 0.75rem; }
.locations-page__label { font-size: 0.875rem; font-weight: 500; color: #333; }
.locations-page__input { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; width: 100%; box-sizing: border-box; }
.locations-page__form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.locations-page__dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 102; }
.locations-page__dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 103; min-width: 280px; }
.locations-page__dialog-text { margin: 0 0 1rem; }
.locations-page__dialog-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
</style>
