<template>
  <div class="container">
    <div style="width: 600px; padding: 30px; background-color: #f4e8dc; border-radius: 5px;">
      <div style="text-align: center; font-size: 20px; margin-bottom: 20px; color: #bb945d">欢迎登录文件共享系统</div>
      <el-form >
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" placeholder="请输入账号" v-model="username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" placeholder="请输入密码" show-password  v-model="password"></el-input>
        </el-form-item>
        <el-form-item prop="role">
          <!-- <el-select
              v-model="role"
              placeholder="请选择角色"
              style="width: 100%"
          >
            <el-option label="普通用户" value="USER"></el-option>
            <el-option label="管理员" value="ADMIN"></el-option>
          </el-select> -->
        </el-form-item>
        <el-form-item>
          <el-button style="width: 100%; background-color: #f1dcbd; border-color: #d3b288; color: white" @click="handleLogin">登 录</el-button>
        </el-form-item>
        <div style="display: flex; align-items: center">
          <div style="flex: 1"></div>
          <div style="flex: 1; text-align: right ; color: #bb945d">
            还没有账号？请 <a href="/register">注册</a>
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
const username = ref('1941456753@qq.com');
const password = ref('123');
// const role = ref('')
const router = useRouter();

const handleLogin = async () => {
  try {
    const user = {
      username: username.value,
      password: password.value
    };
    const response = await request.post('/user/login', user);
    console.log(response.data)
    if (response.status == 200) {
      const userData = response.data.data;
      console.log('用户：',response.data.data)
      localStorage.setItem('xm-user', JSON.stringify(userData));
      console.log('用户信息已保存到本地存储',localStorage.getItem('xm-user'));
      console.log('登录成功:', response);
      localStorage.setItem('token', response.data.message);
      localStorage.setItem('userId', response.data.data.id);
      console.log('userId: ' + localStorage.getItem('userId'));
      router.push('/front/home');
    } else {
      alert('登录失败：' + response.data.message);
    }
  } catch (error) {
    console.error('登录出错:', error);
    alert('登录出错，请稍后再试');
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
  color:#756e6e
}
a:hover{
  color:#e5cdb4
}
</style>