<template>
  <!-- Shows a loading animation loaded as a svg file. If a text is passed as a prop (via "loading-text"), a text shows up underneath the
    loading symbol. That prop is optional, though. -->
  <div class="bg-gray-800 shadow-xl rounded px-8 py-6">
    <div class="flex items-center justify-center w-full h-full mt-4">
      <svg
        class="w-10 h-10 text-gray-200 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <!-- <logo-animation /> -->
    </div>
    <!-- Here we show the prop loadingText iff a string was passed. This is a description of what is being loaded. -->
    <p v-if="loadingText" class="flex items-center justify-center w-full h-full text-gray-200 mt-3">
      {{ loadingText }}
    </p>
    <div class="w-full flex justify-center mt-6">
      <button
        class="bg-gray-600 hover:bg-gray-700 rounded py-1 px-2 text-gray-200"
        @click="$emit('cancelCalculation')"
      >
        Cancel calculation
      </button>
    </div>
  </div>
</template>
  
  <script>
export default {
  // The text to be loaded underneath the loading symbol, which is optional. By default, no text shows up and no extra space is taken up.
  props: {
    loadingText: {
      type: String,
      default: '',
      required: false
    }
  }
}
</script>