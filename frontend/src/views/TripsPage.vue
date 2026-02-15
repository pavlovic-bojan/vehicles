<template>
  <div class="trips-page" data-test="page-trips">
    <h1 class="trips-page__title" data-test="trips-title">{{ $t('trips.title') }}</h1>
    <p class="trips-page__subtitle" data-test="trips-subtitle">{{ $t('trips.subtitle') }}</p>
    <div class="trips-page__actions">
      <button type="button" class="trips-page__btn trips-page__btn--primary" data-test="button-add-trip" @click="openDrawer()">
        {{ $t('trips.addTrip') }}
      </button>
    </div>
    <div class="trips-page__table-wrap" data-test="table-wrap">
      <table class="trips-page__table" data-test="table-trips">
        <thead>
          <tr>
            <th>{{ $t('trips.vehicle') }}</th>
            <th>{{ $t('trips.driver') }}</th>
            <th>{{ $t('trips.startAt') }}</th>
            <th>{{ $t('trips.endAt') }}</th>
            <th>{{ $t('trips.status') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="trips-page__row-loading" data-test="row-loading">
            <td colspan="6">{{ $t('common.loading') }}</td>
          </tr>
          <tr v-else-if="items.length === 0" class="trips-page__row-empty" data-test="row-empty">
            <td colspan="6">{{ $t('trips.noTrips') }}</td>
          </tr>
          <tr v-else v-for="t in items" :key="t.id" :data-test="`row-trip-${t.id}`">
            <td>{{ vehicleLabel(t) }}</td>
            <td>{{ driverLabel(t) }}</td>
            <td>{{ formatDateTime(t.startAt) }}</td>
            <td>{{ t.endAt ? formatDateTime(t.endAt) : '—' }}</td>
            <td>{{ $t(statusLabel(t.status)) }}</td>
            <td>
              <button type="button" class="trips-page__btn trips-page__btn--small" data-test="button-edit-trip" @click="openDrawer(t)">{{ $t('trips.editTrip') }}</button>
              <button type="button" class="trips-page__btn trips-page__btn--small trips-page__btn--danger" :data-test="`button-delete-trip-${t.id}`" @click="confirmDelete(t)">{{ $t('common.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="drawerOpen" class="trips-page__drawer-overlay" data-test="drawer-overlay" @click="closeDrawer"></div>
    <aside class="trips-page__drawer" :class="{ 'trips-page__drawer--open': drawerOpen }" data-test="drawer">
      <div class="trips-page__drawer-inner">
        <h2 class="trips-page__drawer-title" data-test="drawer-title">{{ editingId ? $t('trips.editTrip') : $t('trips.addTrip') }}</h2>
        <form class="trips-page__form" data-test="form-trip" @submit.prevent="submitForm">
          <label class="trips-page__label">{{ $t('trips.vehicle') }} *</label>
          <select v-model="form.vehicleId" class="trips-page__input" data-test="select-vehicle" required :disabled="!!editingId">
            <option value="">{{ $t('trips.selectVehicle') }}</option>
            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.make }} {{ v.model }} ({{ v.registration || v.id }})</option>
          </select>
          <label class="trips-page__label">{{ $t('trips.driver') }} *</label>
          <select v-model="form.driverId" class="trips-page__input" data-test="select-driver" required :disabled="!!editingId">
            <option value="">{{ $t('trips.selectDriver') }}</option>
            <option v-for="d in drivers" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
          <label class="trips-page__label">{{ $t('trips.startAt') }} *</label>
          <input v-model="form.startAt" type="datetime-local" class="trips-page__input" data-test="input-start-at" required />
          <label class="trips-page__label">{{ $t('trips.startMileage') }}</label>
          <input v-model.number="form.startMileage" type="number" min="0" class="trips-page__input" data-test="input-start-mileage" />
          <label class="trips-page__label">{{ $t('trips.status') }}</label>
          <select v-model="form.status" class="trips-page__input" data-test="select-status">
            <option value="PRE_TRIP">{{ $t('trips.statusPreTrip') }}</option>
            <option value="IN_PROGRESS">{{ $t('trips.statusInProgress') }}</option>
            <option value="POST_TRIP">{{ $t('trips.statusPostTrip') }}</option>
            <option value="COMPLETED">{{ $t('trips.statusCompleted') }}</option>
          </select>
          <label class="trips-page__label">{{ $t('trips.notes') }}</label>
          <textarea v-model="form.notes" class="trips-page__input trips-page__textarea" data-test="input-notes" rows="2"></textarea>
          <div v-if="editingId" class="trips-page__form-group">
            <label class="trips-page__label">{{ $t('trips.endAt') }}</label>
            <input v-model="form.endAt" type="datetime-local" class="trips-page__input" data-test="input-end-at" />
            <label class="trips-page__label">{{ $t('trips.endMileage') }}</label>
            <input v-model.number="form.endMileage" type="number" min="0" class="trips-page__input" data-test="input-end-mileage" />
          </div>
          <div class="trips-page__form-actions">
            <button type="submit" class="trips-page__btn trips-page__btn--primary" :disabled="saving" data-test="button-save-trip">{{ $t('common.save') }}</button>
            <button type="button" class="trips-page__btn trips-page__btn--secondary" data-test="button-cancel-drawer" @click="closeDrawer">{{ $t('common.cancel') }}</button>
          </div>
        </form>
      </div>
    </aside>

    <div v-if="deleteTarget" class="trips-page__dialog-overlay" data-test="dialog-overlay" @click="deleteTarget = null"></div>
    <div v-if="deleteTarget" class="trips-page__dialog" data-test="dialog-delete">
      <p class="trips-page__dialog-text">{{ $t('trips.confirmDelete') }}</p>
      <div class="trips-page__dialog-actions">
        <button type="button" class="trips-page__btn trips-page__btn--danger" data-test="button-confirm-delete" @click="doDelete">{{ $t('common.yes') }}</button>
        <button type="button" class="trips-page__btn trips-page__btn--secondary" data-test="button-cancel-delete" @click="deleteTarget = null">{{ $t('common.no') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { tripsApi, type Trip, type TripStatus } from '../api/trips.api';
import { vehiclesApi } from '../api/vehicles.api';
import { driversApi, type Driver } from '../api/drivers.api';

const loading = ref(true);
const items = ref<Trip[]>([]);
const vehicles = ref<{ id: string; make: string; model: string; registration: string | null }[]>([]);
const drivers = ref<Driver[]>([]);
const drawerOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const deleteTarget = ref<Trip | null>(null);

const form = ref({
  vehicleId: '',
  driverId: '',
  startAt: '',
  startMileage: 0,
  endAt: '',
  endMileage: 0,
  status: 'PRE_TRIP' as TripStatus,
  notes: '',
});

const statusLabelMap: Record<TripStatus, string> = {
  PRE_TRIP: 'trips.statusPreTrip',
  IN_PROGRESS: 'trips.statusInProgress',
  POST_TRIP: 'trips.statusPostTrip',
  COMPLETED: 'trips.statusCompleted',
};

function statusLabel(s: TripStatus): string {
  return statusLabelMap[s] || s;
}

function vehicleLabel(t: Trip): string {
  if (t.vehicle) return `${t.vehicle.make} ${t.vehicle.model}`;
  return t.vehicleId;
}

function driverLabel(t: Trip): string {
  return t.driver?.name ?? t.driverId;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

async function load() {
  loading.value = true;
  try {
    const { data } = await tripsApi.list();
    items.value = data.data;
  } finally {
    loading.value = false;
  }
}

async function loadOptions() {
  const [vRes, dRes] = await Promise.all([
    vehiclesApi.list(),
    driversApi.list(),
  ]);
  vehicles.value = vRes.data.data;
  drivers.value = dRes.data.data;
}

function openDrawer(trip?: Trip) {
  editingId.value = trip?.id ?? null;
  const now = new Date();
  const nowLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  form.value = {
    vehicleId: trip?.vehicleId ?? '',
    driverId: trip?.driverId ?? '',
    startAt: trip?.startAt ? trip.startAt.slice(0, 16) : nowLocal,
    startMileage: trip?.startMileage ?? 0,
    endAt: trip?.endAt ? trip.endAt.slice(0, 16) : '',
    endMileage: trip?.endMileage ?? 0,
    status: (trip?.status as TripStatus) ?? 'PRE_TRIP',
    notes: trip?.notes ?? '',
  };
  drawerOpen.value = true;
  loadOptions();
}

function closeDrawer() {
  drawerOpen.value = false;
  editingId.value = null;
}

async function submitForm() {
  saving.value = true;
  try {
    const id = editingId.value;
    if (id) {
      await tripsApi.update(id, {
        endAt: form.value.endAt || undefined,
        endMileage: form.value.endMileage || undefined,
        status: form.value.status,
        notes: form.value.notes || undefined,
      });
    } else {
      await tripsApi.create({
        vehicleId: form.value.vehicleId,
        driverId: form.value.driverId,
        startAt: new Date(form.value.startAt).toISOString(),
        startMileage: form.value.startMileage,
        status: form.value.status,
        notes: form.value.notes || undefined,
      });
    }
    closeDrawer();
    await load();
  } finally {
    saving.value = false;
  }
}

function confirmDelete(t: Trip) {
  deleteTarget.value = t;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  try {
    await tripsApi.delete(deleteTarget.value.id);
    deleteTarget.value = null;
    await load();
  } finally {
    deleteTarget.value = null;
  }
}

onMounted(() => load());
</script>

<style scoped>
.trips-page { width: 100%; }
.trips-page__title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem; color: #333; }
.trips-page__subtitle { font-size: 0.9rem; color: #666; margin: 0 0 1.5rem; }
.trips-page__actions { margin-bottom: 1rem; }
.trips-page__btn { padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: 1px solid transparent; }
.trips-page__btn--primary { background: #1976d2; color: #fff; }
.trips-page__btn--secondary { background: #f5f5f5; color: #333; border-color: #ddd; }
.trips-page__btn--danger { background: #c62828; color: #fff; }
.trips-page__btn--small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
.trips-page__table-wrap { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; background: #fff; }
.trips-page__table { width: 100%; border-collapse: collapse; }
.trips-page__table th { text-align: left; padding: 0.75rem 1rem; background: #f5f5f5; font-size: 0.8rem; font-weight: 600; color: #666; }
.trips-page__table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; font-size: 0.9rem; }
.trips-page__row-loading td, .trips-page__row-empty td { text-align: center; padding: 2rem; color: #888; }
.trips-page__drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; }
.trips-page__drawer { position: fixed; top: 0; right: 0; width: 400px; max-width: 100%; height: 100%; background: #fff; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 101; transform: translateX(100%); transition: transform 0.2s; }
.trips-page__drawer--open { transform: translateX(0); }
.trips-page__drawer-inner { padding: 1.5rem; }
.trips-page__drawer-title { font-size: 1.25rem; margin: 0 0 1rem; }
.trips-page__form { display: flex; flex-direction: column; gap: 0.75rem; }
.trips-page__form-group { display: flex; flex-direction: column; gap: 0.75rem; }
.trips-page__label { font-size: 0.875rem; font-weight: 500; color: #333; }
.trips-page__input { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; width: 100%; box-sizing: border-box; }
.trips-page__textarea { resize: vertical; min-height: 60px; }
.trips-page__form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.trips-page__dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 102; }
.trips-page__dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 103; min-width: 280px; }
.trips-page__dialog-text { margin: 0 0 1rem; }
.trips-page__dialog-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
</style>
