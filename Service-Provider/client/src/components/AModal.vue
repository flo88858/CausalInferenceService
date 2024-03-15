<template>
  <div
    class="max-w-md flex flex-col items-center space-y-12 space-between bg-gray-800 text-gray-200 shadow-xl rounded-lg p-12 m-6"
  >
    <h1 class="text-2xl text-center font-bold whitespace-nowrap">{{ heading }}</h1>
    <div>
      <p class="text-center"><slot></slot></p>
      <div v-if="errorMessage" class="mt-4 flex justify-center space-x-2">
        <span class="font-bold whitespace-nowrap">Error Message:</span
        ><span class="italic">{{ errorMessage }}</span>
      </div>
    </div>

    <button
      v-if="withButton"
      class="flex items-center justify-center bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-4"
      @click="$emit('clickedBackButton')"
    >
      Start another calculation
    </button>
  </div>
</template>

<script>
export default {
  props: {
    heading: {
      type: String
    },
    errorMessage: {
      type: String
    },
    withButton: {
      type: Boolean
    }
  }
}
</script>