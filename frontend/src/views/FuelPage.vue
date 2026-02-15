<template>
  <div class="fuel-page" data-test="page-fuel">
    <h1 class="fuel-page__title" data-test="fuel-title">{{ $t('fuel.title') }}</h1>
    <p class="fuel-page__subtitle" data-test="fuel-subtitle">{{ $t('fuel.subtitle') }}</p>
    <div class="fuel-page__actions">
      <button type="button" class="fuel-page__btn fuel-page__btn--primary" data-test="button-add-fuel" @click="openDrawer()">
        {{ $t('fuel.addRecord') }}
      </button>
    </div>
    <div class="fuel-page__table-wrap" data-test="table-wrap">
      <table class="fuel-page__table" data-test="table-fuel">
        <thead>
          <tr>
            <th>{{ $t('fuel.vehicle') }}</th>
            <th>{{ $t('fuel.amountLiters') }}</th>
            <th>{{ $t('fuel.costCents') }}</th>
            <th>{{ $t('fuel.recordedAt') }}</th>
            <th>{{ $t('fuel.notes') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="fuel-page__row-loading" data-test="row-loading">
            <td colspan="6">{{ $t('common.loading') }}</td>
          </tr>
          <tr v-else-if="items.length === 0" class="fuel-page__row-empty" data-test="row-empty">
            <td colspan="6">{{ $t('fuel.noRecords') }}</td>
          </tr>
          <tr v-else v-for="r in items" :key="r.id" :data-test="`row-fuel-${r.id}`">
            <td>{{ vehicleLabel(r) }}</td>
            <td>{{ r.amountLiters }}</td>
            <td>{{ r.costCents != null ? formatCost(r.costCents) : '—' }}</td>
            <td>{{ formatDateTime(r.recordedAt) }}</td>
            <td>{{ r.notes || '—' }}</td>
            <td>
              <button type="button" class="fuel-page__btn fuel-page__btn--small fuel-page__btn--danger" :data-test="`button-delete-fuel-${r.id}`" @click="confirmDelete(r)">{{ $t('common.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="drawerOpen" class="fuel-page__drawer-overlay" data-test="drawer-overlay" @click="closeDrawer"></div>
    <aside class="fuel-page__drawer" :class="{ 'fuel-page__drawer--open': drawerOpen }" data-test="drawer">
      <div class="fuel-page__drawer-inner">
        <h2 class="fuel-page__drawer-title" data-test="drawer-title">{{ $t('fuel.addRecord') }}</h2>
        <form class="fuel-page__form" data-test="form-fuel" @submit.prevent="submitForm">
          <label class="fuel-page__label">{{ $t('fuel.vehicle') }} *</label>
          <select v-model="form.vehicleId" class="fuel-page__input" data-test="select-vehicle" required>
            <option value="">{{ $t('fuel.selectVehicle') }}</option>
            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.make }} {{ v.model }} ({{ v.registration || v.id }})</option>
          </select>
          <label class="fuel-page__label">{{ $t('fuel.trip') }}</label>
          <select v-model="form.tripId" class="fuel-page__input" data-test="select-trip">
            <option value="">{{ $t('fuel.noTrip') }}</option>
            <option v-for="t in trips" :key="t.id" :value="t.id">{{ formatTripLabel(t) }}</option>
          </select>
          <label class="fuel-page__label">{{ $t('fuel.amountLiters') }} *</label>
          <input v-model.number="form.amountLiters" type="number" min="0" step="0.01" class="fuel-page__input" data-test="input-amount-liters" required />
          <label class="fuel-page__label">{{ $t('fuel.costCents') }}</label>
          <input v-model.number="form.costCents" type="number" min="0" class="fuel-page__input" data-test="input-cost-cents" />
          <label class="fuel-page__label">{{ $t('fuel.recordedAt') }}</label>
          <input v-model="form.recordedAt" type="datetime-local" class="fuel-page__input" data-test="input-recorded-at" />
          <label class="fuel-page__label">{{ $t('fuel.notes') }}</label>
          <textarea v-model="form.notes" class="fuel-page__input fuel-page__textarea" data-test="input-notes" rows="2"></textarea>
          <div class="fuel-page__form-actions">
            <button type="submit" class="fuel-page__btn fuel-page__btn--primary" :disabled="saving" data-test="button-save-fuel">{{ $t('common.save') }}</button>
            <button type="button" class="fuel-page__btn fuel-page__btn--secondary" data-test="button-cancel-drawer" @click="closeDrawer">{{ $t('common.cancel') }}</button>
          </div>
        </form>
      </div>
    </aside>

    <div v-if="deleteTarget" class="fuel-page__dialog-overlay" data-test="dialog-overlay" @click="deleteTarget = null"></div>
    <div v-if="deleteTarget" class="fuel-page__dialog" data-test="dialog-delete">
      <p class="fuel-page__dialog-text">{{ $t('fuel.confirmDelete') }}</p>
      <div class="fuel-page__dialog-actions">
        <button type="button" class="fuel-page__btn fuel-page__btn--danger" data-test="button-confirm-delete" @click="doDelete">{{ $t('common.yes') }}</button>
        <button type="button" class="fuel-page__btn fuel-page__btn--secondary" data-test="button-cancel-delete" @click="deleteTarget = null">{{ $t('common.no') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fuelApi, type FuelRecord } from '../api/fuel.api';
import { vehiclesApi } from '../api/vehicles.api';
import { tripsApi, type Trip } from '../api/trips.api';

const loading = ref(true);
const items = ref<FuelRecord[]>([]);
const vehicles = ref<{ id: string; make: string; model: string; registration: string | null }[]>([]);
const trips = ref<Trip[]>([]);
const drawerOpen = ref(false);
const saving = ref(false);
const deleteTarget = ref<FuelRecord | null>(null);

const form = ref({
  vehicleId: '',
  tripId: '',
  amountLiters: 0,
  costCents: 0 as number | '',
  recordedAt: '',
  notes: '',
});

function vehicleLabel(r: FuelRecord): string {
  if (r.vehicle) return `${r.vehicle.make} ${r.vehicle.model}`;
  return r.vehicleId;
}

function formatCost(cents: number): string {
  return (cents / 100).toFixed(2);
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function formatTripLabel(t: Trip): string {
  const start = t.startAt ? new Date(t.startAt).toLocaleDateString() : '';
  const v = t.vehicle ? `${t.vehicle.make} ${t.vehicle.model}` : t.vehicleId;
  return `${v} – ${start}`;
}

async function load() {
  loading.value = true;
  try {
    const { data } = await fuelApi.list();
    items.value = data.data;
  } finally {
    loading.value = false;
  }
}

async function loadOptions() {
  const [vRes, tRes] = await Promise.all([
    vehiclesApi.list(),
    tripsApi.list(),
  ]);
  vehicles.value = vRes.data.data;
  trips.value = tRes.data.data;
}

function openDrawer() {
  const now = new Date();
  const nowLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  form.value = {
    vehicleId: '',
    tripId: '',
    amountLiters: 0,
    costCents: '',
    recordedAt: nowLocal,
    notes: '',
  };
  drawerOpen.value = true;
  loadOptions();
}

function closeDrawer() {
  drawerOpen.value = false;
}

async function submitForm() {
  saving.value = true;
  try {
    await fuelApi.create({
      vehicleId: form.value.vehicleId,
      tripId: form.value.tripId || undefined,
      amountLiters: form.value.amountLiters,
      costCents: form.value.costCents === '' ? undefined : Number(form.value.costCents),
      recordedAt: form.value.recordedAt ? new Date(form.value.recordedAt).toISOString() : undefined,
      notes: form.value.notes || undefined,
    });
    closeDrawer();
    await load();
  } finally {
    saving.value = false;
  }
}

function confirmDelete(r: FuelRecord) {
  deleteTarget.value = r;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  try {
    await fuelApi.delete(deleteTarget.value.id);
    deleteTarget.value = null;
    await load();
  } finally {
    deleteTarget.value = null;
  }
}

onMounted(() => load());
</script>

<style scoped>
.fuel-page { width: 100%; }
.fuel-page__title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem; color: #333; }
.fuel-page__subtitle { font-size: 0.9rem; color: #666; margin: 0 0 1.5rem; }
.fuel-page__actions { margin-bottom: 1rem; }
.fuel-page__btn { padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: 1px solid transparent; }
.fuel-page__btn--primary { background: #1976d2; color: #fff; }
.fuel-page__btn--secondary { background: #f5f5f5; color: #333; border-color: #ddd; }
.fuel-page__btn--danger { background: #c62828; color: #fff; }
.fuel-page__btn--small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
.fuel-page__table-wrap { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; background: #fff; }
.fuel-page__table { width: 100%; border-collapse: collapse; }
.fuel-page__table th { text-align: left; padding: 0.75rem 1rem; background: #f5f5f5; font-size: 0.8rem; font-weight: 600; color: #666; }
.fuel-page__table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; font-size: 0.9rem; }
.fuel-page__row-loading td, .fuel-page__row-empty td { text-align: center; padding: 2rem; color: #888; }
.fuel-page__drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; }
.fuel-page__drawer { position: fixed; top: 0; right: 0; width: 400px; max-width: 100%; height: 100%; background: #fff; box-shadow: -2px 0 12px rgba(0,0,0,0.15); z-index: 101; transform: translateX(100%); transition: transform 0.2s; }
.fuel-page__drawer--open { transform: translateX(0); }
.fuel-page__drawer-inner { padding: 1.5rem; }
.fuel-page__drawer-title { font-size: 1.25rem; margin: 0 0 1rem; }
.fuel-page__form { display: flex; flex-direction: column; gap: 0.75rem; }
.fuel-page__label { font-size: 0.875rem; font-weight: 500; color: #333; }
.fuel-page__input { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; width: 100%; box-sizing: border-box; }
.fuel-page__textarea { resize: vertical; min-height: 60px; }
.fuel-page__form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.fuel-page__dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 102; }
.fuel-page__dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 103; min-width: 280px; }
.fuel-page__dialog-text { margin: 0 0 1rem; }
.fuel-page__dialog-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
</style>
