<template>
  <div class="container">
    <div style="width: 600px; padding: 30px; background-color: #fdf2d4; border-radius: 5px;">
      <div style="text-align: center; font-size: 20px; margin-bottom: 20px; color: #f9bd6f">欢迎加入文件共享</div>
      <el-form>
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" placeholder="请输入用户名（邮箱）" v-model="username"></el-input>
        </el-form-item>
        <el-form-item prop="verificationCode">
          <el-input prefix-icon="el-icon-user" placeholder="请输入验证码" v-model="verificationCode"></el-input>
          <el-button type="primary" @click="sendVerificationCode">发送验证码</el-button>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" placeholder="请输入密码" show-password  v-model="password"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPass">
          <el-input prefix-icon="el-icon-lock" placeholder="请确认密码" show-password  v-model="confirmPassword"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button style="width: 100%; background-color: #fde4af; border-color: #fbd28c; color: white" @click="verifyCode(username,verificationCode)">注 册</el-button>
        </el-form-item>
        <div style="display: flex; align-items: center">
          <div style="flex: 1"></div>
          <div style="flex: 1; text-align: right; color: #f9bd6f">
            已有账号？请 <a href="/">登录</a>
          </div>
        </div>
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
.container {
  height: 100vh;
  overflow: hidden;
  background-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}
a{
  color:#f2913d
}
a:hover{
  color:#f2ddb6
}
</style>