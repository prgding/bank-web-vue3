<script setup lang="ts">

import {ElMessage, ElMessageBox} from 'element-plus'
import {inject, reactive, ref, toRefs} from "vue";
import axios from "axios";

// 获取当前登录用户
const currUser = ref({username: "未登录"});
const getCurrentUser = () => {
  axios.get("/curr-user").then(res => {
    currUser.value = res.data.data
    console.log(res);
  });
}
getCurrentUser();
const state = reactive({
  squareUrl:
      'http://localhost:8081/img/admin.png',
  sizeList: ['small', '', 'large'] as const,
})
const {circleUrl, squareUrl, sizeList} = toRefs(state)

const freezeAct = (row) => {
  axios.post("/freeze", {id: row.id}).then(res => {
    ElMessage.success('冻结成功')
    userManage()
  }).catch(err => {
    ElMessage.error('冻结失败，错误码: ' + err)
  })
}

const unfreezeAct = (row) => {
  axios.post("/unfreeze", {id: row.id}).then(res => {
    ElMessage.success('解冻成功')
    userManage()
  }).catch(err => {
    ElMessage.error('解冻失败，错误码: ' + err)
  })
}


const quit = () => {
  localStorage.removeItem("Local-Token")
  window.location.href = "/"
}
let userTableData = ref([])
let logTableData = ref([])
let userTableFlag = ref(false)
let logTableFlag = ref(false)
const userManage = () => {
  if (logTableFlag.value === true) {
    pageForm.currentPage = 1
  }
  axios.post("/users-page", pageForm).then(res => {
    userTableData.value = res.data.data.content
    getUsersAmount()
  }).catch(err => {
    ElMessage.error('获取用户信息失败，错误码: ' + err)
  })

  // 展示对应表格
  logTableFlag.value = false
  userTableFlag.value = true

  // 展示对应分页
  logPageFlag.value = false
  userPageFlag.value = true
}
const logManage = () => {
  if (userTableFlag.value === true) {
    pageForm.currentPage = 1
  }
  axios.post("/logs-page", pageForm).then(res => {
    logTableData.value = res.data.data
    getLogsAmount()
  }).catch(err => {
    ElMessage.error('获取日志信息失败，错误码: ' + err)
  })

  // 展示对应表格
  userTableFlag.value = false
  logTableFlag.value = true

  // 展示对应分页
  userPageFlag.value = false
  logPageFlag.value = true
}

const editUser = (row) => {
  Object.assign(userForm, row)
  userDialogueFlag.value = true
}
const editLog = (row) => {
  Object.assign(logForm, row)
  logDialogueFlag.value = true
}

const balanceFormatter = (row, column, cellValue) => {
  if (!isNaN(cellValue)) {
    return parseFloat(cellValue).toFixed(2);
  }
  return cellValue;
}

const getFlagStatus = (flag) => {
  if (flag === 0) {
    return '<span style="color: red;">冻结</span>';
  }
  return "正常";

}

const userForm = reactive({
  id: '',
  username: '',
  balance: '',
  flag: ''
})

const logForm = reactive({
  logId: '',
  logType: '',
  logAmount: '',
  userId: '',
  username: ''
})

let userDialogueFlag = ref(false)
let logDialogueFlag = ref(false)

const userChange = () => {
  axios.post("/user-change", userForm).then(res => {
    ElMessage.success('修改成功')
    userDialogueFlag.value = false
    userManage()
  }).catch(err => {
    ElMessage.error('修改失败，错误码: ' + err)
  })
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

const invisible = () => {
  userDialogueFlag.value = false
  logDialogueFlag.value = false
}

const delUser = (row) => {
  ElMessageBox.confirm('此操作将永久删除该用户, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    axios.post("/user-del", row).then(res => {
      ElMessage.success('删除成功')
      userDialogueFlag.value = false
      userManage()
    }).catch(err => {
      ElMessage.error('删除失败，错误码: ' + err)
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  });
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

const pageForm = reactive({
  currentPage: 1,
  totalRowNum: 20,
  pageSize: 5
})

const getUsersAmount = () => {
  axios.get("/users-amount").then(res => {
    pageForm.totalRowNum = res.data.data
  }).catch(err => {
    ElMessage.error('获取用户总数失败，错误码: ' + err)
  })
}

const getLogsAmount = () => {
  axios.get("/logs-amount").then(res => {
    pageForm.totalRowNum = res.data.data
  }).catch(err => {
    ElMessage.error('获取日志总数失败，错误码: ' + err)
  })
}

let userPageFlag = ref(false)
let logPageFlag = ref(false)
// 修改当前页码
const changeUserCurrent = (num) => {
  pageForm.currentPage = num;
  userManage()
}

const changeUserSize = (size) => {
  pageForm.pageSize = size
  console.log("size= ", size);
  // 重新查询
  userManage()
}

// 修改当前页码
const changeLogCurrent = (num) => {
  pageForm.currentPage = num;
  logManage()
}

const changeLogSize = (size) => {
  pageForm.pageSize = size
  console.log("size= ", size);
  // 重新查询
  logManage()
}

let userLogoDia = ref(false)
import {UploadFilled} from '@element-plus/icons-vue'

let headers = ref({
  'Token': localStorage.getItem("Local-Token")
})
const backend = inject('$backend');
const imgUpMsg = ref('更换头像')
const selectMsg = ref('全选')
const errorHandler = (err) => {
  state.squareUrl = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  ElMessage.info('用户未上传头像')
  imgUpMsg.value = '上传头像'
}
const selectedRows = ref([])
const selectChange = (selected) => {
  selectedRows.value = selected;
}
import {saveAs} from 'file-saver';
import {utils, write} from "xlsx";

const exportUsers = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.info('请先选择要导出的用户')
    return
  }
  // 复制选中的行以便于修改数据而不影响原始数据
  const processedData = selectedRows.value.map(row => ({...row}));
  // 将userFlag字段转换为文字描述
  processedData.forEach(row => {
    if (row.userFlag === 0) {
      row.userFlag = '冻结';
    } else if (row.userFlag === 1) {
      row.userFlag = '正常';
    }
  });

  // 创建一个数组，第一行为自定义的列名称
  let dataToExport = [
    ["用户编号", "用户名", "余额(元)", "冻结状态"],
    ...processedData.map(item => [item.id, item.username, item.balance, item.userFlag])
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
      "users.xlsx"
  );
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
const userTable = ref(null);
const logTable = ref(null);
const selectAll = () => {
  if (userTableFlag.value) {
    userTable.value.toggleAllSelection();
  }
  if (logTableFlag.value) {
    logTable.value.toggleAllSelection();
  }
}
const changeSelectMsg = () => {
  if (selectMsg.value === '取消全选') {
    selectMsg.value = '全选'
  } else if (selectMsg.value === '全选')
    selectMsg.value = '取消全选'
}
</script>

<template>
  <el-row class="demo-avatar demo-basic" gutter="{20}">
    <!-- 第一个部分：显示 "当前用户：{{ currUser.username }}" -->
    <el-col :span="8" style="text-align: right; padding-right: 0;padding-top: 15px">
      <div>
        当前用户：{{ currUser.username }}
      </div>
    </el-col>

    <!-- 第二个部分：显示用户的头像 -->
    <el-col :span="8">
      <div class="demo-basic--circle">
        <el-avatar shape="square" :size="'large'" :src="squareUrl" @error="errorHandler"/>
      </div>
    </el-col>

    <!-- 第3个部分：显示上传头像 -->
    <!-- 第三个部分：根据 squareUrl 判断显示上传还是更换头像按钮 -->
    <el-col :span="8" style="text-align: left; padding-left: 0;margin-top: 15px">
      <el-button @click="userLogoDia = true" type="warning" plain>{{ imgUpMsg }}</el-button>
    </el-col>
  </el-row>

  <el-dialog v-model="userLogoDia" title="头像上传">
    <el-upload
        class="upload-demo"
        drag
        action="http://localhost:8081/api/upload"
        multiple
        :headers="headers"
    >
      <el-icon class="el-icon--upload">
        <upload-filled/>
      </el-icon>
      <div class="el-upload__text">
        将文件拖拽到此处或者 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          请上传 500kb 以下的 png 文件
          <br>
          上传/更新后请刷新页面
        </div>
      </template>
    </el-upload>
  </el-dialog>

  <el-row class="mb-4">
    <el-button @click="userManage" type="primary" plain>用户管理</el-button>
    <el-button @click="logManage" type="danger" plain>日志管理</el-button>
    <el-button @click="quit" plain>退出</el-button>
  </el-row>

  <el-table id="table"
            v-if="userTableFlag"
            :data="userTableData"
            stripe
            ref="userTable"
            @selection-change="selectChange"
            @select-all="changeSelectMsg"
  >
    <el-table-column type="selection" width="55"/>
    <el-table-column prop="id" label="用户编号"/>
    <el-table-column prop="username" label="用户名"/>
    <el-table-column prop="balance" :formatter="balanceFormatter" label="余额(元)"/>
    <el-table-column prop="userFlag" label="冻结状态">
      <template #default="scope">
        <span v-html="getFlagStatus(scope.row.userFlag)"></span>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="editUser(scope.row)">
          修改信息
        </el-button>
        <el-button link type="primary" v-if="scope.row.userFlag === 1" size="small" @click="freezeAct(scope.row)">冻结</el-button>
        <el-button link type="primary" v-if="scope.row.userFlag === 0" size="small" @click="unfreezeAct(scope.row)">解冻</el-button>
        <el-button link type="primary" size="small" @click="delUser(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>


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

  <el-dialog align-center v-model="userDialogueFlag" title="修改用户信息">
    <el-form :model="userForm">
      <el-form-item label="用户名">
        <el-input v-model="userForm.username"/>
      </el-form-item>
      <el-form-item label="余额">
        <el-input v-model="userForm.balance"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="invisible">取消</el-button>
        <el-button type="primary" @click="userChange">确认</el-button>
      </span>
    </template>
  </el-dialog>

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
    <el-button v-if="userTableFlag" @click="selectAll" type="primary" plain>{{ selectMsg }}</el-button>
    <el-button v-if="logTableFlag" @click="selectAll" type="primary" plain>{{ selectMsg }}</el-button>
    <el-button v-if="userTableFlag" @click="exportUsers" type="warning" plain>导出选中用户</el-button>
    <el-button v-if="logTableFlag" @click="exportLogs" type="warning" plain>导出选中日志</el-button>
  </div>

  <div class="user-page">
    <el-pagination
        v-if="userPageFlag"
        v-model:current-page="pageForm.currentPage"
        v-model:page-size="pageForm.pageSize"
        :page-sizes="[5, 10, 15, 20]"
        :background="true"
        layout="sizes, prev, pager, next"
        :total="pageForm.totalRowNum"
        @size-change="changeUserSize"
        @current-change="changeUserCurrent"
    />
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
  justify-content: center;
  padding: 20px 0;
}

#table {
  width: 80%;
  margin: 0 auto;
}

.user-page {
  padding-top: 20px;
  width: 80%;
  margin: 0 auto;
}

.log-page {
  padding-bottom: 100px;
  width: 80%;
  margin: 0 auto;
}

#export {
  width: 80%;
  margin: 20px auto 0;
  text-align: left;
}

</style>