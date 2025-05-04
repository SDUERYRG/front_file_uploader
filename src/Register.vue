<template>
  <div class="login-container">
    <div class="login-box">
        <h2>注册</h2>
    <el-form>
      <el-form-item label="用户名（邮箱）">
        <el-input v-model="username"></el-input>
      </el-form-item>
      <el-form-item label="验证码">
        <el-input v-model="verificationCode" style="width: 50%;margin-right: 5%;"></el-input>
        <el-button type="primary" @click="sendVerificationCode">发送验证码</el-button>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="password" type="password"></el-input>
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input v-model="confirmPassword" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="verifyCode(username,verificationCode)" style="width: 100%;">注册</el-button>
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
const verificationCode = ref('');
const password = ref('');
const confirmPassword = ref('');
const router = useRouter();

const sendVerificationCode = async () => {
  try {
    const response = await request.get(`/sendMail/${username.value}`);
    console.log('Send verification code response:', response);
  } catch (error) {
    console.error('Send verification code error:', error);
  }
};

const verifyCode = async (email:string,code:string) => {
  try {
    // email="1941456753@qq.com"
    // code="994772"
    const requestBody = {
        email: email,
        code: code
    };
    const response = await request.post('/verifyCode', requestBody);
    if (response.data.status == true) {
      handleRegister(); 
    }
    console.log('Verify code response:', response);
  } catch (error) {
    alert("验证码验证出错，请稍后再试")
    console.error('Verify code error:', error);
  }
};

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    console.error('两次输入的密码不一致');
    return;
  }

  try {
    const user = {
      username: username.value,
      password: password.value
    };
    const response = await request.post('/userRegister', user);
    if (response.data.status == true) {
      // 注册成功后进行登录操作或其他操作
      alert("注册成功");
      console.log('注册成功');
      router.push('/login');
    } else {
      alert(response.data.message);
    }
  } catch (error) {
    console.error('注册出错:', error);
    alert('注册出错，请稍后再试');
  }
};
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