<script setup lang="ts">

import {ElMessage, ElMessageBox} from 'element-plus'
import {reactive, ref} from "vue";
import axios from "axios";
import {RouterView} from "vue-router";

// 获取当前登录用户
const currUser = ref({username: "未登录"});
const getCurrentUser = () => {
  axios.get("/curr-user").then(res => {
    currUser.value = res.data.data
    console.log(res);
  });
}
getCurrentUser();


const freezeAct = (row: User) => {
  axios.post("/freeze", {id: row.id}).then(res => {
    ElMessage.success('冻结成功')
    userManage()
  }).catch(err => {
    ElMessage.error('冻结失败，错误码: ' + err)
  })
}

const unfreezeAct = (row: User) => {
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
  axios.get("/user-list").then(res => {
    userTableData.value = res.data.data
  }).catch(err => {
    ElMessage.error('获取用户信息失败，错误码: ' + err)
  })
  logTableFlag.value = false
  userTableFlag.value = true
}
const logManage = () => {
  axios.get("/log-list").then(res => {
    logTableData.value = res.data.data
  }).catch(err => {
    ElMessage.error('获取日志信息失败，错误码: ' + err)
  })
  userTableFlag.value = false
  logTableFlag.value = true
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
  if (flag === '冻结') {
    return '<span style="color: red;">冻结</span>';
  }
  return '正常';

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
</script>

<template>
  当前用户：{{ currUser.username }}

  <el-row class="mb-4">
    <el-button @click="userManage" type="primary" plain>用户管理</el-button>
    <el-button @click="logManage" type="danger" plain>日志管理</el-button>
    <el-button @click="quit" plain>退出</el-button>
  </el-row>

  <el-table id="table" v-if="userTableFlag" :data="userTableData" stripe>
    <el-table-column type="selection" width="55"/>
    <el-table-column prop="id" label="用户编号"/>
    <el-table-column prop="username" label="用户名"/>
    <el-table-column prop="balance" :formatter="balanceFormatter" label="余额(元)"/>
    <el-table-column prop="flag" label="冻结状态">
      <template #default="scope">
        <span v-html="getFlagStatus(scope.row.flag)"></span>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="editUser(scope.row)">
          修改信息
        </el-button>
        <el-button link type="primary" v-if="scope.row.flag === '正常'" size="small" @click="freezeAct(scope.row)">冻结</el-button>
        <el-button link type="primary" v-if="scope.row.flag === '冻结'" size="small" @click="unfreezeAct(scope.row)">解冻</el-button>
        <el-button link type="primary" size="small" @click="delUser(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-table id="table" v-if="logTableFlag" :data="logTableData" stripe>
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

</template>

<style scoped>
.mb-4 {
  justify-content: center;
  padding: 30px 0;
}

#table {
  width: 80%;
  margin: 0 auto;
}

</style>