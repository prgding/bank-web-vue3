<script lang="ts" setup>
import {reactive, ref} from 'vue'
import axios from "axios";

const formLabelAlign = reactive({
  username: '',
  password: '',
  captchaCode: '',
})
const fits = ['contain']
const url = 'http://localhost:8080/captcha'

const onRegister = () => {
  axios.post('http://localhost:8080/register', {
    username: formLabelAlign.username,
    password: formLabelAlign.password,
    captchaCode: formLabelAlign.captchaCode
  }).then(res => {
    alert(res.data)
  }).catch(err => {
    alert('注册失败，错误码: ' + err)
  })
}
const onLogin = () => {
  axios.post('http://localhost:8080/login', {
    username: formLabelAlign.username,
    password: formLabelAlign.password,
    captchaCode: formLabelAlign.captchaCode
  }).then(res => {
    console.log(res);
    alert(res.data.message)
    if (res.data.message === '登录成功') {
      localStorage.setItem("Local-Token", res.data.data)
      window.location.href = '/service'
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
      :model="formLabelAlign"
      style="max-width: 460px"
  >
    <el-form-item label="账户">
      <el-input spellcheck="false" v-model="formLabelAlign.username"/>
    </el-form-item>

    <el-form-item label="密码">
      <el-input spellcheck="false" type="password" show-password v-model="formLabelAlign.password"/>
    </el-form-item>

    <el-form-item label="验证码">
      <el-input spellcheck="false" check="false" v-model="formLabelAlign.captchaCode"/>
    </el-form-item>

    <el-form-item>
      <el-button type="success" @click="onRegister">注册</el-button>
      <el-button type="primary" @click="onLogin">登录</el-button>
      <div class="image">
        <el-image style="width: 80px; height: 60px" :src="url" :fit="fits[0]"/>
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