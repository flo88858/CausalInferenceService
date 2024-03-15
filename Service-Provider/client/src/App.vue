<template>
  <main class="flex flex-col h-screen overflow-y-scroll no-scrollbar">
    <Navbar />
    <router-view class="flex flex-grow bg-gradient-to-br from-rose-800 to-indigo-800" />
  </main>
</template>
<script>
import Navbar from './components/Navbar.vue'
export default {
  components: { Navbar }
}
</script>

<style >
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>