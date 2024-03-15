<template>
  <label class="block">
    <span class="text-gray-200 text-md font-bold">{{ label }}</span>
    <div v-if="type === 'file'">
      <input type="file" class="hidden" @change="handleFileChange" ref="fileInput" />
      <div
        class="flex items-center justify-between w-full bg-white border border-gray-300 rounded py-1 pl-3 pr-1"
      >
        <span :class="selectedFileName ? 'text-gray-700' : 'text-gray-400'">{{
          selectedFileName || placeholder
        }}</span>
        <button
          type="button"
          class="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
          @click="triggerFileInput"
        >
          Choose File
        </button>
      </div>
    </div>
    <input
      v-else
      class="block mt-2 border rounded w-full py-2 px-3 text-gray-700 focus:outline-none placeholder-gray-400"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :class="{ 'border border-red-500': error }"
      @input="updateModelValue($event.target.value)"
      @change="handleChange($event.target.value)"
      @blur="blur"
    />
    <p v-if="error" class="z-0 mt-1 text-sm font-medium text-red-500">
      {{ error }}
    </p>
  </label>
</template>
  
  <script>
export default {
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      selectedFileName: ''
    }
  },
  methods: {
    updateModelValue(value) {
      this.$emit('update:modelValue', value)
    },
    handleChange(value) {
      this.$emit('change', value)
    },
    blur() {
      this.$emit('blur')
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileChange(event) {
      const fileInput = event.target
      const fileName = fileInput.files.length ? fileInput.files[0].name : ''
      this.selectedFileName = fileName
      this.$emit('fileSelected', fileInput.files[0])
    },
    resetFileInput() {
      // Reset the file input value and Name
      this.$refs.fileInput.value = ''
      this.selectedFileName = ''
    }
  }
}
</script>
  