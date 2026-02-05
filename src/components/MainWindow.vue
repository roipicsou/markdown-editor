  <script setup>
import { ref, computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useSettings } from '../composables/useSettings';

// Récupération des settings partagés
const { settings } = useSettings();

const markdownText = ref('# Hello World');
const currentFilePath = ref(null);
const fileName = computed(() => currentFilePath.value ? currentFilePath.value.split(/[\\/]/).pop() : 'Nouveau');

const htmlPreview = computed(() => DOMPurify.sanitize(marked.parse(markdownText.value)));

// --- FILE LOGIC ---
async function openFile() {
  try {
    const selected = await open({ filters: [{ name: 'Markdown', extensions: ['md'] }] });
    if (selected) {
      markdownText.value = await readTextFile(selected);
      currentFilePath.value = selected;
    }
  } catch (e) { console.error(e); }
}

async function saveFile() {
  try {
    let path = currentFilePath.value || await save({ filters: [{ name: 'Markdown', extensions: ['md'] }] });
    if (path) {
      await writeTextFile(path, markdownText.value);
      currentFilePath.value = path;
    }
  } catch (e) { console.error(e); }
}

// --- WINDOW LOGIC ---
// Dans src/components/MainWindow.vue

async function openSettings() {
  const label = 'settings';
  
  // 1. On vérifie si elle existe déjà
  const existing = await WebviewWindow.getByLabel(label);
  if (existing) {
    await existing.setFocus();
    return;
  }

  // 2. On la crée
  const webview = new WebviewWindow(label, {
    // Utilise 'index.html' explicitement pour éviter les erreurs de chemin
    url: 'index.html?window=settings', 
    title: 'Paramètres',
    width: 400,
    height: 350,
    resizable: false,
    alwaysOnTop: true
  });

  // 3. Petit debug pour voir si ça marche
  webview.once('tauri://created', function () {
    console.log('Fenêtre Paramètres créée avec succès');
  });
  
  webview.once('tauri://error', function (e) {
    console.error('Erreur création fenêtre:', e);
  });
}
</script>

<template>
  <div class="main-layout">
    <nav class="navbar">
      <div class="brand"><div class="logo">M</div> {{ fileName }}</div>
      <div class="actions">
        <button @click="openSettings">⚙️</button>
        <span class="sep"></span>
        <button @click="openFile">📂</button>
        <button @click="saveFile" class="primary">💾</button>
      </div>
    </nav>

    <main class="workspace">
      <textarea 
        class="pane editor" 
        v-model="markdownText" 
        :class="{ 'wrap': settings.wordWrap }"
        spellcheck="false"
      ></textarea>
      <div class="pane preview markdown-body" v-html="htmlPreview"></div>
    </main>
  </div>
</template>

<style scoped>
.navbar { height: 60px; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; border-bottom: 1px solid var(--border); background: var(--bg-sidebar); }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.logo { width: 30px; height: 30px; background: var(--accent); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; }
.actions { display: flex; gap: 10px; align-items: center; }
.sep { width: 1px; height: 20px; background: var(--border); margin: 0 5px; }

button { padding: 8px 12px; border-radius: 6px; background: transparent; border: 1px solid var(--border); color: white; transition: 0.2s; }
button:hover { background: var(--border); }
button.primary { background: var(--accent); border-color: var(--accent); }

.workspace { display: flex; height: calc(100vh - 60px); }
.pane { flex: 1; height: 100%; padding: 30px; overflow-y: auto; }
.editor { background: var(--bg-input); color: var(--text-main); border: none; resize: none; border-right: 1px solid var(--border); font-family: 'Fira Code', monospace; font-size: var(--editor-font-size); white-space: pre; }
.editor.wrap { white-space: pre-wrap; }
.preview { background: var(--bg-app); color: #e2e8f0; }

/* Markdown Styles simplifiés */
:deep(h1) { border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
:deep(pre) { background: #1e293b; padding: 15px; border-radius: 6px; }
:deep(code) { font-family: 'Fira Code', monospace; }
</style>