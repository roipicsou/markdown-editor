<script setup>
import { ref, computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useSettings } from '../composables/useSettings';
import { Codemirror } from 'vue-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
const { settings } = useSettings();

const markdownText = ref('# Hello World');
const currentFilePath = ref(null);
const fileName = computed(() => currentFilePath.value ? currentFilePath.value.split(/[\\/]/).pop() : 'Nouveau');

const htmlPreview = computed(() => DOMPurify.sanitize(marked.parse(markdownText.value)));

// --- CONFIGURATION CODEMIRROR ---
const extensions = computed(() => {
  const exts = [markdown(), oneDark];
  if (settings.wordWrap) {
    exts.push(EditorView.lineWrapping);
  }
  
  return exts;
});

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
async function openSettings() {
  const label = 'settings';
  const existing = await WebviewWindow.getByLabel(label);
  if (existing) {
    await existing.setFocus();
    return;
  }

  const webview = new WebviewWindow(label, {
    url: 'index.html?window=settings', 
    title: 'Paramètres',
    width: 400,
    height: 350,
    resizable: false,
    alwaysOnTop: true
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
      <div class="pane editor-container">
        <Codemirror
          v-model="markdownText"
          :extensions="extensions"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :style="{ fontSize: settings.fontSize + 'px', height: '100%' }"
        />
      </div>

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

.pane { flex: 1; height: 100%; overflow-y: auto; }
.preview { padding: 30px; background: var(--bg-app); color: #e2e8f0; }

.editor-container {
  border-right: 1px solid var(--border);
  background: var(--bg-input); 
  overflow: hidden; 
}

:deep(.cm-editor) {
  height: 100%;
  background-color: var(--bg-input);
}
:deep(.cm-scroller) {
  font-family: 'Fira Code', monospace;
}
:deep(.cm-gutters) {
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  color: #64748b;
}

/* Markdown Styles simplifiés */
:deep(h1) { border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
:deep(pre) { background: #1e293b; padding: 15px; border-radius: 6px; }
:deep(code) { font-family: 'Fira Code', monospace; }
</style>