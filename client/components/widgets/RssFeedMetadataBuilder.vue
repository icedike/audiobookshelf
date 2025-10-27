<template>
  <div class="w-full py-2">
    <div class="flex -mb-px">
      <div class="w-1/2 h-6 rounded-tl-md relative border border-black-200 flex items-center justify-center cursor-pointer" :class="!showAdvancedView ? 'text-white bg-bg hover:bg-bg/60 border-b-bg' : 'text-gray-400 hover:text-gray-300 bg-primary/70 hover:bg-primary/60'" @click="showAdvancedView = false">
        <p class="text-sm">{{ $strings.HeaderRSSFeedGeneral }}</p>
      </div>
      <div class="w-1/2 h-6 rounded-tr-md relative border border-black-200 flex items-center justify-center -ml-px cursor-pointer" :class="showAdvancedView ? 'text-white bg-bg hover:bg-bg/60 border-b-bg' : 'text-gray-400 hover:text-gray-300 bg-primary/70 hover:bg-primary/60'" @click="showAdvancedView = true">
        <p class="text-sm">{{ $strings.HeaderAdvanced }}</p>
      </div>
    </div>
    <div class="px-2 py-4 md:p-4 border border-black-200 rounded-b-md mr-px" style="min-height: 200px">
      <template v-if="!showAdvancedView">
        <div class="grow pt-2 mb-2">
          <ui-checkbox v-model="preventIndexing" :label="$strings.LabelPreventIndexing" checkbox-bg="primary" border-color="gray-600" label-class="pl-2" />
        </div>
      </template>
      <template v-else>
        <div class="grow pt-2 mb-2">
          <ui-checkbox v-model="preventIndexing" :label="$strings.LabelPreventIndexing" checkbox-bg="primary" border-color="gray-600" label-class="pl-2" />
        </div>
        <div class="w-full relative mb-1">
          <ui-text-input-with-label v-model="ownerName" :label="$strings.LabelRSSFeedCustomOwnerName" />
        </div>
        <div class="w-full relative mb-1">
          <ui-text-input-with-label v-model="ownerEmail" :label="$strings.LabelRSSFeedCustomOwnerEmail" />
        </div>

        <!-- iTunes Categories -->
        <div class="w-full pt-4">
          <p class="text-sm font-semibold mb-2">iTunes Categories <span class="text-xs text-gray-400">(Optional, up to 3)</span></p>
          <div v-for="(category, index) in categories" :key="index" class="flex items-center mb-2 space-x-2">
            <div class="flex-1">
              <select v-model="categories[index].category" class="w-full bg-primary border border-gray-600 rounded px-2 py-1 text-sm" @change="onCategoryChange(index)">
                <option value="">Select Category</option>
                <option v-for="cat in categoryNames" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="flex-1">
              <select v-model="categories[index].subcategory" class="w-full bg-primary border border-gray-600 rounded px-2 py-1 text-sm" :disabled="!categories[index].category || !subcategoriesFor(categories[index].category).length">
                <option value="">{{ categories[index].category && subcategoriesFor(categories[index].category).length ? 'Select Subcategory (Optional)' : 'No Subcategories' }}</option>
                <option v-for="subcat in subcategoriesFor(categories[index].category)" :key="subcat" :value="subcat">{{ subcat }}</option>
              </select>
            </div>
            <button v-if="categories.length > 1" type="button" class="text-error hover:text-red-400" @click="removeCategory(index)">
              <span class="material-icons text-lg">close</span>
            </button>
          </div>
          <button v-if="categories.length < 3" type="button" class="text-xs text-gray-300 hover:text-white mt-1" @click="addCategory">
            + Add Category
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          preventIndexing: true,
          ownerName: '',
          ownerEmail: '',
          categories: []
        }
      }
    }
  },
  data() {
    return {
      showAdvancedView: false,
      categories: []
    }
  },
  watch: {
    'value.categories': {
      immediate: true,
      handler(newVal) {
        if (newVal && Array.isArray(newVal) && newVal.length > 0) {
          this.categories = newVal.map(cat => ({ ...cat }))
        } else {
          // Initialize with empty category if none exist
          this.categories = []
        }
      }
    }
  },
  computed: {
    categoryNames() {
      return Object.keys(this.$constants.iTunesCategories)
    },
    preventIndexing: {
      get() {
        return this.value.preventIndexing
      },
      set(value) {
        this.$emit('input', {
          ...this.value,
          preventIndexing: value
        })
      }
    },
    ownerName: {
      get() {
        return this.value.ownerName
      },
      set(value) {
        this.$emit('input', {
          ...this.value,
          ownerName: value
        })
      }
    },
    ownerEmail: {
      get() {
        return this.value.ownerEmail
      },
      set(value) {
        this.$emit('input', {
          ...this.value,
          ownerEmail: value
        })
      }
    }
  },
  methods: {
    subcategoriesFor(category) {
      if (!category || !this.$constants.iTunesCategories[category]) {
        return []
      }
      return this.$constants.iTunesCategories[category]
    },
    onCategoryChange(index) {
      // Clear subcategory when category changes
      this.categories[index].subcategory = ''
      this.emitCategories()
    },
    addCategory() {
      if (this.categories.length < 3) {
        this.categories.push({ category: '', subcategory: '' })
      }
    },
    removeCategory(index) {
      this.categories.splice(index, 1)
      this.emitCategories()
    },
    emitCategories() {
      // Filter out empty categories and emit
      const validCategories = this.categories.filter(cat => cat.category)
      this.$emit('input', {
        ...this.value,
        categories: validCategories
      })
    }
  },
  mounted() {}
}
</script>
