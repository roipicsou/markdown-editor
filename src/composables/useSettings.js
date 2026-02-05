// src/composables/useSettings.js
import { reactive, watch, onMounted } from 'vue';
import { listen, emit } from '@tauri-apps/api/event';

// État global réactif
const settings = reactive({
  fontSize: 15,
  wordWrap: false
});

export function useSettings() {
  
  // Charger et Écouter
  onMounted(async () => {
    // 1. Lire localStorage
    const saved = localStorage.getItem('editor-settings');
    if (saved) Object.assign(settings, JSON.parse(saved));

    // 2. Écouter les événements Tauri (venant de l'autre fenêtre)
    await listen('settings-changed', (event) => {
      Object.assign(settings, event.payload);
    });
  });

  // Sauvegarder et Diffuser
  watch(settings, async (newSettings) => {
    localStorage.setItem('editor-settings', JSON.stringify(newSettings));
    await emit('settings-changed', newSettings);
  });

  return { settings };
}