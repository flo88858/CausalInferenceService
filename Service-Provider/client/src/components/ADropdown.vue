<template>
  <div ref="componentRef" class="relative">
    <a-input
      v-model="searchTerm"
      @input="inputChanged"
      @click="isOpen = true"
      @blur="blur"
      :label="label"
      :error="isOpen ? '' : error"
      :placeholder="placeholder"
    />
    <Transition>
      <div
        v-if="isOpen && filteredOptions.length > 0"
        class="absolute z-10 w-full border border-gray-400 rounded-lg bg-white shadow-strong mt-1 py-1"
      >
        <ul class="max-h-32 overflow-y-auto text-gray-800">
          <li
            v-for="(value, index) in filteredOptions"
            :key="index"
            :value="value"
            class="rounded-lg hover:bg-blue-400 cursor-default"
            @click="selectOption(value)"
          >
            <span class="px-2">{{ value }}</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
  
<script>
import AInput from '../components/AInput.vue'
export default {
  components: {
    AInput
  },
  props: {
    options: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      required: false
    },
    error: {
      type: String,
      required: false
    },
    placeholder: {
      type: String
    }
  },
  data() {
    return {
      isOpen: false,
      searchTerm: ''
    }
  },
  mounted() {
    // Register the click event listener on the document object
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    // Unregister the click event listener on component unmount
    document.removeEventListener('click', this.handleClickOutside)
  },
  computed: {
    filteredOptions() {
      return this.options.filter((option) =>
        option.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    }
  },
  methods: {
    selectOption(selected) {
      this.searchTerm = selected
      this.isOpen = false
      this.$emit('changedValue', this.searchTerm)
    },
    // If input is valid send it to form, otherwise send empty string
    inputChanged() {
      let newValue = ''
      if (this.options.includes(this.searchTerm)) {
        newValue = this.searchTerm
      }
      this.$emit('changedValue', newValue)
    },
    blur() {
      this.$emit('blur')
    },
    handleClickOutside(event) {
      // Check if the clicked element is inside the component or not
      if (!this.$refs.componentRef.contains(event.target)) {
        // Clicked outside the component, so hide it
        this.isOpen = false
      }
    }
  }
}
</script>
  