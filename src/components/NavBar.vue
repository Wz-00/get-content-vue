<template>
  <div class="container-fluid">
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid mx-4">
        <a class="navbar-brand" href="/">
          <img :src="logoSrc" alt="logo" />
        </a>

        <ul class="navbar-nav">
          <li class="nav-item"><router-link to="/youtube" class="link">YouTube Downloader</router-link></li>
          <li class="nav-item"><router-link to="/tiktok" class="link">TikTok Downloader</router-link></li>
          <li class="nav-item"><router-link to="/instagram" class="link">Instagram Downloader</router-link></li>
          <li class="nav-item"><router-link to="/facebook" class="link">Facebook Downloader</router-link></li>
        </ul>

        <div class="d-flex justify-content-end align-items-center">
          <button
            type="button"
            class="switch"
            @click="toggle"
            :aria-pressed="isDark"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @keydown.space.prevent="toggle"
            @keydown.enter.prevent="toggle"
          >
            <iconify-icon icon="material-symbols:dark-mode" aria-hidden="true"></iconify-icon>
            <iconify-icon icon="material-symbols:light-mode" aria-hidden="true"></iconify-icon>
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';

const THEME_KEY = 'user-theme';
const className = 'darkmode';

const isDark = ref(false);

// read saved preference or system preference
function readInitial() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}

function applyClass(dark) {
  if (dark) document.body.classList.add(className);
  else document.body.classList.remove(className);
}

function persist(dark) {
  try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (e) {}
}

function toggle() {
  isDark.value = !isDark.value;
}

// choose logo path based on isDark
// prefer filenames without parentheses; rename your file if possible to "logo-white.png"
const lightLogo = '/logo.png';
const darkLogo = '/logo(white).png'; // or '/logo(white).png' if you insist

const logoSrc = computed(() => (isDark.value ? darkLogo : lightLogo));

// preload both logos to avoid flicker
function preload(src) {
  try {
    const img = new Image();
    img.src = src;
  } catch (e) {}
}

let mediaListener = null;
onMounted(() => {
  // initial theme
  isDark.value = readInitial();
  applyClass(isDark.value);

  // preload logos
  preload(lightLogo);
  preload(darkLogo);

  // if user hasn't explicitly chosen, listen to system change
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (!saved && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mediaListener = (e) => {
        const stillSaved = localStorage.getItem(THEME_KEY);
        if (!stillSaved) {
          isDark.value = e.matches;
        }
      };
      mq.addEventListener ? mq.addEventListener('change', mediaListener) : mq.addListener(mediaListener);
    }
  } catch(e){}
});

watch(isDark, (val) => {
  applyClass(val);
  persist(val);
});

onBeforeUnmount(() => {
  try {
    if (mediaListener && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.removeEventListener ? mq.removeEventListener('change', mediaListener) : mq.removeListener(mediaListener);
    }
  } catch (e) {}
});
</script>

<style scoped>
.navbar {
  position: fixed;
  width: 100%;
  z-index: 9;
  margin: 1rem 0;
  top: -2px;
  background-color: var(--page-bg);
  transition: background-color .15s ease;
}
.navbar .container-fluid {
  background-color: var(--card-bg);
  padding: 1rem;
  border-radius: 24px;
  box-shadow: 0px 0px 9px 2px rgba(0,0,0,0.06);
}
.link {
  color: var(--text);
}
.link:hover {
  color: var(--accent);
  transform: scale(1.05);
}
.navbar .container-fluid .navbar-brand img {
  height: 100%;
  max-height: 40px;
}
.navbar .container-fluid .navbar-nav a {
  font-size: calc( 0.9rem + 0.3vh);
}
.navbar .container-fluid .navbar-brand,
.navbar .container-fluid .navbar-nav a {
  text-decoration: none;
  margin: 0 1rem;
}

/* switch */
.switch {
  border-radius: 50%;
  border: none;
  background-color: var(--toggle-bg);
  height: 50px;
  width: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  position: relative;
  outline: none;
}
.switch iconify-icon {
  font-size: 22px;
  color: var(--text);
  opacity: .95;
  transition: opacity .12s ease, transform .12s ease;
}
.switch iconify-icon:last-child { display: none; }

/* when body has .darkmode, show light icon instead (your previous CSS) */
.darkmode .switch iconify-icon:first-child { display: none; }
.darkmode .switch iconify-icon:last-child { display: block; }

/* small focus styles */
.switch:focus {
  outline: 3px solid rgba(100,100,255,0.12);
  outline-offset: 2px;
}
</style>
