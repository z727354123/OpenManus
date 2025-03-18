<template>
  <div class="main-content">
    <el-card>
      <template #header>
        <div class="title fxsb">
          <div>{{ t('baseConfig') }}</div>
        </div>
      </template>

      <!-- Show Data -->
      <div class="card-row-wrap" v-show="baseShow">
        <div class="card-row-aline fxsb">
          <el-text>{{ t('clearCache') }}:</el-text>
          <el-button type="danger" class="mlr-10" @click="clearCache">{{ t('clearCache') }}</el-button>
        </div>
      </div>
    </el-card>


    <el-card>
      <template #header>
        <div class="title fxsb">
          <div> {{ t('serverConfig') }}</div>
          <div>
            <el-link type="primary" class="no-select plr-6" @click="toEdit('server')" v-show="serverShow">
              {{ t('edit') }}
            </el-link>
            <el-link type="primary" class="no-select plr-6" @click="toShow('server')" v-show="serverEdit">
              {{ t('cancel') }}
            </el-link>
          </div>
        </div>
      </template>

      <!-- No Data -->
      <div class="no-data" v-show="serverNoData">{{ t('noData') }}</div>

      <!-- Show Data -->
      <div class="card-row-wrap" v-show="serverShow">
        <div class="card-row-item">
          <el-text>host:</el-text>
          <el-text>{{ serverConfig.host }}</el-text>
        </div>

        <div class="card-row-item">
          <el-text>port:</el-text>
          <el-text tag="p">{{ serverConfig.port }}</el-text>
        </div>
      </div>

      <!-- Edit Module -->
      <el-form ref="ruleFormRef" :model="serverConfigUpd" status-icon :rules="rules" v-show="serverEdit">
        <div class="card-row-wrap">
          <div class="card-row-item">
            <el-text>host:</el-text>
            <el-form-item prop="host">
              <el-input v-model="serverConfigUpd.host" />
            </el-form-item>
          </div>

          <div class="card-row-item">
            <el-text>port:</el-text>
            <el-form-item prop="port">
              <el-input v-model="serverConfigUpd.port" />
            </el-form-item>
          </div>

          <div class="card-row-aline fxc" v-show="serverEdit">
            <el-button class="mlr-10" @click="toShow('server')">{{ t('cancel') }}</el-button>
            <el-button type="primary" class="mlr-10" @click="submitForm">{{ t('submit') }}</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

  </div>

</template>

<script setup>
import { ref, reactive, inject, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfig } from '@/store/config'
import { useI18n } from 'vue-i18n'

const utils = inject('utils')
const files = inject('files')
const verify = inject('verify')
const router = useRouter()
const config = useConfig()
const { t } = useI18n()

// 视图模式
const viewModel = reactive({
  base: 'show',
  server: 'show',
})

function toShow(model) {
  console.log("toShow:" + model)
  viewModel[model] = 'show'
}

function toEdit(model) {
  console.log("toEdit:" + model)
  viewModel[model] = 'edit'
}

const baseShow = computed(() => {
  return viewModel.base == 'show'
})

const baseEdit = computed(() => {
  return viewModel.base == 'edit'
})

const baseNoData = computed(() => {
  return baseShow && serverConfig.model == null
})

const serverShow = computed(() => {
  return viewModel.server == 'show'
})

const serverEdit = computed(() => {
  return viewModel.server == 'edit'
})

const readConfigSuccess = ref(false)

const serverNoData = computed(() => {
  return serverShow && !readConfigSuccess.value
})

const serverConfig = reactive({
  host: null,
  port: null,
})

const serverConfigUpd = reactive({
  host: null,
  port: null,
})

function clearCache() {
  config.$reset()
  utils.pop(t('clearCacheSuccess'))
}

onMounted(() => {
  // 读取配置文件config/config.toml
  files.readAll("@/../../config/config.toml").then((fileContent) => {
    console.log("config/config.toml: ", fileContent)
    if (utils.notBlank(fileContent)) {
      readConfigSuccess.value = true
    } else {
      utils.pop(t('readConfigFailed'))
      return
    }
    const lines = utils.stringToLines(fileContent)

    // 读取[server]
    const serverStart = lines.findIndex((line) => {
      return line.includes("[server]")
    })
    for (let i = serverStart + 1; i < lines.length; i++) {
      console.log("line: ", lines[i])
      // 判定是否到了下个配置模块
      if (lines[i].startsWith("[")) {
        break
      }
      // 读取配置
      const line = lines[i]
      const lineArr = line.split("=")
      if (lineArr.length != 2) {
        continue
      }
      const key = lineArr[0].trim()
      const value = lineArr[1].trim()
      serverConfig[key] = value
    }
    console.log("serverConfig read from file: ", serverConfig)
    utils.copyProps(serverConfig, serverConfigUpd)
  })
})


const submitForm = async () => {
  try {
    await ruleFormRef.value.validate();
    if (!utils.hasDfProps(serverConfig, serverConfigUpd)) {
      ElMessage.success('未发生更改!');
      toShow('server')
      return
    }
    ElMessage.success('验证通过，提交表单');
    // update()
  } catch (error) {
    ElMessage.error('参数验证失败');
  }
}

const rules = reactive({
  host: [{ validator: verify.validator('notBlank'), trigger: 'blur' }],
  port: [{ validator: verify.validator('notBlank'), trigger: 'blur' }],
  api_key: [{ validator: verify.validator('notBlank'), trigger: 'blur' }],
  max_tokens: [{ validator: verify.validator('notBlank'), trigger: 'blur' }],
  temperature: [{ validator: verify.validator('notBlank'), trigger: 'blur' }],
})

</script>

<style scoped></style>
