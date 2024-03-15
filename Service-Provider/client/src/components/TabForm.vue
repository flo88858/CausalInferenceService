
<template>
  <div class="max-w-md w-full flex flex-col bg-gray-800 text-gray-200 shadow-xl rounded-lg m-6">
    <!-- The Header -->
    <h1 class="text-center text-xl font-bold my-8">{{ header }}</h1>
    <div class="grid grid-cols-12 grid-rows-[3rem,auto] gap-0">
      <!-- The Tabs -->
      <button
        @click="clickedAlgorithm"
        class="col-start-2 col-span-5 rounded-t-lg font-semibold"
        :class="{ 'bg-slate-600': algorithmTabSelected }"
      >
        Algorithms
      </button>
      <button
        @click="clickedDataset"
        class="col-start-7 col-span-5 rounded-t-lg font-semibold"
        :class="{ 'bg-slate-600': !algorithmTabSelected }"
      >
        Datasets
      </button>
      <div class="row-start-2 bg-slate-600"></div>
      <div class="col-start-2 col-span-10 row-start-2 bg-slate-600">
        <!--The algorithm form -->
        <form
          v-if="algorithmTabSelected"
          class="flex flex-col justify-center min-h-80 space-y-1 my-2"
        >
          <a-input
            v-model="v$.formDataAlgorithm.algorithmName.$model"
            label="Algorithm Name"
            :error="algorithmNameError"
            :placeholder="'Give your algorithm a name'"
          />
          <a-input
            v-model="v$.formDataAlgorithm.executionPath.$model"
            label="Execution Path"
            :error="algorithmExecutionPathError"
            :placeholder="'Enter the Execution Path'"
          />
          <a-dropdown
            label="Programming Language"
            :error="algorithmLanguageError"
            :options="supportedLanguages"
            :placeholder="'Choose a programming language'"
            @changedValue="handleChangedProgrammingLanguage"
          ></a-dropdown>
          <a-input
            label="Algorithm Directory (.tar)"
            :error="algorithmDirectoryError"
            :type="'file'"
            @fileSelected="handleAlgorithmFileSelected"
            :placeholder="'algorithmDirectory.tar'"
            ref="algorithmFileInputRef"
          />
        </form>
        <!--The dataset form -->
        <form v-else class="flex flex-col justify-center space-y-1 min-h-80 my-2">
          <a-input
            v-model="v$.formDataDataset.datasetName.$model"
            label="Dataset Name"
            :error="datasetNameError"
            :placeholder="'Give your dataset a name'"
          />
          <a-input
            label="Dataset File (.csv)"
            :error="datasetFileError"
            :type="'file'"
            :placeholder="'dataset.csv'"
            @fileSelected="handleDatasetFileSelected"
            ref="datasetFileInputRef"
          />
        </form>
      </div>
      <div class="row-start-2 bg-slate-600"></div>
    </div>
    <div class="border-b border-gray-400 mx-6 mt-6"></div>

    <div class="flex justify-center items-center my-6">
      <button
        class="w-3/4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button"
        @click="algorithmTabSelected ? uploadAlgorithm() : uploadDataset()"
      >
        <svg
          v-if="isUploading"
          class="w-6 h-6 text-gray-200 animate-spin"
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
        <span v-else-if="algorithmTabSelected">Upload Algorithm</span>
        <span v-else>Upload Dataset</span>
      </button>
    </div>
  </div>
</template>
  
  <script>
import AInput from './AInput.vue'
import ADropdown from './ADropdown.vue'

import { useVuelidate } from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
export default {
  components: {
    AInput,
    ADropdown
  },
  props: {
    header: {
      type: String
    }
  },
  setup() {
    return { v$: useVuelidate() }
  },
  data() {
    return {
      algorithmTabSelected: true,
      formDataAlgorithm: {
        algorithmName: '',
        executionPath: '',
        language: '',
        algorithmDirectory: ''
      },
      formDataDataset: {
        datasetName: '',
        datasetFile: ''
      },
      supportedLanguages: ['julia','python', 'Rscript'],
      isUploading: false,
      // Error handling:
      algorithmErrors: false,
      datasetErrors: false,
      duplicateAlgorithmNameError: false,
      duplicateDatasetNameError: false,
      datasetFileTypeError: false,
      algorithmFileTypeError: false,
      unknownAlgorithmError: false,
      unknownDatasetError: false
    }
  },
  validations() {
    return {
      formDataAlgorithm: {
        algorithmName: {
          required,
          maxLength: maxLength(50)
        },
        executionPath: {
          required
        },
        language: {
          required
        },
        algorithmDirectory: {
          required
        }
      },
      formDataDataset: {
        datasetName: {
          required,
          maxLength: maxLength(50)
        }, // Check if Filename exists
        datasetFile: {
          required
        } // Only allow *.csv
      }
    }
  },
  computed: {
    algorithmNameError() {
      if (!this.algorithmErrors) {
        return ''
      } else if (this.v$.formDataAlgorithm.algorithmName.required.$invalid) {
        return 'You must provide a name for your algorithm'
      } else if (this.v$.formDataAlgorithm.algorithmName.maxLength.$invalid) {
        return `The algorithm name cannot be longer than 50 characters`
      } else if (this.duplicateAlgorithmNameError) {
        return 'A resource with this name already exists'
      } else if (this.unknownAlgorithmError) {
        return 'An unexpected error has occurred'
      } else {
        return ''
      }
    },
    algorithmExecutionPathError() {
      if (!this.algorithmErrors) {
        return ''
      } else if (this.v$.formDataAlgorithm.executionPath.required.$invalid) {
        return 'You must provide an execution path for your algorithm'
      } else if (this.unknownAlgorithmError) {
        return 'An unexpected error has occurred'
      } else {
        return ''
      }
    },
    algorithmLanguageError() {
      if (!this.algorithmErrors) {
        return ''
      } else if (this.v$.formDataAlgorithm.language.required.$invalid) {
        return 'You must provide a supported programming language for your algorithm'
      } else if (this.unknownAlgorithmError) {
        return 'An unexpected error has occurred'
      } else {
        return ''
      }
    },
    algorithmDirectoryError() {
      if (!this.algorithmErrors) {
        return ''
      } else if (this.v$.formDataAlgorithm.algorithmDirectory.required.$invalid) {
        return 'You must provide the algorithm you want to upload'
      } else if (this.algorithmFileTypeError) {
        return 'You must provide a tar directory'
      } else if (this.unknownAlgorithmError) {
        return 'An unexpected error has occurred'
      } else {
        return ''
      }
    },
    datasetNameError() {
      if (!this.datasetErrors) {
        return ''
      } else if (this.v$.formDataDataset.datasetName.required.$invalid) {
        return 'You must provide a name for your dataset'
      } else if (this.v$.formDataDataset.datasetName.maxLength.$invalid) {
        return `The dataset name cannot be longer than 50 characters`
      } else if (this.duplicateDatasetNameError) {
        return 'A resource with this name already exists'
      } else if (this.unknownDatasetError) {
        return 'An unexpected error has occurred'
      } else {
        return ''
      }
    },
    datasetFileError() {
      if (!this.datasetErrors) {
        return ''
      } else if (this.v$.formDataDataset.datasetFile.required.$invalid) {
        return 'You must provide the dataset you want to upload'
      } else if (this.datasetFileTypeError) {
        return 'You must provide a CSV-File'
      } else if (this.unknownDatasetError) {
        return 'An unexpected error has occurred'
      } else {
        return ''
      }
    }
  },
  methods: {
    clickedAlgorithm() {
      this.algorithmTabSelected = true
    },
    clickedDataset() {
      this.algorithmTabSelected = false
    },
    handleChangedProgrammingLanguage(value) {
      this.formDataAlgorithm.language = value
    },
    handleDatasetFileSelected(file) {
      this.formDataDataset.datasetFile = file
    },
    handleAlgorithmFileSelected(file) {
      this.formDataAlgorithm.algorithmDirectory = file
    },
    async uploadAlgorithm() {
      // Reset errors
      this.algorithmErrors = this.v$.formDataAlgorithm.$invalid
      this.duplicateAlgorithmNameError = false
      this.algorithmFileTypeError = false
      this.unknownAlgorithmError = false

      // Only submit form if inputs are valid
      if (!this.algorithmErrors) {
        const formData = new FormData()
        formData.append('resourceName', this.formDataAlgorithm.algorithmName)
        formData.append('executionPath', this.formDataAlgorithm.executionPath)
        formData.append('language', this.formDataAlgorithm.language)
        formData.append('algorithmDirectory', this.formDataAlgorithm.algorithmDirectory)

        try {
          this.isUploading = true
          // Start build process
          await this.$backendApi.post('/provider/resources/algorithm', formData)

          // Update UI
          this.formDataAlgorithm.algorithmName = ''
          this.formDataAlgorithm.executionPath = ''
          this.formDataAlgorithm.algorithmDirectory = ''
          this.$refs.algorithmFileInputRef.resetFileInput()
          this.$emit('uploadedFile')

          this.isUploading = false
        } catch (error) {
          console.log(error)
          this.algorithmErrors = true
          this.isUploading = false
          if (error.response.data.code === 11000) {
            this.duplicateAlgorithmNameError = true
          } else if (error.response.status === 418) {
            this.algorithmFileTypeError = true
          } else {
            this.unknownAlgorithmError = true
          }
        }
      } else {
        console.log('Errors')
      }
    },
    async uploadDataset() {
      // Reset errors
      this.datasetErrors = this.v$.formDataDataset.$invalid
      this.duplicateDatasetNameError = false
      this.unknownDatasetError = false
      this.datasetFileTypeError = false

      // Only submit form if inputs are valid
      if (!this.datasetErrors) {
        const formData = new FormData()

        formData.append('resourceName', this.formDataDataset.datasetName)
        formData.append('datasetFile', this.formDataDataset.datasetFile)

        try {
          this.isUploading = true

          await this.$backendApi.post('/provider/resources/dataset', formData)
          this.formDataDataset.datasetName = ''
          // Currently workaround for resetting the file input
          this.formDataDataset.datasetFile = ''
          this.$refs.datasetFileInputRef.resetFileInput()

          // Emitting event so new Data can be fetched and UI will be updated
          this.$emit('uploadedFile')

          this.isUploading = false
        } catch (error) {
          this.isUploading = false
          this.datasetErrors = true
          if (error.response.data.code === 11000) {
            this.duplicateDatasetNameError = true
          } else if (error.response.status === 418) {
            this.datasetFileTypeError = true
          } else {
            this.unknownDatasetError = true
          }
        }
      } else {
        console.log('Errors')
      }
    }
  }
}
</script>
    