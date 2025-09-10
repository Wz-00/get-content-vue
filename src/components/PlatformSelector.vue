<template>
  <div class="platform-selector">
    <label class="form-label">Platform</label>
    <div class="sel-wrap d-flex align-items-center">
      <select v-model="local" class="form-select form-select-sm" @change="emitChange">
        <option value="auto">Auto (deteksi dari URL)</option>
        <option value="youtube">YouTube</option>
        <option value="tiktok">TikTok</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  selected: { type: String, default: 'auto' }
});
const emit = defineEmits(['update:selected']);
const local = ref(props.selected);

watch(() => props.selected, v => { if (v !== local.value) local.value = v; });
function emitChange() { emit('update:selected', local.value); }
</script>

<style scoped>
.platform-selector { min-width: 180px; }
.form-select-sm { height: 34px; padding: 0.2rem 0.6rem; border-radius: 8px; }
.sel-wrap { width: 220px; }
@media (max-width: 540px) { .sel-wrap { width: 140px; } }
</style>
