<script setup>
import { computed } from 'vue';
import MainWindow from './components/MainWindow.vue';
import SettingsWindow from './components/SettingsWindow.vue';
import { useSettings } from './composables/useSettings';
import './assets/main.css'; // Import du CSS global

// On initialise les settings ici pour avoir la taille de police tout de suite
const { settings } = useSettings();

// Détection simple de l'URL
const isSettings = computed(() => new URLSearchParams(window.location.search).get('window') === 'settings');
</script>

<template>
  <div class="app-root" :style="{ '--editor-font-size': settings.fontSize + 'px' }">
    <SettingsWindow v-if="isSettings" />
    <MainWindow v-else />
  </div>
</template> 