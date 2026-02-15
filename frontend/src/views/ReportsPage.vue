<template>
  <div class="reports-page" data-test="page-reports">
    <div class="reports-page__header">
      <h1 class="reports-page__title" data-test="reports-title">{{ $t('reports.title') }}</h1>
      <p class="reports-page__subtitle" data-test="reports-subtitle">{{ $t('reports.subtitle') }}</p>
      <div class="reports-page__actions">
        <button type="button" class="reports-page__btn reports-page__btn--secondary" data-test="btn-export-csv" :disabled="loading" @click="exportCsv">
          {{ $t('reports.exportCsv') }}
        </button>
        <button type="button" class="reports-page__btn reports-page__btn--primary" data-test="btn-export-pdf" :disabled="loading" @click="exportPdf">
          {{ $t('reports.exportPdf') }}
        </button>
      </div>
    </div>
    <div v-if="loading" class="reports-page__loading" data-test="row-loading">
      {{ $t('common.loading') }}
    </div>
    <div v-else class="reports-page__content" data-test="reports-content">
      <section class="reports-page__section" data-test="section-summary">
        <h2 class="reports-page__section-title">{{ $t('reports.summary') }}</h2>
        <div class="reports-page__cards">
          <div class="reports-page__card" data-test="card-vehicles">
            <span class="reports-page__card-value">{{ summary.vehicles }}</span>
            <span class="reports-page__card-label">{{ $t('dashboard.vehicles') }}</span>
          </div>
          <div class="reports-page__card" data-test="card-drivers">
            <span class="reports-page__card-value">{{ summary.drivers }}</span>
            <span class="reports-page__card-label">{{ $t('dashboard.drivers') }}</span>
          </div>
          <div class="reports-page__card" data-test="card-trips">
            <span class="reports-page__card-value">{{ summary.trips }}</span>
            <span class="reports-page__card-label">{{ $t('dashboard.trips') }}</span>
          </div>
          <div class="reports-page__card" data-test="card-fuel">
            <span class="reports-page__card-value">{{ summary.fuelRecords }}</span>
            <span class="reports-page__card-label">{{ $t('dashboard.fuel') }}</span>
          </div>
          <div class="reports-page__card" data-test="card-locations">
            <span class="reports-page__card-value">{{ summary.locations }}</span>
            <span class="reports-page__card-label">{{ $t('dashboard.locations') }}</span>
          </div>
        </div>
      </section>
      <section class="reports-page__section" data-test="section-fuel">
        <h2 class="reports-page__section-title">{{ $t('reports.fuelByVehicle') }}</h2>
        <div class="reports-page__table-wrap">
          <table class="reports-page__table" data-test="table-fuel">
            <thead>
              <tr>
                <th>{{ $t('reports.vehicle') }}</th>
                <th>{{ $t('reports.totalLiters') }}</th>
                <th>{{ $t('reports.totalCost') }}</th>
                <th>{{ $t('reports.recordCount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="fuelReport.length === 0" class="reports-page__row-empty">
                <td colspan="4">{{ $t('reports.noData') }}</td>
              </tr>
              <tr v-for="row in fuelReport" :key="row.vehicleId" :data-test="`row-fuel-${row.vehicleId}`">
                <td>{{ row.vehicleMake }} {{ row.vehicleModel }}</td>
                <td>{{ formatNumber(row.totalLiters) }} L</td>
                <td>{{ row.totalCostCents != null ? formatCents(row.totalCostCents) : '—' }}</td>
                <td>{{ row.recordCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="reports-page__section" data-test="section-trips">
        <h2 class="reports-page__section-title">{{ $t('reports.tripsByStatus') }}</h2>
        <p class="reports-page__total">{{ $t('reports.totalTrips') }}: {{ tripsReport.total }}</p>
        <div class="reports-page__bars">
          <div v-for="item in tripsReport.byStatus" :key="item.status" class="reports-page__bar-row" :data-test="`bar-${item.status}`">
            <span class="reports-page__bar-label">{{ formatTripStatus(item.status) }}</span>
            <div class="reports-page__bar-track">
              <div class="reports-page__bar-fill" :style="{ width: barWidth(item.count) + '%' }" />
            </div>
            <span class="reports-page__bar-value">{{ item.count }}</span>
          </div>
        </div>
        <p v-if="tripsReport.byStatus.length === 0" class="reports-page__no-data">{{ $t('reports.noData') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  reportsApi,
  type ReportSummary,
  type FuelReportItem,
  type TripsReport,
} from '../api/reports.api';

const { t } = useI18n();
const loading = ref(true);
const summary = ref<ReportSummary>({
  vehicles: 0,
  drivers: 0,
  trips: 0,
  fuelRecords: 0,
  locations: 0,
});
const fuelReport = ref<FuelReportItem[]>([]);
const tripsReport = ref<TripsReport>({ total: 0, byStatus: [] });

async function load() {
  loading.value = true;
  try {
    const [s, f, tr] = await Promise.all([
      reportsApi.getSummary(),
      reportsApi.getFuelReport(),
      reportsApi.getTripsReport(),
    ]);
    summary.value = s.data.data;
    fuelReport.value = f.data.data;
    tripsReport.value = tr.data.data;
  } finally {
    loading.value = false;
  }
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatTripStatus(status: string): string {
  const key = `reports.tripStatus.${status}`;
  const out = t(key);
  return out !== key ? out : status;
}

function barWidth(count: number): number {
  const max = Math.max(1, ...tripsReport.value.byStatus.map((x) => x.count));
  return max ? (count / max) * 100 : 0;
}

function exportCsv() {
  const rows: string[][] = [
    [t('reports.summary'), ''],
    [t('dashboard.vehicles'), String(summary.value.vehicles)],
    [t('dashboard.drivers'), String(summary.value.drivers)],
    [t('dashboard.trips'), String(summary.value.trips)],
    [t('dashboard.fuel'), String(summary.value.fuelRecords)],
    [t('dashboard.locations'), String(summary.value.locations)],
    [],
    [t('reports.fuelByVehicle'), '', '', ''],
    [t('reports.vehicle'), t('reports.totalLiters'), t('reports.totalCost'), t('reports.recordCount')],
    ...fuelReport.value.map((r) => [
      `${r.vehicleMake} ${r.vehicleModel}`,
      String(r.totalLiters),
      r.totalCostCents != null ? String(r.totalCostCents / 100) : '',
      String(r.recordCount),
    ]),
    [],
    [t('reports.tripsByStatus'), ''],
    [t('reports.totalTrips'), String(tripsReport.value.total)],
    ...tripsReport.value.byStatus.map((x) => [formatTripStatus(x.status), String(x.count)]),
  ];
  const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPdf() {
  window.print();
}

onMounted(() => load());
</script>

<style scoped>
.reports-page { width: 100%; }
.reports-page__header { margin-bottom: 1.5rem; }
.reports-page__title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem; color: #333; }
.reports-page__subtitle { font-size: 0.9rem; color: #666; margin: 0 0 1rem; }
.reports-page__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.reports-page__btn { padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: 1px solid transparent; }
.reports-page__btn:disabled { opacity: 0.6; cursor: not-allowed; }
.reports-page__btn--primary { background: #1976d2; color: #fff; }
.reports-page__btn--secondary { background: #f5f5f5; color: #333; border-color: #ddd; }
.reports-page__loading { padding: 2rem; color: #888; }
.reports-page__section { margin-bottom: 2rem; }
.reports-page__section-title { font-size: 1.15rem; font-weight: 600; margin: 0 0 1rem; color: #333; }
.reports-page__cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; }
.reports-page__card { padding: 1rem; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center; }
.reports-page__card-value { display: block; font-size: 1.5rem; font-weight: 700; color: #333; }
.reports-page__card-label { font-size: 0.85rem; color: #666; }
.reports-page__table-wrap { border: 1px solid #e0e0e0; border-radius: 4px; overflow: auto; background: #fff; }
.reports-page__table { width: 100%; border-collapse: collapse; }
.reports-page__table th { text-align: left; padding: 0.75rem 1rem; background: #f5f5f5; font-size: 0.8rem; font-weight: 600; color: #666; }
.reports-page__table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; font-size: 0.9rem; }
.reports-page__row-empty td { text-align: center; padding: 2rem; color: #888; }
.reports-page__total { margin: 0 0 0.75rem; font-size: 0.95rem; color: #666; }
.reports-page__bars { display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px; }
.reports-page__bar-row { display: grid; grid-template-columns: 120px 1fr 40px; align-items: center; gap: 0.5rem; }
.reports-page__bar-label { font-size: 0.9rem; color: #333; }
.reports-page__bar-track { height: 20px; background: #eee; border-radius: 4px; overflow: hidden; }
.reports-page__bar-fill { height: 100%; background: #1976d2; border-radius: 4px; min-width: 2px; }
.reports-page__bar-value { font-size: 0.9rem; font-weight: 600; color: #333; text-align: right; }
.reports-page__no-data { color: #888; font-size: 0.9rem; margin: 0; }

@media print {
  .reports-page__actions { display: none !important; }
  .reports-page__btn { display: none !important; }
}
</style>
