<script lang="ts" setup>
import {inject, reactive, ref} from 'vue'
import axios from "axios";
import {ElMessage} from 'element-plus'

const backend = inject('$backend');
const imageURL = ref(`${backend}/captcha`)

const loginForm = reactive({
  username: '',
  password: '',
  captchaCode: '',
})
const onRegister = () => {
  axios.post('/register', {
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
window.onkeydown = ($event) => {
  if ($event.key && $event.key == 'Enter') {
    onLogin();
  }
}
const onLogin = () => {
  axios.post('/login', {
    username: loginForm.username,
    password: loginForm.password,
    captchaCode: loginForm.captchaCode
  }).then(res => {
    console.log("res = ", res);
    if (res.data.message === '登录成功') {
      localStorage.setItem("Local-Token", res.data.data)
      console.log("login =", localStorage.getItem("Local-Token"));
      window.location.href = '/service'
    } else {
      ElMessage.error(res.data.message)
    }
  }).catch(err => {
    console.log("err = ", err);
    alert('登录失败，错误码: ' + err)
  })
}


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
        <el-image style="width: 80px; height: 60px" :src="imageURL" :fit="'contain'"/>
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