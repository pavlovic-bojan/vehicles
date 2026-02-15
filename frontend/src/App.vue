<template>
  <router-view />
</template>

<script setup lang="ts">
</script>

<style>
html.dark-theme,
html.dark-theme body {
  background: #1e1e1e;
  color: #e0e0e0;
}

/* Dark theme: Dashboard */
html.dark-theme .dashboard { background: transparent; }
html.dark-theme .dashboard__title { color: #e0e0e0; }
html.dark-theme .dashboard__subtitle { color: #b0b0b0; }
html.dark-theme .dashboard__loading { color: #b0b0b0; }
html.dark-theme .dashboard__loading-icon { color: #b0b0b0; }
html.dark-theme .dashboard__card {
  background: #2d2d2d;
  border-color: #444;
  color: #e0e0e0;
}
html.dark-theme .dashboard__card:hover {
  border-color: #64b5f6;
  box-shadow: 0 4px 12px rgba(100, 181, 246, 0.2);
}
html.dark-theme .dashboard__card-icon { color: #64b5f6; }
html.dark-theme .dashboard__card-value { color: #e0e0e0; }
html.dark-theme .dashboard__card-label { color: #b0b0b0; }

/* Dark theme: all table pages (vehicles, drivers, trips, fuel, locations) */
html.dark-theme .vehicles-page__title,
html.dark-theme .drivers-page__title,
html.dark-theme .trips-page__title,
html.dark-theme .fuel-page__title,
html.dark-theme .locations-page__title,
html.dark-theme .documents-page__title { color: #e0e0e0; }

html.dark-theme .vehicles-page__subtitle,
html.dark-theme .drivers-page__subtitle,
html.dark-theme .trips-page__subtitle,
html.dark-theme .fuel-page__subtitle,
html.dark-theme .locations-page__subtitle,
html.dark-theme .documents-page__subtitle { color: #b0b0b0; }

html.dark-theme .vehicles-page__search,
html.dark-theme .drivers-page__search,
html.dark-theme .trips-page__search,
html.dark-theme .fuel-page__search,
html.dark-theme .locations-page__search,
html.dark-theme .documents-page__search {
  background: #2d2d2d;
  border-color: #555;
  color: #e0e0e0;
}

html.dark-theme .vehicles-page__autocomplete,
html.dark-theme .drivers-page__autocomplete,
html.dark-theme .trips-page__autocomplete,
html.dark-theme .fuel-page__autocomplete,
html.dark-theme .locations-page__autocomplete {
  background: #2d2d2d;
  border-color: #555;
}

html.dark-theme .vehicles-page__autocomplete-item,
html.dark-theme .drivers-page__autocomplete-item,
html.dark-theme .trips-page__autocomplete-item,
html.dark-theme .fuel-page__autocomplete-item,
html.dark-theme .locations-page__autocomplete-item {
  color: #e0e0e0;
}

html.dark-theme .vehicles-page__autocomplete-item:hover,
html.dark-theme .drivers-page__autocomplete-item:hover,
html.dark-theme .trips-page__autocomplete-item:hover,
html.dark-theme .fuel-page__autocomplete-item:hover,
html.dark-theme .locations-page__autocomplete-item:hover {
  background: #3d3d3d;
}

html.dark-theme .vehicles-page__btn--primary,
html.dark-theme .drivers-page__btn--primary,
html.dark-theme .trips-page__btn--primary,
html.dark-theme .fuel-page__btn--primary,
html.dark-theme .locations-page__btn--primary {
  background: #1976d2;
  color: #fff;
  border-color: transparent;
}

html.dark-theme .vehicles-page__btn--secondary,
html.dark-theme .drivers-page__btn--secondary,
html.dark-theme .trips-page__btn--secondary,
html.dark-theme .fuel-page__btn--secondary,
html.dark-theme .locations-page__btn--secondary {
  background: #3d3d3d;
  border-color: #555;
  color: #e0e0e0;
}

html.dark-theme .vehicles-page__btn--secondary:hover:not(:disabled),
html.dark-theme .drivers-page__btn--secondary:hover:not(:disabled),
html.dark-theme .trips-page__btn--secondary:hover:not(:disabled),
html.dark-theme .fuel-page__btn--secondary:hover:not(:disabled),
html.dark-theme .locations-page__btn--secondary:hover:not(:disabled) {
  background: #4d4d4d;
}

html.dark-theme .vehicles-page__btn--danger,
html.dark-theme .drivers-page__btn--danger,
html.dark-theme .trips-page__btn--danger,
html.dark-theme .fuel-page__btn--danger,
html.dark-theme .locations-page__btn--danger {
  background: #c62828;
  color: #fff;
}

html.dark-theme .vehicles-page__btn--small:disabled,
html.dark-theme .drivers-page__btn--small:disabled,
html.dark-theme .trips-page__btn--small:disabled,
html.dark-theme .fuel-page__btn--small:disabled,
html.dark-theme .locations-page__btn--small:disabled {
  opacity: 0.5;
  color: #888;
}

html.dark-theme .vehicles-page__table-wrap,
html.dark-theme .drivers-page__table-wrap,
html.dark-theme .trips-page__table-wrap,
html.dark-theme .fuel-page__table-wrap,
html.dark-theme .locations-page__table-wrap {
  background: #2d2d2d;
  border-color: #444;
}

html.dark-theme .vehicles-page__table th,
html.dark-theme .drivers-page__table th,
html.dark-theme .trips-page__table th,
html.dark-theme .fuel-page__table th,
html.dark-theme .locations-page__table th {
  background: #3d3d3d;
  color: #ccc;
}

html.dark-theme .vehicles-page__table td,
html.dark-theme .drivers-page__table td,
html.dark-theme .trips-page__table td,
html.dark-theme .fuel-page__table td,
html.dark-theme .locations-page__table td {
  border-color: #444;
  color: #e0e0e0;
}

html.dark-theme .vehicles-page__th--sortable:hover,
html.dark-theme .drivers-page__th--sortable:hover,
html.dark-theme .trips-page__th--sortable:hover,
html.dark-theme .fuel-page__th--sortable:hover,
html.dark-theme .locations-page__th--sortable:hover {
  background: #4d4d4d;
}

html.dark-theme .vehicles-page__th--sorted,
html.dark-theme .drivers-page__th--sorted,
html.dark-theme .trips-page__th--sorted,
html.dark-theme .fuel-page__th--sorted,
html.dark-theme .locations-page__th--sorted {
  color: #64b5f6;
}

html.dark-theme .vehicles-page__row-loading td,
html.dark-theme .vehicles-page__row-empty td,
html.dark-theme .drivers-page__row-loading td,
html.dark-theme .drivers-page__row-empty td,
html.dark-theme .trips-page__row-loading td,
html.dark-theme .trips-page__row-empty td,
html.dark-theme .fuel-page__row-loading td,
html.dark-theme .fuel-page__row-empty td,
html.dark-theme .locations-page__row-loading td,
html.dark-theme .locations-page__row-empty td {
  color: #999;
}

html.dark-theme .vehicles-page__btn--icon,
html.dark-theme .drivers-page__btn--icon,
html.dark-theme .trips-page__btn--icon,
html.dark-theme .fuel-page__btn--icon,
html.dark-theme .locations-page__btn--icon {
  color: #e0e0e0;
}

html.dark-theme .vehicles-page__sort-placeholder,
html.dark-theme .drivers-page__sort-placeholder,
html.dark-theme .trips-page__sort-placeholder,
html.dark-theme .fuel-page__sort-placeholder,
html.dark-theme .locations-page__sort-placeholder {
  color: #888;
}

html.dark-theme .vehicles-page__pagination-label,
html.dark-theme .drivers-page__pagination-label,
html.dark-theme .trips-page__pagination-label,
html.dark-theme .fuel-page__pagination-label,
html.dark-theme .locations-page__pagination-label,
html.dark-theme .vehicles-page__pagination-showing,
html.dark-theme .drivers-page__pagination-showing,
html.dark-theme .trips-page__pagination-showing,
html.dark-theme .fuel-page__pagination-showing,
html.dark-theme .vehicles-page__pagination-page,
html.dark-theme .drivers-page__pagination-page,
html.dark-theme .trips-page__pagination-page,
html.dark-theme .fuel-page__pagination-page,
html.dark-theme .locations-page__pagination-page {
  color: #b0b0b0;
}

html.dark-theme .vehicles-page__select,
html.dark-theme .drivers-page__select,
html.dark-theme .trips-page__select,
html.dark-theme .fuel-page__select,
html.dark-theme .locations-page__select {
  background: #2d2d2d;
  border-color: #555;
  color: #e0e0e0;
}

/* Drawer (all pages) */
html.dark-theme .vehicles-page__drawer-overlay,
html.dark-theme .drivers-page__drawer-overlay,
html.dark-theme .trips-page__drawer-overlay,
html.dark-theme .fuel-page__drawer-overlay,
html.dark-theme .locations-page__drawer-overlay {
  background: rgba(0, 0, 0, 0.6);
}

html.dark-theme .vehicles-page__drawer,
html.dark-theme .drivers-page__drawer,
html.dark-theme .trips-page__drawer,
html.dark-theme .fuel-page__drawer,
html.dark-theme .locations-page__drawer {
  background: #2d2d2d;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.4);
}

html.dark-theme .vehicles-page__drawer-title,
html.dark-theme .drivers-page__drawer-title,
html.dark-theme .trips-page__drawer-title,
html.dark-theme .fuel-page__drawer-title,
html.dark-theme .locations-page__drawer-title {
  color: #e0e0e0;
}

html.dark-theme .vehicles-page__drawer-close,
html.dark-theme .drivers-page__drawer-close,
html.dark-theme .trips-page__drawer-close,
html.dark-theme .fuel-page__drawer-close,
html.dark-theme .locations-page__drawer-close {
  color: #b0b0b0;
}

html.dark-theme .vehicles-page__drawer-close:hover,
html.dark-theme .drivers-page__drawer-close:hover,
html.dark-theme .trips-page__drawer-close:hover,
html.dark-theme .fuel-page__drawer-close:hover,
html.dark-theme .locations-page__drawer-close:hover {
  background: #3d3d3d;
  color: #e0e0e0;
}

html.dark-theme .vehicles-page__label,
html.dark-theme .drivers-page__label,
html.dark-theme .trips-page__label,
html.dark-theme .fuel-page__label,
html.dark-theme .locations-page__label {
  color: #ccc;
}

html.dark-theme .vehicles-page__input,
html.dark-theme .drivers-page__input,
html.dark-theme .trips-page__input,
html.dark-theme .fuel-page__input,
html.dark-theme .locations-page__input {
  background: #2d2d2d;
  border-color: #555;
  color: #e0e0e0;
}

html.dark-theme .vehicles-page__input::placeholder,
html.dark-theme .drivers-page__input::placeholder,
html.dark-theme .trips-page__input::placeholder,
html.dark-theme .fuel-page__input::placeholder,
html.dark-theme .locations-page__input::placeholder {
  color: #888;
}

html.dark-theme .vehicles-page__input option,
html.dark-theme .drivers-page__input option,
html.dark-theme .trips-page__input option,
html.dark-theme .fuel-page__input option,
html.dark-theme .locations-page__input option {
  background: #2d2d2d;
  color: #e0e0e0;
}

/* Dialog (delete confirm) */
html.dark-theme .vehicles-page__dialog-overlay,
html.dark-theme .drivers-page__dialog-overlay,
html.dark-theme .trips-page__dialog-overlay,
html.dark-theme .fuel-page__dialog-overlay,
html.dark-theme .locations-page__dialog-overlay {
  background: rgba(0, 0, 0, 0.6);
}

html.dark-theme .vehicles-page__dialog,
html.dark-theme .drivers-page__dialog,
html.dark-theme .trips-page__dialog,
html.dark-theme .fuel-page__dialog,
html.dark-theme .locations-page__dialog {
  background: #2d2d2d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

html.dark-theme .vehicles-page__dialog-text,
html.dark-theme .drivers-page__dialog-text,
html.dark-theme .trips-page__dialog-text,
html.dark-theme .fuel-page__dialog-text,
html.dark-theme .locations-page__dialog-text {
  color: #e0e0e0;
}

/* Locations filter select */
html.dark-theme .locations-page__filter {
  background: #2d2d2d;
  border-color: #555;
  color: #e0e0e0;
}

/* Documents page */
html.dark-theme .documents-page__table-wrap,
html.dark-theme .documents-page__table th,
html.dark-theme .documents-page__table td,
html.dark-theme .documents-page__drawer,
html.dark-theme .documents-page__dialog,
html.dark-theme .documents-page__filter { background: #2d2d2d; border-color: #555; color: #e0e0e0; }
html.dark-theme .documents-page__table th { background: #3d3d3d; color: #ccc; }
html.dark-theme .documents-page__link { color: #64b5f6; }
html.dark-theme .documents-page__drawer-title,
html.dark-theme .documents-page__label,
html.dark-theme .documents-page__input { color: #e0e0e0; }
html.dark-theme .documents-page__input { background: #2d2d2d; }
html.dark-theme .documents-page__btn--primary { background: #1976d2; color: #fff; }
html.dark-theme .documents-page__btn--secondary { background: #3d3d3d; color: #e0e0e0; }
html.dark-theme .documents-page__autocomplete,
html.dark-theme .documents-page__autocomplete-item { background: #2d2d2d; color: #e0e0e0; }
html.dark-theme .documents-page__autocomplete-item:hover { background: #3d3d3d; }
html.dark-theme .documents-page__pagination-label,
html.dark-theme .documents-page__pagination-showing,
html.dark-theme .documents-page__pagination-page { color: #b0b0b0; }
html.dark-theme .documents-page__select { background: #2d2d2d; color: #e0e0e0; }
html.dark-theme .documents-page__row-loading td,
html.dark-theme .documents-page__row-empty td { color: #999; }

/* Notifications page */
html.dark-theme .notifications-page__title { color: #e0e0e0; }
html.dark-theme .notifications-page__subtitle { color: #b0b0b0; }
html.dark-theme .notifications-page__loading,
html.dark-theme .notifications-page__empty { color: #999; }
html.dark-theme .notifications-page__list-wrap { background: #2d2d2d; border-color: #444; }
html.dark-theme .notifications-page__item { border-color: #444; color: #e0e0e0; }
html.dark-theme .notifications-page__item--read { background: #252525; color: #888; }
html.dark-theme .notifications-page__item-type { color: #64b5f6; }
html.dark-theme .notifications-page__item-date { color: #888; }

/* Dark theme: Audit log */
html.dark-theme .audit-page__title { color: #e0e0e0; }
html.dark-theme .audit-page__subtitle { color: #b0b0b0; }
html.dark-theme .audit-page__forbidden,
html.dark-theme .audit-page__loading { color: #999; }
html.dark-theme .audit-page__table-wrap { background: #2d2d2d; border-color: #444; }
html.dark-theme .audit-page__table th { background: #3d3d3d; color: #ccc; }
html.dark-theme .audit-page__table td { border-color: #444; color: #e0e0e0; }
html.dark-theme .audit-page__row-empty td { color: #888; }

/* Dark theme: Reports */
html.dark-theme .reports-page__title { color: #e0e0e0; }
html.dark-theme .reports-page__subtitle { color: #b0b0b0; }
html.dark-theme .reports-page__btn--secondary { background: #3d3d3d; color: #e0e0e0; border-color: #555; }
html.dark-theme .reports-page__loading { color: #999; }
html.dark-theme .reports-page__section-title { color: #e0e0e0; }
html.dark-theme .reports-page__card { background: #2d2d2d; border-color: #444; }
html.dark-theme .reports-page__card-value { color: #e0e0e0; }
html.dark-theme .reports-page__card-label { color: #b0b0b0; }
html.dark-theme .reports-page__table-wrap { background: #2d2d2d; border-color: #444; }
html.dark-theme .reports-page__table th { background: #3d3d3d; color: #ccc; }
html.dark-theme .reports-page__table td { border-color: #444; color: #e0e0e0; }
html.dark-theme .reports-page__total,
html.dark-theme .reports-page__bar-label,
html.dark-theme .reports-page__bar-value { color: #e0e0e0; }
html.dark-theme .reports-page__bar-track { background: #3d3d3d; }
html.dark-theme .reports-page__no-data { color: #888; }

/* Dark theme: Trailers */
html.dark-theme .trailers-page__title { color: #e0e0e0; }
html.dark-theme .trailers-page__subtitle { color: #b0b0b0; }
html.dark-theme .trailers-page__search { background: #2d2d2d; border-color: #555; color: #e0e0e0; }
html.dark-theme .trailers-page__autocomplete { background: #2d2d2d; border-color: #555; }
html.dark-theme .trailers-page__autocomplete-item { color: #e0e0e0; }
html.dark-theme .trailers-page__autocomplete-item:hover { background: #3d3d3d; }
html.dark-theme .trailers-page__table-wrap { background: #2d2d2d; border-color: #444; }
html.dark-theme .trailers-page__table th { background: #3d3d3d; color: #ccc; }
html.dark-theme .trailers-page__table td { border-color: #444; color: #e0e0e0; }
html.dark-theme .trailers-page__row-loading td, html.dark-theme .trailers-page__row-empty td { color: #888; }
html.dark-theme .trailers-page__drawer { background: #2d2d2d; }
html.dark-theme .trailers-page__drawer-title, html.dark-theme .trailers-page__label { color: #e0e0e0; }
html.dark-theme .trailers-page__input { background: #2d2d2d; border-color: #555; color: #e0e0e0; }
html.dark-theme .trailers-page__dialog { background: #2d2d2d; color: #e0e0e0; }
html.dark-theme .trailers-page__pagination-label, html.dark-theme .trailers-page__pagination-showing, html.dark-theme .trailers-page__pagination-page { color: #b0b0b0; }
html.dark-theme .trailers-page__select { background: #2d2d2d; color: #e0e0e0; border-color: #555; }
</style>
