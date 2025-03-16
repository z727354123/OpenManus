<template :lang="i18n.locale">
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
import { FolderAdd, Promotion, Eleme, CircleClose } from '@element-plus/icons-vue'
import { useConfig } from '@/store/config'
import { useI18n } from 'vue-i18n'
import i18n from '@/locales/i18n'

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
}


</script>

<style scoped>
.output-area {
  flex-grow: 1;
}

.dialog-user {
  display: flex;
  justify-content: center;
  align-items: space-between;
  margin-bottom: 16px;
}

.dialog-user .blank {
  flex-grow: 1;
}

.dialog-user .content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;
  border-radius: 12px;
  background-color: var(--el-fg-color);
}

.dialog-user .title {
  /** 防止子元素宽度被设置为100%, 子元素的align-self设置除auto和stretch之外的值 */
  align-self: flex-end;
  margin: 6px 16px;
  font-size: 15px;
}

.dialog-user .prompt {
  /** 防止子元素宽度被设置为100%, 子元素的align-self设置除auto和stretch之外的值 */
  align-self: flex-end;
  margin: 0px 16px 6px 16px;
}


.dialog {
  width: 100%;
}


.dialog-ai {
  margin-bottom: 16px;
  background-color: var(--el-fg-color);
  border-radius: 12px;
}

.dialog-ai .title {
  margin: 6px 12px;
  font-size: 15px;
}

.input-area {
  flex-grow: 0;
  width: 100%;
  max-height: 180px;
  padding-left: 80px;
  padding-right: 80px;
  padding-top: 12px;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.input-box {
  width: 100%;
  border-radius: 16px;
  background-color: var(--el-fg-color);
  display: flex;
  justify-content: center;
  align-items: center;
}

.input-style {
  width: 100%;
  padding-top: 12px;
  padding-bottom: 12px;
}

.input-style :deep(.el-textarea__inner) {
  outline: none;
  border: none;
  resize: none;
  box-shadow: none;
}

.add-file-area {
  margin-left: 16px;
  margin-right: 8px;
}

.send-area {
  margin-left: 8px;
  margin-right: 16px;
}

.tips {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  padding-top: 10px;
}

.sub-step-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
