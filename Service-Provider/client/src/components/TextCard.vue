<template>
  <div
    class="max-w-screen-xl flex flex-col items-center bg-gray-800 space-y-10 text-gray-200 shadow-xl rounded-lg md:p-12 p-6"
  >
    <h1 class="text-2xl text-center font-bold">{{ heading }}</h1>
    <div v-for="(paragraph, index) in paragraphs" :key="index">
      <h1 v-if="paragraph.subHeading != ''" class="text-xl font-bold mb-2">
        {{ paragraph.subHeading }}
      </h1>
      <p v-html="paragraph.text" class=""></p>
      <div v-if="index != paragraphs.length - 1" class="border-b border-gray-400 h-10"></div>
    </div>
  </div>
</template>
  
  <script>
export default {
  props: {
    heading: {
      type: String
    },
    paragraphs: {
      type: Array
    }
  }
}
</script>
