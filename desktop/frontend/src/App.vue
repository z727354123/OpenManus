<template>
  <!-- Global Configuration -->
  <el-config-provider :size="size" :z-index="zIndex" :locale="locale" :button="config" :message="config"
    :value-on-clear="null" :empty-values="[undefined, null]">
    <RouterView />
  </el-config-provider>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
/** Dark Theme */
import { useDark, useStorage } from '@vueuse/core'

const size = 'default'
const zIndex = 2000

const localConfig = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {}

const localeStr = localConfig.selectedLang ? localConfig.selectedLang.code : 'en'
const locale = localeStr == 'en' ? en : zhCn

const isDark = useDark()
// Store user preferences
const userPrefersDark = ref(null)
onMounted(() => {

  // Use useStorage hook to sync isDark and local storage
  useStorage(
    'user-prefers-dark',
    userPrefersDark,
    localStorage,
    isDark.value ? 'dark' : 'light'
  )
})

// Watch isDark changes and update local storage
watch(isDark, (newValue) => {
  userPrefersDark.value = newValue ? 'dark' : 'light'
})


/* Global Configuration */
const config = reactive({
  // Button - Automatically insert space between Chinese characters
  autoInsertSpace: true,
  // Message - Maximum number of messages that can be displayed simultaneously
  max: 3,
})
</script>

<style scoped></style>
