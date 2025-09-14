<template>
  <div class="format-selector" @keyup.esc="close" ref="root">
    <!-- toggle harus type="button" -->
    <button type="button" class="toggle" @click="toggle" :aria-expanded="open">
      {{ labelFor(local) }}
      <span class="chev">▾</span>
    </button>

    <transition name="fade">
      <div v-if="open" class="dropdown-panel" ref="panel" role="menu">
        <div class="cols">
          <div class="col">
            <div class="group-label">Audio</div>
            <ul class="options" role="list">
              <li v-for="opt in audio" :key="`a-${opt.value}`" role="none">
                <!-- opsi juga harus type="button" -->
                <button type="button" class="opt" :class="{ selected: local === opt.value }"
                        @click="select(opt.value)" role="menuitem">
                  {{ opt.label }}
                </button>
              </li>
            </ul>
          </div>

          <div class="col">
            <div class="group-label">Video</div>
            <ul class="options" role="list">
              <li v-for="opt in video" :key="`v-${opt.value}`" role="none">
                <!-- opsi juga harus type="button" -->
                <button type="button" class="opt" :class="{ selected: local === opt.value }"
                        @click="select(opt.value)" role="menuitem">
                  {{ opt.label }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  selected: { type: String, default: '720' }
});
const emit = defineEmits(['update:selected']);

const video = [
  { value: '144', label: 'MP4 (144p)' },
  { value: '240', label: 'MP4 (240p)' },
  { value: '360', label: 'MP4 (360p)' },
  { value: '480', label: 'MP4 (480p)' },
  { value: '720', label: 'MP4 (720p)' },
  { value: '1080', label: 'MP4 (1080p)' },
  { value: '1440', label: 'MP4 (1440p)' }
];

const audio = [
  { value: 'mp3', label: 'MP3' },
  { value: 'm4a', label: 'M4A' },
  { value: 'aac', label: 'AAC' },
  { value: 'wav', label: 'WAV' }
];

const local = ref(props.selected);
const open = ref(false);
const panel = ref(null);
const root = ref(null);

watch(() => props.selected, v => { if (v !== local.value) local.value = v; });
watch(local, v => emit('update:selected', v));

function toggle() { open.value = !open.value; }
function close() { open.value = false; }
function select(val) {
  local.value = val;
  close();
}

function onDocClick(e) {
  if (!root.value) return;
  if (!root.value.contains(e.target)) close();
}

onMounted(() => {
  document.addEventListener('click', onDocClick);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
});

function labelFor(val) {
  const found = video.concat(audio).find(x => x.value === val);
  return found ? found.label : val;
}
</script>

<style scoped>
/* ... tetap seperti style yang Anda miliki ... */
.format-selector { position: relative; display: inline-block; min-width: 135px; }
.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 10px;
  height: 34px;
  border-radius: 10px;
  background: blue;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.chev { margin-left: 8px; opacity: .9; }
.fade-enter-active, .fade-leave-active { transition: opacity .12s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  background: var(--card-bg);
  color: var(--text);
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.6);
  padding: 12px;
  width: 280px;
  min-width: 220px;
}
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.group-label { font-size: 13px; color: var(--text); margin-bottom: 6px; font-weight: 700; }
.options { list-style: none; padding: 0; margin: 0; }
.opt { width: 100%; text-align: left; background: transparent; border: none; padding: 6px 4px; font-size: 13px; color: inherit; cursor: pointer; border-radius: 6px; }
.opt:hover { background: rgba(255,255,255,0.03); }
.selected { color: #E3589C; font-weight: 700; }
@media (max-width: 420px) {
  .dropdown-panel { right: 0; left: 0; width: auto; margin: 0 8px; }
  .cols { grid-template-columns: 1fr; }
}
</style>
