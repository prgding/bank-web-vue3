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


const freezeAct = () => {
  ElMessageBox.prompt('输入要冻结的账户', '冻结账户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /[0-9]/,
    inputErrorMessage: '请输入数字',
  }).then(({value}) => {
    axios.post("/freeze-act", {
      userId: value
    }).then(res => {
      if (res.data.message === '冻结成功') {
        ElMessage.success(res.data.message)
      } else {
        ElMessage.error(res.data.message)
      }
    }).catch(err => {
      ElMessage.error('冻结失败，错误码: ' + err)
    })
  })
}

const unfreezeAct = () => {
  ElMessageBox.prompt('输入要解冻的账户', '解冻账户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /[0-9]/,
    inputErrorMessage: '请输入数字',
  }).then(({value}) => {
    axios.post("/unfreeze-act", {
      userId: value
    }).then(res => {
      if (res.data.message === '解冻成功') {
        ElMessage.success(res.data.message)
      } else {
        ElMessage.error(res.data.message)
      }
    }).catch(err => {
      ElMessage.error('解冻失败，错误码: ' + err)
    })
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

</script>

<template>
  当前用户：{{ currUser.username }}

  <el-row class="mb-4">
    <el-button @click="userManage" type="primary" plain>用户管理</el-button>
    <el-button @click="logManage" type="danger" plain>日志管理</el-button>
    <el-button @click="quit" plain>退出</el-button>
  </el-row>

  <router-view/>

  <el-table id="table" v-if="userTableFlag" :data="userTableData" stripe show-header>
    <el-table-column prop="username" label="用户名"/>
    <el-table-column prop="balance" label="余额"/>
    <el-table-column prop="flag" label="冻结状态"/>
    <el-table-column fixed="right" label="操作">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">
          修改信息
        </el-button>
        <el-button link type="primary" size="small">冻结</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-table id="table" v-if="logTableFlag" :data="logTableData" stripe show-header>
    <el-table-column prop="username" label="用户名"/>
    <el-table-column prop="amount" label="操作金额"/>
    <el-table-column prop="type" label="日志类型"/>
    <el-table-column fixed="right" label="操作">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">
          修改信息
        </el-button>
        <el-button link type="primary" size="small">冻结</el-button>
      </template>
    </el-table-column>
  </el-table>

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