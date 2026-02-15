<template>
  <div class="audit-page" data-test="page-audit">
    <h1 class="audit-page__title" data-test="audit-title">{{ $t('audit.title') }}</h1>
    <p class="audit-page__subtitle" data-test="audit-subtitle">{{ $t('audit.subtitle') }}</p>
    <div v-if="forbidden" class="audit-page__forbidden" data-test="audit-forbidden">
      {{ $t('audit.adminOnly') }}
    </div>
    <div v-else-if="loading" class="audit-page__loading" data-test="row-loading">
      {{ $t('common.loading') }}
    </div>
    <div v-else class="audit-page__table-wrap" data-test="table-wrap">
      <table class="audit-page__table" data-test="table-audit">
        <thead>
          <tr>
            <th>{{ $t('audit.user') }}</th>
            <th>{{ $t('audit.action') }}</th>
            <th>{{ $t('audit.ip') }}</th>
            <th>{{ $t('audit.userAgent') }}</th>
            <th>{{ $t('audit.createdAt') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0" class="audit-page__row-empty" data-test="row-empty">
            <td colspan="5">{{ $t('audit.noEntries') }}</td>
          </tr>
          <tr v-else v-for="e in items" :key="e.id" :data-test="`row-audit-${e.id}`">
            <td>{{ e.user?.name ?? e.user?.email ?? e.userId }}</td>
            <td>{{ e.action }}</td>
            <td>{{ e.ip || '—' }}</td>
            <td class="audit-page__cell-ua">{{ e.userAgent || '—' }}</td>
            <td>{{ formatDateTime(e.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { authApi, type LoginAuditEntry } from '../api/auth.api';

const { t } = useI18n();
const loading = ref(true);
const forbidden = ref(false);
const items = ref<LoginAuditEntry[]>([]);

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

async function load() {
  loading.value = true;
  forbidden.value = false;
  try {
    const { data } = await authApi.getAudit({ limit: 200 });
    items.value = data.data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 403) forbidden.value = true;
    else items.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => load());
</script>

<style scoped>
.audit-page { width: 100%; }
.audit-page__title { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem; color: #333; }
.audit-page__subtitle { font-size: 0.9rem; color: #666; margin: 0 0 1.5rem; }
.audit-page__forbidden { padding: 2rem; text-align: center; color: #c62828; font-weight: 500; }
.audit-page__loading { padding: 2rem; text-align: center; color: #888; }
.audit-page__table-wrap { border: 1px solid #e0e0e0; border-radius: 4px; overflow: auto; max-height: 70vh; background: #fff; }
.audit-page__table { width: 100%; min-width: max-content; border-collapse: collapse; }
.audit-page__table th { text-align: left; padding: 0.75rem 1rem; background: #f5f5f5; font-size: 0.8rem; font-weight: 600; color: #666; }
.audit-page__table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; font-size: 0.9rem; }
.audit-page__cell-ua { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.audit-page__row-empty td { text-align: center; padding: 2rem; color: #888; }
</style>
