<template>
  <div class="main-content">
    <el-card style="width: 50%; margin: 30px auto">
      <div style="text-align: right; margin-bottom: 20px">
        <el-button type="primary" @click="openPasswordDialog">修改密码</el-button>
      </div>
      <el-form :model="user" label-width="80px" style="padding-right: 20px">
        <div style="margin: 15px; text-align: center">
          <el-upload
              class="avatar-uploader"
              :action="baseUrl + '/upload/avatar'"
              :headers="headers"
              :data="{ userId: user.id }"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeUpload"
          >
            <!-- 使用动态时间戳防止缓存 -->
            <img
                v-if="user.avatar"
                :src="getAvatarUrl(user.avatar)"
                class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" placeholder="用户名" disabled></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="user.name" placeholder="姓名"></el-input>
        </el-form-item>
        <div style="text-align: center; margin-bottom: 20px">
          <el-button type="primary" @click="update">保 存</el-button>
        </div>
      </el-form>
    </el-card>
    <el-dialog
        title="修改密码"
        v-model="passwordDialogVisible"
        width="30%"
        center
        @closed="resetPasswordForm"
    >
      <el-form
          :model="pwdForm"
          :rules="pwdRules"
          ref="passwordForm"
          label-width="120px"
      >
        <el-form-item label="原始密码" prop="oldPassword">
          <el-input
              v-model="pwdForm.oldPassword"
              placeholder="请输入原始密码"
              type="password"
              show-password
          ></el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="pwdForm.newPassword"
              placeholder="请输入新密码"
              type="password"
              show-password
          ></el-input>
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
              v-model="pwdForm.confirmPassword"
              placeholder="请再次输入新密码"
              type="password"
              show-password
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="passwordDialogVisible = false">取 消</el-button>
        <el-button
            type="primary"
            @click="updatePassword"
            :loading="passwordLoading"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import md5 from 'js-md5';
export default {
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.pwdForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      // 直接从当前URL获取基础路径
      baseUrl: 'http://localhost:8081',
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      cacheKey: Date.now(),
      dialogVisible: false,
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
      },
      uploading: false,
      passwordDialogVisible: false, // 控制对话框显示
      passwordLoading: false,       // 提交按钮加载状态

      // 密码修改表单
      pwdForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      pwdRules: {
        oldPassword: [
          { required: true, message: '请输入原始密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    // 初始化时也获取最新数据
    if (this.user && this.user.id) {
      this.fetchLatestUserData();
    } else {
      // 使用本地存储作为后备
      this.user = JSON.parse(localStorage.getItem('xm-user') || '{}');
      this.cacheKey = Date.now();
    }
  },
  methods: {
    update() {
      const updateData = {
        id: this.user.id,
        name: this.user.name,
        avatar: this.user.avatar
      };

      console.log("发送更新请求:", updateData);

      this.$request.put('/user/update', updateData).then(response => {
        console.log("完整响应对象:", response);

        // +++ 关键修改：处理不同的响应结构 +++
        let res = response;

        // 如果响应有 data 属性，使用 data
        if (response.data && (response.data.code !== undefined || response.data.id)) {
          res = response.data;
        }

        console.log("处理后的响应数据:", res);

        // 检查是否成功（兼容多种响应结构）
        let isSuccess = false;
        let userData = null;

        if (res.code === 200) {
          isSuccess = true;
          userData = res.data;
        } else if (res.id) { // 如果直接返回用户对象
          isSuccess = true;
          userData = res;
        } else if (res.status === 200) { // 其他可能的成功状态
          isSuccess = true;
          userData = res.data || res;
        }

        if (isSuccess) {
          this.$message.success('保存成功');

          // 更新本地存储
          localStorage.setItem('xm-user', JSON.stringify(userData));

          // 显示刷新提示
          this.$message.info('页面即将刷新以更新信息');

          // 显示加载动画
          const loading = this.$loading({
            lock: true,
            text: '正在刷新页面...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });

          // 1秒后刷新页面
          setTimeout(() => {
            loading.close();
            window.location.reload();
          }, 1000);
        } else {
          // 尝试提取错误信息
          let errorMsg = '保存失败: 未知错误';

          if (res.msg) {
            errorMsg = res.msg;
          } else if (res.message) {
            errorMsg = res.message;
          } else if (res.error) {
            errorMsg = res.error;
          } else if (typeof res === 'string') {
            errorMsg = res;
          }

          this.$message.error(errorMsg);
        }
      }).catch(error => {
        console.error('更新请求失败:', error);

        let errorMessage = '更新失败';
        if (error.response) {
          // 从响应中提取错误信息
          errorMessage += `: ${error.response.status} ${error.response.statusText}`;

          // 尝试解析响应体中的错误信息
          const responseData = error.response.data || {};
          if (responseData.msg) {
            errorMessage += ` - ${responseData.msg}`;
          } else if (responseData.message) {
            errorMessage += ` - ${responseData.message}`;
          } else if (typeof responseData === 'string') {
            errorMessage += ` - ${responseData}`;
          }
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }

        this.$message.error(errorMessage);
      });
    },

    // +++ 新增方法：获取最新用户数据 +++
    // Person.vue
    fetchLatestUserData() {
      if (!this.user || !this.user.id) {
        console.error('用户ID不存在');
        this.$message.error('无法获取用户信息: 用户ID不存在');
        return;
      }

      const userId = this.user.id;
      console.log("开始获取最新用户数据，用户ID:", userId);

      const url = `/user/getById/${userId}`;
      console.log("请求URL:", url);

      // 调用接口获取最新用户数据
      this.$request.get(url).then(response => {
        console.log("完整响应对象:", response);

        // +++ 关键修改：处理不同的响应结构 +++
        let res = response;

        // 如果响应有 data 属性，使用 data
        if (response.data && response.data.code !== undefined) {
          res = response.data;
        }

        console.log("处理后的响应数据:", res);

        if (res.code === 200 && res.data) {
          console.log("获取的最新用户数据:", res.data);

          // 更新组件状态
          this.user = {
            ...this.user,          // 保留原有字段
            name: res.data.name,   // 更新名称
            avatar: res.data.avatar // 更新头像
          };

          // 更新本地存储
          localStorage.setItem('xm-user', JSON.stringify(this.user));

          // 更新头像缓存
          this.cacheKey = Date.now();

          // 强制刷新视图
          this.$forceUpdate();

          this.$message.success('用户信息已更新');
        } else {
          const errorMsg = res.msg || `未知错误，状态码: ${res.code}`;
          console.error('获取用户信息失败:', errorMsg);
          this.$message.error('获取用户信息失败: ' + errorMsg);
        }
      }).catch(error => {
        console.error('获取用户信息请求失败:', error);

        let errorMsg = error.message;
        if (error.response) {
          // 从响应中提取错误信息
          errorMsg = `请求失败: ${error.response.status} ${error.response.statusText}`;
          if (error.response.data && error.response.data.msg) {
            errorMsg += ` - ${error.response.data.msg}`;
          }
        }

        this.$message.error('获取用户信息失败: ' + errorMsg);
      });
    },


    // 获取带时间戳的头像URL
    getAvatarUrl(avatarPath) {
      if (!avatarPath) return '';

      // 如果已经是完整URL，直接使用
      if (avatarPath.startsWith('http')) {
        return `${avatarPath}?t=${this.cacheKey}`;
      }

      // 否则添加基础路径和时间戳
      return `${this.baseUrl}${avatarPath}?t=${this.cacheKey}`;
    },

    // 头像上传成功处理
    handleAvatarSuccess(response) {
      if (response && response.code === 200) {
        this.$message.success(response.message || '头像上传成功');

        // +++ 使用响应式更新 +++
        this.$set(this.user, 'avatar', response.data);

        // 更新本地存储
        const userCopy = JSON.parse(JSON.stringify(this.user));
        localStorage.setItem('xm-user', JSON.stringify(userCopy));

        // 更新缓存键
        this.cacheKey = Date.now();
      }
    },


    // 上传前校验
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('只能上传图片格式!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过2MB!')
        return false
      }

      return true
    },
    // 打开密码修改对话框
    openPasswordDialog() {
      this.passwordDialogVisible = true;
      // 重置表单验证状态
      this.$nextTick(() => {
        if (this.$refs.passwordForm) {
          this.$refs.passwordForm.clearValidate();
        }
      });
    },

    // 重置密码表单
    resetPasswordForm() {
      this.pwdForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },

    // 更新密码方法
    updatePassword() {
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          this.passwordLoading = true;

          // 构造请求参数
          const params = {
            userId: this.user.id,
            oldPassword: this.pwdForm.oldPassword,
            newPassword: this.pwdForm.newPassword
          };

          this.$request.post('/user/updatePassword', params)
              .then(response => {
                this.passwordLoading = false;

                // 处理响应数据
                let res = response;
                if (response.data && (response.data.code !== undefined || response.data.id)) {
                  res = response.data;
                }

                if (res.code === 200 || res.status === 200) {
                  this.$message.success('密码修改成功');
                  this.passwordDialogVisible = false;

                  // 可选：清除本地存储并重新登录
                  localStorage.removeItem('xm-user');
                  localStorage.removeItem('token');
                  this.$router.push('/login');
                } else {
                  const errorMsg = res.msg || res.message || '密码修改失败';
                  this.$message.error(errorMsg);
                }
              })
              .catch(error => {
                this.passwordLoading = false;

                let errorMessage = '密码修改失败';
                if (error.response) {
                  errorMessage += `: ${error.response.status}`;
                  if (error.response.data && error.response.data.msg) {
                    errorMessage += ` - ${error.response.data.msg}`;
                  }
                }

                this.$message.error(errorMessage);
              });
        } else {
          return false;
        }
      });
    },
  }
}
</script>

<style scoped>
.el-form-item__label {
  font-weight: bold;
}
.el-upload {
  border-radius: 50%;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  border-radius: 50%;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 50%;
}
</style>