<script setup lang="ts">
import axios from "axios";

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
    alert("余额为："+ res.data)
  }).catch(err => {
    alert('查询失败，错误码: ' + err)
  })
}
const withdraw = () => {
  axios.post("http://localhost:8080/withdraw")
}

</script>

<template>
  <el-row class="mb-4">
    <el-button @click="inquiry" type="warning">查询余额</el-button>
    <el-button @click="withdraw" type="primary">取款</el-button>
    <el-button @click="deposit" type="success">存款</el-button>
    <el-button @click="transfer" type="info">转账</el-button>
  </el-row>
</template>

<style scoped>
.mb-4 {
  justify-content: center;
}
</style>