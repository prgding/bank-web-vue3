<script setup lang="ts">

import {ElMessage, ElMessageBox} from 'element-plus'
import {reactive, ref, toRefs} from "vue";
import axios from "axios";
import {utils, write} from "xlsx";
import {saveAs} from 'file-saver';

const inquiry = () => {
  axios.get('/inquiry').then(res => {
    ElMessage.success("余额为：" + res.data.data)
  }).catch(err => {
    ElMessage.error('查询失败，错误码: ' + err)
  })
}

const withdraw = () => {
  ElMessageBox.prompt('输入取款金额', '取款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /[0-9]/,
    inputErrorMessage: '请输入数字',
  }).then(({value}) => {
    axios.post("/withdraw", {
      amount: value
    }).then(res => {
      if (res.data.message === '取款成功') {
        ElMessage.success(res.data.message)
        inquiry()
      } else {
        ElMessage.error(res.data.message)
      }
    }).catch(err => {
      ElMessage.error('取款失败，错误码: ' + err)
    })
  })
}

const deposit = () => {
  ElMessageBox.prompt('输入存款金额', '存款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /[0-9]/,
    inputErrorMessage: '请输入数字',
  }).then(({value}) => {
    axios.post("/deposit", {
      amount: value
    }).then(res => {
      if (res.data.message === '存款成功') {
        ElMessage.success(res.data.message)
        inquiry()
      } else {
        ElMessage.error(res.data.message)
      }
    }).catch(err => {
      ElMessage.error('存款失败，错误码: ' + err)
    })
  })
}

// 获取当前登录用户
const currUser = ref({username: "未登录"});
const getCurrentUser = () => {
  axios.get("/curr-user").then(res => {
    currUser.value = res.data.data
    console.log(res);
  });
}
getCurrentUser();

const dialogFormVisible = ref(false)

const closeAndClear = () => {
  dialogFormVisible.value = false
  transForm.toName = ''
  transForm.transMoney = ''
}

const transfer = () => {
  dialogFormVisible.value = false
  axios.post("/transfer", {
    toName: transForm.toName,
    transMoney: transForm.transMoney
  }).then(res => {
    if (res.data.message === '转账成功') {
      ElMessage.success(res.data.message)
      inquiry()
    } else {
      ElMessage.error(res.data.message)
    }
  }).catch(err => {
    ElMessage.error('转账失败，错误码: ' + err)
  })
  closeAndClear()
}

const transForm = reactive({
  toName: '',
  transMoney: ''
})

const quit = () => {
  localStorage.removeItem("Local-Token")
  window.location.href = "/"
}

let logTableData = ref([])
const logTableFlag = ref(false)

const selectedRows = ref([])
const selectChange = (selected) => {
  selectedRows.value = selected;
}
const selectMsg = ref('全选')
const changeSelectMsg = () => {
  if (selectMsg.value === '取消全选') {
    selectMsg.value = '全选'
  } else if (selectMsg.value === '全选')
    selectMsg.value = '取消全选'
}
const balanceFormatter = (row, column, cellValue) => {
  if (!isNaN(cellValue)) {
    return parseFloat(cellValue).toFixed(2);
  }
  return cellValue;
}
const logForm = reactive({
  logId: '',
  logType: '',
  logAmount: '',
  userId: '',
  username: ''
})
let logDialogueFlag = ref(false)

const editLog = (row) => {
  Object.assign(logForm, row)
  logDialogueFlag.value = true
}
const pageForm = reactive({
  currentPage: 1,
  totalRowNum: 20,
  pageSize: 5
})
const getLogsAmount = () => {
  axios.get("/logs-one-count").then(res => {
    pageForm.totalRowNum = res.data.data
  }).catch(err => {
    ElMessage.error('获取日志总数失败，错误码: ' + err)
  })
}
let logPageFlag = ref(false)
const logManage = () => {
  showLogMsg.value = !showLogMsg.value;
  if (showLogMsg.value === true) {
    logTableFlag.value = false;
    logPageFlag.value = false;
    return
  }
  axios.post("/logs-one-page", pageForm).then(res => {
    logTableData.value = res.data.data
    getLogsAmount()
  }).catch(err => {
    ElMessage.error('获取日志信息失败，错误码: ' + err)
  })

  // 展示对应表格
  logTableFlag.value = true

  // 展示对应分页
  logPageFlag.value = true
}
const delLog = (row) => {
  ElMessageBox.confirm('此操作将永久删除该日志, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    axios.post("/log-del", row).then(res => {
      ElMessage.success('删除成功')
      logDialogueFlag.value = false
      logManage()
    }).catch(err => {
      ElMessage.error('删除失败，错误码: ' + err)
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  });
}
const changeLogSize = (size) => {
  pageForm.pageSize = size
  console.log("size= ", size);
  // 重新查询
  logManage()
}
const changeLogCurrent = (num) => {
  pageForm.currentPage = num;
  logManage()
}
const invisible = () => {
  logDialogueFlag.value = false
}
const logChange = () => {
  axios.post("/log-change", logForm).then(res => {
    ElMessage.success('修改成功')
    logDialogueFlag.value = false
    logManage()
  }).catch(err => {
    ElMessage.error('修改失败，错误码: ' + err)
  })
}

const exportLogs = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.info('请先选择要导出的日志')
    return
  }
  // 复制选中的行以便于修改数据而不影响原始数据
  const processedData = selectedRows.value.map(row => ({...row}));

  // 创建一个数组，第一行为自定义的列名称
  let dataToExport = [
    ["日志编号", "用户名", "操作金额(元)", "操作类型"],
    ...processedData.map(item => [item.logId, item.username, item.logAmount, item.logType])
  ];

  const ws = utils.aoa_to_sheet(dataToExport);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "SelectedRows");

  const wbout = write(wb, {
    bookType: "xlsx",
    bookSST: true,
    type: "array"
  });

  saveAs(
      new Blob([wbout], {type: "application/octet-stream"}),
      "logs.xlsx"
  );
}
const logTable = ref(null)
const selectAll = () => {
  if (logTableFlag.value) {
    logTable.value.toggleAllSelection();
  }
}
let showLogMsg = ref(true)
</script>

<template>
  当前用户：{{ currUser.username }}
  <el-row class="mb-4">
    <el-button @click="inquiry" type="warning" plain>查询余额</el-button>
    <el-button @click="withdraw" type="primary" plain>取款</el-button>
    <el-button @click="deposit" type="success" plain>存款</el-button>
    <el-button @click="dialogFormVisible = true" type="info" plain>转账</el-button>
    <el-button @click="logManage" type="danger" plain>{{ showLogMsg ? '查询日志' : '收起日志' }}</el-button>
    <el-button @click="quit" plain>退出</el-button>
  </el-row>
  <el-dialog align-center v-model="dialogFormVisible" title="转账">
    <el-form :model="transForm">
      <el-form-item label="对方账户">
        <el-input v-model="transForm.toName" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="转账金额">
        <el-input v-model="transForm.transMoney"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeAndClear">取消</el-button>
        <el-button type="primary" @click="transfer">确认</el-button>
      </span>
    </template>
  </el-dialog>


  <el-table id="table"
            v-if="logTableFlag"
            :data="logTableData"
            stripe
            ref="logTable"
            @selection-change="selectChange"
            @select-all="changeSelectMsg"
  >
    <el-table-column type="selection" width="55"/>
    <el-table-column prop="logId" label="日志编号"/>
    <el-table-column prop="username" label="用户名"/>
    <el-table-column prop="logAmount" :formatter="balanceFormatter" label="操作金额(元)"/>
    <el-table-column prop="logType" label="操作类型"/>
    <el-table-column fixed="right" label="操作">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="editLog(scope.row)">
          修改信息
        </el-button>
        <el-button link type="primary" size="small" @click="delLog(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog align-center v-model="logDialogueFlag" title="修改日志信息">
    <el-form :model="logForm">
      <el-form-item label="操作金额">
        <el-input v-model="logForm.logAmount"/>
      </el-form-item>
      <el-form-item label="操作类型">
        <el-input v-model="logForm.logType"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="invisible">取消</el-button>
        <el-button type="primary" @click="logChange">确认</el-button>
      </span>
    </template>
  </el-dialog>

  <div id="export">
    <el-button v-if="logTableFlag" @click="selectAll" type="primary" plain>{{ selectMsg }}</el-button>
    <el-button v-if="logTableFlag" @click="exportLogs" type="warning" plain>导出选中日志</el-button>
  </div>

  <div class="log-page">
    <el-pagination
        v-if="logPageFlag"
        v-model:current-page="pageForm.currentPage"
        v-model:page-size="pageForm.pageSize"
        :page-sizes="[5, 10, 15, 20]"
        :background="true"
        layout="sizes, prev, pager, next"
        :total="pageForm.totalRowNum"
        @size-change="changeLogSize"
        @current-change="changeLogCurrent"
    />
  </div>
</template>

<style scoped>
.mb-4 {
  padding-top: 30px;
  justify-content: center;
}

#table {
  width: 80%;
  margin: 20px auto 0;
}

.log-page {
  padding-top: 20px;
  width: 80%;
  margin: 0 auto;
}

#export {
  width: 80%;
  margin: 20px auto 0;
  text-align: left;
}

</style>