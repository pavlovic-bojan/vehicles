<template>
  <div class="vehicles-page" data-test="page-vehicles">
    <h1 class="vehicles-page__title" data-test="vehicles-title">{{ $t('vehicles.title') }}</h1>
    <p class="vehicles-page__subtitle" data-test="vehicles-subtitle">{{ $t('vehicles.subtitle') }}</p>
    <div class="vehicles-page__actions">
      <button type="button" class="vehicles-page__btn vehicles-page__btn--primary" data-test="button-add-vehicle" @click="openDrawer()">
        {{ $t('vehicles.addVehicle') }}
      </button>
    </div>
    <div class="vehicles-page__table-wrap" data-test="table-wrap">
      <table class="vehicles-page__table" data-test="table-vehicles">
        <thead>
          <tr>
            <th>{{ $t('vehicles.make') }}</th>
            <th>{{ $t('vehicles.model') }}</th>
            <th>{{ $t('vehicles.vin') }}</th>
            <th>{{ $t('vehicles.registration') }}</th>
            <th>{{ $t('vehicles.mileage') }}</th>
            <th>{{ $t('vehicles.status') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="vehicles-page__row-loading" data-test="row-loading">
            <td colspan="7">{{ $t('common.loading') }}</td>
          </tr>
          <tr v-else-if="items.length === 0" class="vehicles-page__row-empty" data-test="row-empty">
            <td colspan="7">{{ $t('vehicles.noVehicles') }}</td>
          </tr>
          <tr v-else v-for="v in items" :key="v.id" :data-test="`row-vehicle-${v.id}`">
            <td>{{ v.make }}</td>
            <td>{{ v.model }}</td>
            <td>{{ v.vin || '—' }}</td>
            <td>{{ v.registration || '—' }}</td>
            <td>{{ v.mileage }}</td>
            <td>{{ $t(statusLabel(v.status)) }}</td>
            <td>
              <button type="button" class="vehicles-page__btn vehicles-page__btn--small" data-test="button-edit-vehicle" @click="openDrawer(v)">{{ $t('vehicles.editVehicle') }}</button>
              <button type="button" class="vehicles-page__btn vehicles-page__btn--small vehicles-page__btn--danger" :data-test="`button-delete-vehicle-${v.id}`" @click="confirmDelete(v)">{{ $t('common.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Drawer for create/edit (per .cursor rules: use Drawer for create/edit) -->
    <div v-if="drawerOpen" class="vehicles-page__drawer-overlay" data-test="drawer-overlay" @click="closeDrawer"></div>
    <aside class="vehicles-page__drawer" :class="{ 'vehicles-page__drawer--open': drawerOpen }" data-test="drawer">
      <div class="vehicles-page__drawer-inner">
        <h2 class="vehicles-page__drawer-title" data-test="drawer-title">{{ editingId ? $t('vehicles.editVehicle') : $t('vehicles.addVehicle') }}</h2>
        <form class="vehicles-page__form" data-test="form-vehicle" @submit.prevent="submitForm">
          <label class="vehicles-page__label">{{ $t('vehicles.make') }} *</label>
          <input v-model="form.make" type="text" class="vehicles-page__input" data-test="input-make" required />
          <label class="vehicles-page__label">{{ $t('vehicles.model') }} *</label>
          <input v-model="form.model" type="text" class="vehicles-page__input" data-test="input-model" required />
          <label class="vehicles-page__label">{{ $t('vehicles.vin') }}</label>
          <input v-model="form.vin" type="text" class="vehicles-page__input" data-test="input-vin" />
          <label class="vehicles-page__label">{{ $t('vehicles.registration') }}</label>
          <input v-model="form.registration" type="text" class="vehicles-page__input" data-test="input-registration" />
          <label class="vehicles-page__label">{{ $t('vehicles.mileage') }}</label>
          <input v-model.number="form.mileage" type="number" min="0" class="vehicles-page__input" data-test="input-mileage" />
          <label class="vehicles-page__label">{{ $t('vehicles.purchaseDate') }}</label>
          <input v-model="form.purchaseDate" type="date" class="vehicles-page__input" data-test="input-purchase-date" />
          <label class="vehicles-page__label">{{ $t('vehicles.status') }}</label>
          <select v-model="form.status" class="vehicles-page__input" data-test="select-status">
            <option value="ACTIVE">{{ $t('vehicles.statusActive') }}</option>
            <option value="PAUSED">{{ $t('vehicles.statusPaused') }}</option>
            <option value="FROZEN">{{ $t('vehicles.statusFrozen') }}</option>
            <option value="IN_SERVICE">{{ $t('vehicles.statusInService') }}</option>
          </select>
          <div class="vehicles-page__form-actions">
            <button type="submit" class="vehicles-page__btn vehicles-page__btn--primary" :disabled="saving" data-test="button-save-vehicle">{{ $t('common.save') }}</button>
            <button type="button" class="vehicles-page__btn vehicles-page__btn--secondary" data-test="button-cancel-drawer" @click="closeDrawer">{{ $t('common.cancel') }}</button>
          </div>
        </form>
      </div>
    </aside>

    <!-- Delete confirmation dialog (per .cursor rules: use Dialog only for delete confirm) -->
    <div v-if="deleteTarget" class="vehicles-page__dialog-overlay" data-test="dialog-overlay" @click="deleteTarget = null"></div>
    <div v-if="deleteTarget" class="vehicles-page__dialog" data-test="dialog-delete">
      <p class="vehicles-page__dialog-text">{{ $t('vehicles.confirmDelete') }}</p>
      <div class="vehicles-page__dialog-actions">
        <button type="button" class="vehicles-page__btn vehicles-page__btn--danger" data-test="button-confirm-delete" @click="doDelete">{{ $t('common.yes') }}</button>
        <button type="button" class="vehicles-page__btn vehicles-page__btn--secondary" data-test="button-cancel-delete" @click="deleteTarget = null">{{ $t('common.no') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { vehiclesApi, type Vehicle, type VehicleStatus } from '../api/vehicles.api';

const loading = ref(true);
const items = ref<Vehicle[]>([]);
const drawerOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const deleteTarget = ref<Vehicle | null>(null);

const form = ref({
  make: '',
  model: '',
  vin: '',
  registration: '',
  mileage: 0,
  purchaseDate: '',
  status: 'ACTIVE' as VehicleStatus,
});

const statusLabelMap: Record<VehicleStatus, string> = {
  ACTIVE: 'vehicles.statusActive',
  PAUSED: 'vehicles.statusPaused',
  FROZEN: 'vehicles.statusFrozen',
  IN_SERVICE: 'vehicles.statusInService',
};

function statusLabel(s: VehicleStatus): string {
  return statusLabelMap[s] || s;
}

async function load() {
  loading.value = true;
  try {
    const { data } = await vehiclesApi.list();
    items.value = data.data;
  } finally {
    loading.value = false;
  }
}

function openDrawer(vehicle?: Vehicle) {
  editingId.value = vehicle?.id ?? null;
  form.value = {
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    vin: vehicle?.vin ?? '',
    registration: vehicle?.registration ?? '',
    mileage: vehicle?.mileage ?? 0,
    purchaseDate: vehicle?.purchaseDate ? vehicle.purchaseDate.slice(0, 10) : '',
    status: (vehicle?.status as VehicleStatus) ?? 'ACTIVE',
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
      make: form.value.make,
      model: form.value.model,
      vin: form.value.vin || undefined,
      registration: form.value.registration || undefined,
      mileage: form.value.mileage,
      purchaseDate: form.value.purchaseDate || undefined,
      status: form.value.status,
    };
    if (id) {
      await vehiclesApi.update(id, payload);
    } else {
      await vehiclesApi.create(payload);
    }
    closeDrawer();
    await load();
  } finally {
    saving.value = false;
  }
}

function confirmDelete(v: Vehicle) {
  deleteTarget.value = v;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  try {
    await vehiclesApi.delete(deleteTarget.value.id);
    deleteTarget.value = null;
    await load();
  } finally {
    deleteTarget.value = null;
  }
}

onMounted(() => load());
</script>

<style scoped>
.vehicles-page { width: 100%; }
.vehicles-page__title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem; color: #333; }
.vehicles-page__subtitle { font-size: 0.9rem; color: #666; margin: 0 0 1.5rem; }
.vehicles-page__actions { margin-bottom: 1rem; }
.vehicles-page__btn { padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: 1px solid transparent; }
.vehicles-page__btn--primary { background: #1976d2; color: #fff; }
.vehicles-page__btn--secondary { background: #f5f5f5; color: #333; border-color: #ddd; }
.vehicles-page__btn--danger { background: #c62828; color: #fff; }
.vehicles-page__btn--small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
.vehicles-page__table-wrap { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; background: #fff; }
.vehicles-page__table { width: 100%; border-collapse: collapse; }
.vehicles-page__table th { text-align: left; padding: 0.75rem 1rem; background: #f5f5f5; font-size: 0.8rem; font-weight: 600; color: #666; }
.vehicles-page__table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; font-size: 0.9rem; }
.vehicles-page__row-loading td, .vehicles-page__row-empty td { text-align: center; padding: 2rem; color: #888; }
.vehicles-page__drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; }
.vehicles-page__drawer { position: fixed; top: 0; right: 0; width: 360px; max-width: 100%; height: 100%; background: #fff; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 101; transform: translateX(100%); transition: transform 0.2s; }
.vehicles-page__drawer--open { transform: translateX(0); }
.vehicles-page__drawer-inner { padding: 1.5rem; }
.vehicles-page__drawer-title { font-size: 1.25rem; margin: 0 0 1rem; }
.vehicles-page__form { display: flex; flex-direction: column; gap: 0.75rem; }
.vehicles-page__label { font-size: 0.875rem; font-weight: 500; color: #333; }
.vehicles-page__input { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; width: 100%; box-sizing: border-box; }
.vehicles-page__form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.vehicles-page__dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 102; }
.vehicles-page__dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 103; min-width: 280px; }
.vehicles-page__dialog-text { margin: 0 0 1rem; }
.vehicles-page__dialog-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
</style>
