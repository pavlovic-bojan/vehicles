<template>
  <div class="dashboard" data-test="page-dashboard">
    <h1 class="dashboard__title" data-test="dashboard-title">{{ $t('dashboard.title') }}</h1>
    <p class="dashboard__subtitle" data-test="dashboard-subtitle">{{ $t('dashboard.subtitle') }}</p>
    <div class="dashboard__actions">
      <button type="button" class="dashboard__btn dashboard__btn--secondary" data-test="button-filter-new">{{ $t('dashboard.filterNew') }}</button>
      <button type="button" class="dashboard__btn dashboard__btn--secondary" data-test="button-filter-in-progress">{{ $t('dashboard.filterInProgress') }}</button>
    </div>
    <div class="dashboard__table-wrap" data-test="table-wrap">
      <table class="dashboard__table" data-test="table-tickets">
        <thead>
          <tr>
            <th>{{ $t('dashboard.colTitle') }}</th>
            <th>{{ $t('dashboard.colReportedBy') }}</th>
            <th>{{ $t('dashboard.colInstitution') }}</th>
            <th>{{ $t('dashboard.colDate') }}</th>
            <th>{{ $t('dashboard.colStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="dashboard__row-loading" data-test="row-loading">
            <td colspan="5">
              <span class="dashboard__loading-icon" data-test="loading-icon">⚠</span>
              <span class="dashboard__loading-text" data-test="loading-text">{{ $t('common.loading') }}</span>
            </td>
          </tr>
          <tr v-else-if="items.length === 0" class="dashboard__row-empty" data-test="row-empty">
            <td colspan="5">{{ $t('dashboard.noData') }}</td>
          </tr>
          <tr v-else v-for="item in items" :key="item.id" :data-test="`row-item-${item.id}`">
            <td>{{ item.title }}</td>
            <td>{{ item.reportedBy }}</td>
            <td>{{ item.institution }}</td>
            <td>{{ item.date }}</td>
            <td>{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const loading = ref(true);
const items = ref<{ id: string; title: string; reportedBy: string; institution: string; date: string; status: string }[]>([]);

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
    items.value = [];
  }, 800);
});
</script>

<style scoped>
.dashboard { width: 100%; }
.dashboard__title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem; color: #333; }
.dashboard__subtitle { font-size: 0.9rem; color: #666; margin: 0 0 1.5rem; }
.dashboard__actions { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.dashboard__btn { padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; font-size: 0.9rem; }
.dashboard__btn--secondary { color: #666; }
.dashboard__btn:hover { background: #f5f5f5; }
.dashboard__table-wrap { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; background: #fff; }
.dashboard__table { width: 100%; border-collapse: collapse; }
.dashboard__table th { text-align: left; padding: 0.75rem 1rem; background: #f5f5f5; font-size: 0.8rem; font-weight: 600; color: #666; }
.dashboard__table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; font-size: 0.9rem; }
.dashboard__row-loading td { text-align: center; padding: 2rem; color: #888; }
.dashboard__loading-icon { display: inline-block; margin-right: 0.5rem; font-size: 1.25rem; }
.dashboard__row-empty td { text-align: center; padding: 2rem; color: #888; }
</style>
