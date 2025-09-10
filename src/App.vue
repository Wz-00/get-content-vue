<template>
  <ion-app>
    <NavBar />
    <main class="container mt-4">
      <router-view />
    </main>
    <app-footer />
  </ion-app>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/AppFooter.vue'

export default {
  components: { NavBar, AppFooter: Footer }
}
</script>
