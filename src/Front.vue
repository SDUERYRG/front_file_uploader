<template>
  <div>
    <!--头部-->
    <div class="front-header">
      <div class="front-header-left">
        <img src="@/assets/1.jpg" alt="">
        <div class="title">
          <a href="#" @click="navTo('/front/home')">
            文件共享网站
          </a>
          </div>
      </div>
      <div class="front-header-center">
        <div class="front-header-nav">
          <div class="front-header-center" style="text-align: right">
            <el-input style="width: 200px" placeholder="请输入文件名称" v-model="name"></el-input>
            <el-button type="primary" style="margin-left: 5px" @click="search">搜素</el-button>
          </div>
        </div>
      </div>
      <div class="front-header-right">
        <div v-if="!user.username">
          <el-button @click="$router.push('/')">登录</el-button>
          <el-button @click="$router.push('/register')">注册</el-button>
        </div>
        <div v-else>
          <el-dropdown @command="handleCommand" trigger="click">
            <!-- 触发区域 -->
            <div class="front-header-dropdown">
              <div v-if="!avatarUrl" class="empty-avatar user-avatar">
                <i class="el-icon-user"></i>
              </div>
              <img v-else :src="avatarUrl" class="user-avatar">
              <span class="user-name">{{ user.name || user.username }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </div>

            <!-- 下拉菜单内容（必须使用 template 插槽） -->
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="person">
                  <i class="el-icon-user"></i> 个人中心
                </el-dropdown-item>
                <el-dropdown-item command="home">
                  <i class="el-icon-house"></i> 首页
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <i class="el-icon-switch-button"></i> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <!--主体-->
    <div class="main-body">
      <router-view ref="child" @update:user="updateUser" />
    </div>
  </div>

</template>

<script>
export default {
  name: "FrontLayout",

  data () {
    return {
      top: '',
      name:'',
      baseUrl: 'http://localhost:8081'
    }
  },
  computed: {
    user() {
      return JSON.parse(localStorage.getItem("xm-user") || '{}');
    },
    avatarUrl() {
      if (!this.user.avatar) return null;

      // 如果已经是完整的URL，直接使用
      if (this.user.avatar.startsWith('http')) {
        return this.user.avatar;
      }

      // 否则拼接基础URL
      return this.baseUrl + this.user.avatar;
    }
  },
  mounted() {
  },
  methods: {
    handleCommand(command) {
      switch(command) {
        case 'person':
          this.$router.push('/front/person');
          break;
        case 'home':
          this.$router.push('/front/home');
          break;
        case 'logout':
          this.logout();
          break;
      }
    },
    // 修改后的退出方法
    logout() {
      localStorage.removeItem("xm-user");
      this.$router.push("/");
      this.$message.success('退出成功');
    },
    updateUser() {
      this.user = JSON.parse(localStorage.getItem('xm-user') || '{}')   // 重新获取下用户的最新信息
    },
    navTo(url) {
      location.href = url
    },
    search() {
      if (this.name.trim() === '') {
        this.$message.warning('请输入搜索关键词');
        return;
      }
      this.$router.push(`/front/search?keyword=${this.name}`);
    },
    logUser() {
      console.log(localStorage.getItem('xm-user'));
    }
  }
}
</script>

<style scoped>
  @import "@/assets/css/front.css";
  /* front.css */
  /* 强制提升下拉菜单层级 */
  .el-popper {
    z-index: 9999 !important;
  }

  /* 用户区域悬停效果 */
  .front-header-dropdown {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 100%;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .front-header-dropdown:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* 头像和文字样式 */
  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-right: 8px;
  }
  .user-name {
    font-size: 14px;
    color: #333;
  }

  /* 修复下拉菜单位置偏移 */
  .el-dropdown-menu {
    margin: 5px 0 !important;
  }
</style>