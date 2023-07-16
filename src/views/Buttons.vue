<script setup lang="ts">
import axios from "axios";
import {ElMessage, ElMessageBox} from 'element-plus'
import {reactive, ref} from "vue";


axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("Local-Token")
      if (token) {
        config.headers.Token = token;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

const inquiry = () => {
  axios.get('http://localhost:8080/inquiry').then(res => {
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
    axios.post("http://localhost:8080/withdraw", {
      amount: value
    }).then(res => {
      if (res.data.message === '取款成功') {
        ElMessage.success(res.data.message)
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
    axios.post("http://localhost:8080/deposit", {
      amount: value
    }).then(res => {
      if (res.data.message === '存款成功') {
        ElMessage.success(res.data.message)
      } else {
        ElMessage.error(res.data.message)
      }
    }).catch(err => {
      ElMessage.error('存款失败，错误码: ' + err)
    })
  })
}

// 获取当前登录用户
const currUser = ref({username:"未登录"});
const getCurrentUser = () => {
  axios.get("http://localhost:8080/curr-user").then(res => {
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
  axios.post("http://localhost:8080/transfer", {
    toName: transForm.toName,
    transMoney: transForm.transMoney
  }).then(res => {
    res.data.message === '转账成功' ? ElMessage.success(res.data.message) : ElMessage.error(res.data.message)
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

</script>

<template>
  当前用户：{{ currUser.username }}
  <br><br>
  <el-row class="mb-4">
    <el-button @click="inquiry" type="warning">查询余额</el-button>
    <el-button @click="withdraw" type="primary">取款</el-button>
    <el-button @click="deposit" type="success">存款</el-button>
    <el-button @click="dialogFormVisible = true" type="info">转账</el-button>
    <el-button @click="quit">退出</el-button>
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
</template>

<style scoped>
.mb-4 {
  justify-content: center;
}

</style>