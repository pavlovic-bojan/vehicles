import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, QBtn, QCard, QCardSection, QCheckbox, QForm, QIcon, QInput, QLayout, QPageContainer, QSeparator, QSpace, QToolbar, QToolbarTitle, QSelect } from 'quasar';
import quasarLang from 'quasar/lang/en-US';
import 'quasar/dist/quasar.css';
import '@quasar/extras/material-icons/material-icons.css';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import { router } from './router';
import { api } from './boot/axios';
import en from './locales/en/index.json';
import srLat from './locales/sr-lat/index.json';
import srCyr from './locales/sr-cyr/index.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, 'sr-lat': srLat, 'sr-cyr': srCyr },
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Quasar, {
  plugins: {},
  lang: quasarLang,
  components: {
    QBtn,
    QCard,
    QCardSection,
    QCheckbox,
    QForm,
    QIcon,
    QInput,
    QLayout,
    QPageContainer,
    QSeparator,
    QSpace,
    QToolbar,
    QToolbarTitle,
    QSelect,
  },
});
app.provide('api', api);
app.mount('#q-app');
