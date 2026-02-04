<script setup>
import { ref, computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

const markdownText = ref("");
const currentFilePath = ref(null);
const fileName = computed(() => currentFilePath.value ? currentFilePath.value.split(/[\\/]/).pop() : 'Nouveau Fichier');

const htmlPreview = computed(() => {
  return DOMPurify.sanitize(marked.parse(markdownText.value));
});

async function openFile() {
  try {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
    });
    if (selected) {
      markdownText.value = await readTextFile(selected);
      currentFilePath.value = selected;
    }
  } catch (err) { console.error(err); }
}

async function saveFile() {
  try {
    let savePath = currentFilePath.value;
    if (!savePath) {
      savePath = await save({ filters: [{ name: 'Markdown', extensions: ['md'] }] });
    }
    if (savePath) {
      await writeTextFile(savePath, markdownText.value);
      currentFilePath.value = savePath;
    }
  } catch (err) { console.error(err); }
}
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="brand">
        <div class="logo-icon">M</div>
        <span class="filename">{{ fileName }}</span>
      </div>
      
      <div class="actions">
        <button @click="openFile" title="Ouvrir un fichier">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
        </button>
        <button @click="saveFile" class="primary-btn" title="Sauvegarder">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>Sauvegarder</span>
        </button>
      </div>
    </nav>

    <main class="workspace">
      <section class="editor-pane">
        <textarea 
          v-model="markdownText" 
          placeholder="Commencez à écrire..." 
          spellcheck="false"
        ></textarea>
      </section>

      <section class="preview-pane">
        <div class="markdown-body" v-html="htmlPreview"></div>
      </section>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@400;600&display=swap');

:root {
  --bg-app: #0f172a;
  --bg-sidebar: #1e293b;
  --bg-input: #0f172a;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --border: #334155;
  --glass: rgba(15, 23, 42, 0.8);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  overflow: hidden; 
}

/* Scrollbars */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Navbar */
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
  background: var(--glass);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand { display: flex; align-items: center; gap: 12px; }
.logo-icon {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; font-family: 'Fira Code', monospace;
}
.filename { font-size: 14px; font-weight: 600; color: var(--text-muted); }

.actions { display: flex; gap: 12px; }
button {
  background: transparent; border: 1px solid var(--border); color: var(--text-main);
  padding: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
button:hover { background-color: var(--border); }
.primary-btn {
  background-color: var(--accent); border-color: var(--accent);
  padding: 8px 16px; gap: 8px; font-weight: 500;
}
.primary-btn:hover { background-color: var(--accent-hover); }

/* Workspace */
.workspace {
  flex: 1;
  display: flex;
  overflow: hidden; /* Important : empêche le scroll global */
}

/* --- Éditeur (Correction Scroll) --- */
.editor-pane {
  flex: 1;
  height: 100%;
  border-right: 1px solid var(--border);
  background-color: var(--bg-input);
  overflow: hidden; /* Empêche le conteneur de scroller */
}

textarea {
  width: 100%;
  height: 100%;
  padding: 30px; /* Le padding est dans le textarea pour que le scroll soit joli */
  background: transparent;
  border: none;
  color: var(--text-main);
  font-family: 'Fira Code', monospace;
  font-size: 15px;
  line-height: 1.6;
  outline: none;
  resize: none;
  overflow-y: auto; /* Seul le textarea scroll */
}

/* --- Prévisualisation --- */
.preview-pane {
  flex: 1;
  height: 100%;
  background-color: var(--bg-app);
  color: #e2e8f0;
  padding: 30px; /* Ici on garde le padding sur le container */
  overflow-y: auto; /* Et c'est le container qui scroll */
}

/* Styles Markdown */
.markdown-body h1, .markdown-body h2, .markdown-body h3 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; color: #fff; }
.markdown-body h1 { font-size: 2em; border-bottom: 1px solid var(--border); padding-bottom: .3em; }
.markdown-body p { margin-bottom: 16px; line-height: 1.7; color: #cbd5e1; }
.markdown-body a { color: var(--accent); text-decoration: none; }
.markdown-body blockquote { padding: 0 1em; color: var(--text-muted); border-left: .25em solid var(--border); margin-bottom: 16px; }
.markdown-body code { padding: .2em .4em; margin: 0; font-size: 85%; background-color: rgba(110, 118, 129, 0.4); border-radius: 6px; font-family: 'Fira Code', monospace; }
.markdown-body pre { padding: 16px; overflow: auto; line-height: 1.45; background-color: #161b22; border-radius: 6px; margin-bottom: 16px; }
.markdown-body pre code { background-color: transparent; padding: 0; }
.markdown-body ul, .markdown-body ol { padding-left: 2em; margin-bottom: 16px; }
.markdown-body hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: var(--border); border: 0; }
</style>