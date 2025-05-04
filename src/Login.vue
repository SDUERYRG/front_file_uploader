<template>
  <div class="login-container">
    <div class="login-box">
        <h2>登录</h2>
    <el-form>
      <el-form-item label="账号">
        <el-input v-model="username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="password" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin" style="width: 47%;">登录</el-button>
        <el-button type="primary" @click="goToRegister" style="width: 47%;">注册</el-button>
      </el-form-item>
    </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import request from './api/request';
const username = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = () => {
  router.push('/home');
};

const goToRegister = () => {
  router.push('/register'); 
}


</script>

<style scoped>
/* 可在此添加样式 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vh; 
  background-color: #f0f2f5;
}
.login-box {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 300px;
}
</style>