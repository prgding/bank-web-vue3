<script lang="ts" setup>
import {reactive, ref} from 'vue'
import axios from "axios";
import {ElMessage} from 'element-plus'

const loginForm = reactive({
  username: '',
  password: '',
  captchaCode: '',
})

const onRegister = () => {
  axios.post('http://localhost:8080/register', {
    username: loginForm.username,
    password: loginForm.password,
    captchaCode: loginForm.captchaCode
  }).then(res => {
    if (res.data === "注册成功") {
      ElMessage.success(res.data)
    } else {
      ElMessage.error(res.data)
    }
  }).catch(err => {
    ElMessage.error('注册失败，错误码: ' + err)
  })
}
const onLogin = () => {
  axios.post('http://localhost:8080/login', {
    username: loginForm.username,
    password: loginForm.password,
    captchaCode: loginForm.captchaCode
  }).then(res => {
    if (res.data.message === '登录成功') {
      localStorage.setItem("Local-Token", res.data.data)
      window.location.href = '/service'
    } else {
      ElMessage.error(res.data.message)
    }
  }).catch(err => {
    alert('登录失败，错误码: ' + err)
  })
}
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


</script>

<template>
  <el-form
      class="el-form"
      :label-position="'left'"
      label-width="100px"
      :model="loginForm"
      style="max-width: 460px"
  >
    <el-form-item label="账户">
      <el-input spellcheck="false" v-model="loginForm.username"/>
    </el-form-item>

    <el-form-item label="密码">
      <el-input spellcheck="false" type="password" show-password v-model="loginForm.password"/>
    </el-form-item>

    <el-form-item label="验证码">
      <el-input spellcheck="false" check="false" v-model="loginForm.captchaCode"/>
    </el-form-item>

    <el-form-item>
      <el-button type="success" @click="onRegister">注册</el-button>
      <el-button type="primary" @click="onLogin">登录</el-button>
      <div class="image">
        <el-image style="width: 80px; height: 60px" :src="'http://localhost:8080/captcha'" :fit="'contain'"/>
      </div>
    </el-form-item>

  </el-form>
</template>

<style scoped>
.el-form {
  margin: 0 auto;
  padding-top: 20px;
}

.image {
  padding-top: 10px;
  padding-left: 140px;
}
</style>