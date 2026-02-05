<script setup>
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useSettings } from '../composables/useSettings';

const { settings } = useSettings();

function closeWindow() {
  getCurrentWindow().close();
}
</script>

<template>
  <div class="settings-container">
    <h2>Préférences</h2>

    <div class="setting-group">
      <label>Taille de police ({{ settings.fontSize }}px)</label>
      <input type="range" v-model="settings.fontSize" min="12" max="32">
    </div>

    <div class="setting-group">
      <label>Retour à la ligne</label>
      <div class="toggle-wrapper">
        <label>
          <input type="checkbox" v-model="settings.wordWrap">
          {{ settings.wordWrap ? 'Activé' : 'Désactivé' }}
        </label>
      </div>
    </div>

    <button @click="closeWindow" class="close-btn">Fermer</button>
  </div>
</template>

<style scoped>
.settings-container { padding: 20px; background: var(--bg-sidebar); height: 100vh; display: flex; flex-direction: column; }
h2 { margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
.setting-group { margin-bottom: 25px; display: flex; flex-direction: column; gap: 10px; }
input[type="range"] { width: 100%; accent-color: var(--accent); }
.close-btn { margin-top: auto; width: 100%; padding: 12px; background: var(--accent); color: white; border-radius: 6px; font-weight: bold; }
.close-btn:hover { background: var(--accent-hover); }
</style>