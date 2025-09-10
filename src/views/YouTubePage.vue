<template>
  <div class="content d-flex align-items-center">
    <div class="dl w-100">
      <div class="head mb-4 text-center">
        <h1>Youtube Downloader</h1>
        <p class="text-muted">Download Youtube Video or Audio — pilih format sebelum cari</p>
      </div>

      <div class="input-group">
        <form @submit.prevent="onSearch" class="mb-3 d-flex gap-2 align-items-center">
          <input v-model="url" type="text" placeholder="Paste Url here..." id="findurl" />
          <format-selector v-model:selected="selectedRes" />
          <button type="submit" class="find d-flex align-items-center" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Search
            <iconify-icon icon="line-md:search-twotone" class="ms-2" ></iconify-icon>
          </button>
        </form>
      </div>

      <div v-if="videoInfo" class="mt-3">
        <div class="url-info p-3">
          <div class="d-flex gap-3">
            <img :src="videoInfo.thumbnail" alt="" style="max-width:180px; object-fit:cover" />
            <div style="flex:1">
              <h5>{{ videoInfo.title }}</h5>
              <p class="text-muted">Durasi: {{ formatDuration(videoInfo.duration) }}</p>
              <p class="mb-2">Requested: {{ displayRequested }}</p>

              <!-- Progress bar / status -->
              <div v-if="isQueuedOrProcessing" class="mt-2">
                <div class="small text-muted mb-1">Status: {{ jobStateLabel }}</div>
                <div class="progress" style="height:10px; border-radius:6px; overflow:hidden;">
                  <div class="progress-bar" :style="{ width: progress + '%' }"></div>
                </div>
                <div class="small text-muted mt-1">{{ progress }}% complete</div>
              </div>

              <!-- Download button shown only when ready -->
              <div v-if="downloadUrl" class="mt-3">
                <button class="btn btn-success" @click="triggerDownload">Download File</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import FormatSelector from '@/components/FormatSelector.vue';
import { fetchInfo, postDownload, getJobStatus } from '@/services/api';

const url = ref('');
const loading = ref(false);
const videoInfo = ref(null);
const selectedRes = ref('720');
const jobId = ref(null);
const progress = ref(0);
const downloadUrl = ref(null);
const jobState = ref(null);
let pollTimer = null;

function formatDuration(s){
  if(!s) return '-';
  const sec = Number(s);
  const h = Math.floor(sec/3600);
  const m = Math.floor((sec%3600)/60);
  const ss = sec%60;
  return (h?`${h}:`:'') + `${h?String(m).padStart(2,'0'):m}:${String(ss).padStart(2,'0')}`;
}

const displayRequested = computed(() => {
  return (String(selectedRes.value).match(/^\d+$/) ? `MP4 (${selectedRes.value}p)` : String(selectedRes.value).toUpperCase());
});

function triggerDownload() {
  if (!downloadUrl.value) return;

  // Create an anchor element and click it programmatically.
  // Using download attribute might be ignored for cross-origin urls,
  // but here the endpoint is same-origin, and res.download sets filename header.
  const a = document.createElement('a');
  a.href = downloadUrl.value;
  // a.download = ''; // optional. If server sets Content-Disposition, browser will use that filename.
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}


const isQueuedOrProcessing = computed(() => {
  return jobId.value && (!downloadUrl.value) && (jobState.value !== 'failed');
});

const jobStateLabel = computed(() => {
  if (!jobState.value) return 'queued';
  return jobState.value;
});

function pickBestFormat(formats, desired) {
  // same robust pickBestFormat from previous message (video or audio)
  console.log('Available formats (sample):', (formats || []).slice(0,8));
  if (!Array.isArray(formats) || formats.length === 0) return null;

  const norm = (formats || []).map(f => {
    const itag = String(f.format_id ?? f.itag ?? f.format ?? '');
    const extRaw = (f.ext ?? f.container ?? (f.mimeType ? String(f.mimeType).split('/')[1] : null) ?? '');
    const ext = String(extRaw).toLowerCase();
    const qualityLabel = f.qualityLabel ?? (f.format_note ?? (f.height ? `${f.height}p` : null)) ?? '';
    const height = f.height || (qualityLabel ? Number((String(qualityLabel).match(/\d+/) || [NaN])[0]) : null);
    const hasVideo = (typeof f.hasVideo === 'boolean') ? f.hasVideo : !!(f.vcodec && String(f.vcodec) !== 'none');
    const hasAudio = (typeof f.hasAudio === 'boolean') ? f.hasAudio : !!(f.acodec && String(f.acodec) !== 'none');
    return { raw: f, itag, ext, qualityLabel, hasVideo, hasAudio, height };
  });

  const desiredNum = Number(desired);
  const isVideoRequest = !Number.isNaN(desiredNum);

  if (!isVideoRequest) {
    const audioExt = String(desired).toLowerCase();
    let candidates = norm.filter(n => n.hasAudio && n.ext === audioExt);
    if (candidates.length) return candidates[0];
    const anyAudio = norm.filter(n => n.hasAudio);
    return anyAudio[0] || null;
  } else {
    const targetHeight = desiredNum;
    let mp4Candidates = norm.filter(n => n.ext === 'mp4' && n.hasVideo);
    let exact = mp4Candidates.find(n => n.height === targetHeight);
    if (exact) return exact;
    let preferred = mp4Candidates
      .filter(n => n.height && n.height <= targetHeight)
      .sort((a,b) => {
        const aa = (b.hasAudio?1:0) - (a.hasAudio?1:0);
        if (aa !== 0) return aa;
        return (b.height||0) - (a.height||0);
      })[0];
    if (preferred) return preferred;
    mp4Candidates = mp4Candidates.sort((a,b) => {
      const da = Math.abs((a.height||0) - targetHeight);
      const db = Math.abs((b.height||0) - targetHeight);
      if (da !== db) return da - db;
      return (b.hasAudio?1:0) - (a.hasAudio?1:0);
    });
    if (mp4Candidates.length) return mp4Candidates[0];
    const anyVideo = norm.filter(n => n.hasVideo).sort((a,b) => (b.hasAudio?1:0) - (a.hasAudio?1:0) || (b.height||0)-(a.height||0))[0];
    return anyVideo || null;
  }
}

async function startPolling(job) {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    try {
      const s = await getJobStatus(job);
      if (!s || !s.status) return;
      jobState.value = s.state;
      progress.value = Number(s.progress || 0);
      // if result available, set downloadUrl and stop polling
      if (s.result && s.result.downloadUrl) {
        downloadUrl.value = s.result.downloadUrl;
        clearInterval(pollTimer);
        pollTimer = null;
      }
      // if failed
      if (s.state === 'failed') {
        clearInterval(pollTimer);
        pollTimer = null;
        Swal.fire('Job Failed', 'Merge gagal. Cek server logs.', 'error');
      }
    } catch (e) {
      console.error('poll err', e);
    }
  }, 2000);
  // run first poll immediately
  try {
    const s = await getJobStatus(job);
    jobState.value = s.state;
    progress.value = Number(s.progress || 0);
    if (s.result && s.result.downloadUrl) {
      downloadUrl.value = s.result.downloadUrl;
      clearInterval(pollTimer);
      pollTimer = null;
    }
  } catch (e) { console.error(e); }
}

async function onSearch(){
  if(!url.value || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url.value)){
    await Swal.fire('Invalid URL','Masukkan URL YouTube yang valid','warning');
    return;
  }
  loading.value = true;
  videoInfo.value = null;
  jobId.value = null;
  progress.value = 0;
  downloadUrl.value = null;
  jobState.value = null;

  try{
    const resp = await fetchInfo(url.value);
    if(!resp || !resp.status) throw new Error(resp?.message || 'Gagal mengambil info');
    videoInfo.value = resp.data;

    const chosen = pickBestFormat(resp.data.formats, selectedRes.value);
    console.log('Chosen format:', chosen);
    if(!chosen){
      await Swal.fire('Format tidak ditemukan','Tidak menemukan format MP4 sesuai permintaan','error');
      loading.value = false;
      return;
    }

    // enqueue job
    const filename = (resp.data.title || 'video').replace(/[^\w\-_. ]+/g,'_');
    const q = await postDownload(url.value, chosen.itag, filename, 'mp4');
    if(!q || !q.status) throw new Error(q?.message || 'Gagal enqueue job');

    jobId.value = q.jobId;
    // start polling for status/progress
    startPolling(jobId.value);

  } catch(err){
    console.error(err);
    Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
    .content {
        min-height: 100vh;
    }
    .content .dl {
        width: 100%;
    }
    .input-group {
        background-color: white;
        padding: 0 1rem;
        border-radius: 24px;
        box-shadow: 0px 0px 9px 2px rgba(0,0,0,0.1);
    }
    .input-group form{
        display: flex;
        flex-direction: row;
        width: 100%;
    }
    .find {
      background-color: blue;
      color: white;
      border: none;
      padding: 6px 10px;
      height: 34px;
      border-radius: 10px;
      font-weight: 600;
    }
    .input-group input[type=text] {
        border: none;
        width: inherit;
        height: 108px;
        outline: none;
    }
    .url-info {
        background-color: white;
        padding: 1rem;
        border-radius: 16px;
        box-shadow: 0px 0px 9px 2px rgba(0,0,0,0.1);
    }
</style>