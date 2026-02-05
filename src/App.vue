<script setup>
import { computed } from 'vue';
import MainWindow from './components/MainWindow.vue';
import SettingsWindow from './components/SettingsWindow.vue';
import { useSettings } from './composables/useSettings';
import './assets/main.css'; // Import du CSS global

// On initialise les settings ici pour avoir la taille de police tout de suite
const { settings } = useSettings();

// On lit ce qu'il y a après le "?" dans l'URL
const params = new URLSearchParams(window.location.search);
const windowType = params.get('window'); // ex: 'settings' ou null

// Si 'settings', on affiche SettingsWindow, sinon MainWindow
const isSettings = computed(() => windowType === 'settings');
</script>

<template>
  <div class="app-root" :style="{ '--editor-font-size': settings.fontSize + 'px' }">
    <SettingsWindow v-if="isSettings" />
    <MainWindow v-else />
  </div>
</template> 