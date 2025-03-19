<template>
  <div class="main-content">
    <el-card>
      <template #header>
        <div class="adv-search" :class="advSearch ? 'expand' : ''">
          <div class="card-row-wrap">
            <div class="card-row-item">
              <el-text tag="label">taskId:</el-text>
              <el-input v-model="searchForm.taskId" placeholder="taskId" maxlength="50" show-word-limit />
            </div>

            <div class="card-row-item">
              <el-text>{{ t('promptInputKw') }}:</el-text>
              <el-input v-model="searchForm.promptInput" :placeholder="t('promptInputKw')" />
            </div>

            <div class="card-row-item">
              <el-text>{{ t('taskStatus.name') }}:</el-text>
              <el-select clearable v-model="searchForm.taskStatus">
                <el-option v-for="opt in taskStatusOpts" :key="opt.key" :value="opt.value" :label="t(opt.label)" />
              </el-select>
            </div>
          </div>
        </div>

        <TableTools :advSearch="advSearch" :searchForm="searchForm" :tableColumns="tableColumns"
          :selectedRows="selectedRows" @baseSearch="baseSearch" @search="search" @advSearchSwitch="advSearchSwitch"
          @delSelected="delSelected" @resetSearch="resetSearch" @checkTableColumn="checkTableColumn" />
      </template>

      <el-table ref="tableRef" @selection-change="handleSelectionChange" :data="pageInfo.list" stripe border
        style="width: 100%" highlight-current-row max-height="760" :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ textAlign: 'center' }">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="taskId" label="TaskId" width="300">
          <template #default="scope">
            <el-link @click="toTaskInfo(scope.row.taskId)" type="primary" class="h-20">
              {{ scope.row.taskId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column v-for="col in showTableColumns" :prop=col.prop :label="col.label" :width="col.width"
          :minWidth="col.minWidth" :showOverflowTooltip="col.showOverflowTooltip" />
      </el-table>

      <el-pagination v-model:current-page="pageInfo.pageNum" v-model:page-size="pageInfo.pageSize"
        :total="pageInfo.total" layout="total, prev, pager, next" />

    </el-card>
  </div>

</template>

<script setup>
import { ref, reactive, inject, computed, onMounted, onBeforeUnmount, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfig } from '@/store/config'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const utils = inject('utils')
const config = useConfig()
const { t } = useI18n()


const tableRef = ref()
const selectedRows = ref([])

// 高级搜索
const advSearch = ref(false)

function advSearchSwitch() {
  advSearch.value = !advSearch.value
}

const pageInfo = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  pages: 1,
  list: []
})

watch(() => pageInfo.pageNum, () => {
  // 触发列表查询
  search()
})

watch(() => pageInfo.pageSize, () => {
  // 触发列表查询
  search()
})


const searchForm = reactive({
  kw: null,
  taskId: null,
  promptInput: null,
  taskStatus: null
})

const taskStatusOpts = reactive([
  { key: "success", value: "success", label: "taskStatus.success" },
  { key: "failed", value: "failed", label: "taskStatus.failed" },
  { key: "running", value: "running", label: "taskStatus.running" },
  { key: "terminated", value: "terminated", label: "taskStatus.terminated" }
])

const tableColumns = ref([
  { prop: "prompt", label: t('promptInput'), isShow: true, showOverflowTooltip: true, minWidth: 300, sortable: true },
  { prop: "statusDesc", label: t('taskStatus.name'), isShow: true, width: 160 },
  { prop: "createdDt", label: t('createdDt'), isShow: true, width: 160 }
])

const showTableColumns = computed(() => {
  return tableColumns.value.filter(item => item.isShow)
})

// 任务历史
const taskHistory = computed(() => {
  return config.taskHistory
})

// 基本搜索
const baseSearch = utils.debounce(() => {
  const kw = searchForm.kw
  utils.clearProps(searchForm)
  searchForm.kw = kw
  search()
}, 500)

// 搜索
// 修改search方法
function search() {
  searchForm.pageNum = pageInfo.pageNum
  searchForm.pageSize = pageInfo.pageSize
  console.log("search searchForm:", searchForm, pageInfo)

  const filteredTaskList = taskHistory.value.filter(taskInfo => {
    if (utils.notBlank(searchForm.kw)) {
      if (!taskInfo.prompt.includes(searchForm.kw) && !taskInfo.taskId.includes(searchForm.kw)) {
        return false
      }
      return true
    }
    if (utils.notBlank(searchForm.taskId) && taskInfo.taskId != searchForm.taskId) {
      return false
    }
    if (utils.notBlank(searchForm.promptInput) && !taskInfo.prompt.includes(searchForm.promptInput)) {
      return false
    }
    if (utils.notBlank(searchForm.taskStatus) && taskInfo.status != searchForm.taskStatus) {
      return false
    }
    return true
  })

  // 计算总条数
  pageInfo.total = filteredTaskList.length

  // 分页处理
  const startIndex = (pageInfo.pageNum - 1) * pageInfo.pageSize
  const endIndex = startIndex + pageInfo.pageSize
  pageInfo.list = filteredTaskList.slice(startIndex, endIndex)

  // 任务状态处理
  pageInfo.list.forEach(item => {
    item.statusDesc = t('taskStatus.' + item.status)
  })

}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// 删除选中的数据
function delSelected() {
  if (selectedRows.value.length == 0) {
    utils.pop("请选择要删除的数据!")
    return
  }
  selectedRows.value.forEach(item => {
    for (let i = 0; i < taskHistory.value.length; i++) {
      if (taskHistory.value[i].taskId == item.taskId) {
        taskHistory.value.splice(i, 1)
        i--
      }
    }
  })
  baseSearch()
}

// 定义变量存储事件监听的引用(不能是常量)
let listener = null

// 在组件挂载时添加事件监听
onMounted(() => {
  listener = (event) => {
    if (event.key === 'Enter') {
      search()
    }
  }
  window.addEventListener('keyup', listener)
  console.log("onMounted pageInfo:", pageInfo)
  search()
})

// 在组件卸载前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('keyup', listener)
})

function checkTableColumn(isCheck, prop) {
  console.log("checkTableColumn:", isCheck, prop)
  tableColumns.value.forEach(item => {
    if (item.prop == prop) {
      item.isShow = isCheck
    }
  })
}

function resetSearch() {
  utils.clearProps(searchForm)
  searchForm.openStatus = "OPEN"
}

function toTaskInfo(taskId) {
  console.log("toTaskInfo:", taskId)
  router.push("/task/"+taskId)
}


</script>

<style scoped></style>
