<template>
  <nav class="z-50 w-full sticky top-0 bg-gray-800 p-2">
    <div class="flex justify-between items-center text-gray-200 text-lg">
      <img class="w-64" src="./icons/StolenGAIALogopng.png" alt="" />
      <ul class="flex flex-row xl:space-x-12 space-x-6">
        <li
          :class="{
            'text-blue-400 border-b-2 border-blue-400 ': routeName === 'Home'
          }"
        >
          <router-link to="/">Home</router-link>
        </li>
        <li
          :class="{
            'text-blue-400 border-b-2 border-blue-400 ': routeName === 'Results'
          }"
        >
          <router-link to="/results">Results</router-link>
        </li>
        <li
          :class="{
            'text-blue-400 border-b-2 border-blue-400 ': routeName === 'Catalog'
          }"
        >
          <router-link to="/catalog">Catalog</router-link>
        </li>
        <li
          :class="{
            'text-blue-400 border-b-2 border-blue-400 ': routeName === 'Agreements'
          }"
        >
          <router-link to="/agreements">Agreements</router-link>
        </li>
        <li
          :class="{
            'text-blue-400 border-b-2 border-blue-400 ': routeName === 'Upload'
          }"
        >
          <router-link to="/upload">Upload</router-link>
        </li>
        <li
          :class="{
            'text-blue-400 border-b-2 border-blue-400 ': routeName === 'Info'
          }"
        >
          <router-link to="/info">Info</router-link>
        </li>
      </ul>
      <div class="w-64 text-right">
        <a href="http://localhost:8001/redirect_uri?logout=http://localhost:8001/public/logout.html"
          >Logout</a
        >
      </div>
    </div>
  </nav>
</template>


<script>
export default {
  computed: {
    routeName() {
      return this.$route.name
    }
  }
}
</script>