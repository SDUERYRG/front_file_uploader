<template>
  <div class="main-content">
    <div style="width: 80%; background-color: white; min-height: 1000px; margin: 20px auto; border-radius: 20px; padding: 20px">
      <!-- 文件头信息区域 -->
      <div style="display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #eee">
        <div style="margin-right: 20px">
          <img :src="getFileIcon(fileData.filetype)" alt="文件图标" style="width: 80px; height: 80px">
        </div>
        <div style="flex-grow: 1">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px">{{ fileData.filename }}</div>
          <div style="display: flex; flex-wrap: wrap; color: #666; font-size: 14px">
            <div style="margin-right: 20px">上传者: {{ fileData.uploader || '未知' }}</div>
            <div style="margin-right: 20px">浏览量: {{ fileData.lookednum || 0 }}</div>
            <div style="margin-right: 20px">收藏量: {{ fileData.collectnum || 0 }}</div>
            <div>下载量: {{ fileData.downloadnum || 0 }}</div>
          </div>
        </div>
        <div>
          <el-button type="warning" @click="toggleCollect" :disabled="!currentUser" style="margin-right: 10px">
            {{ isCollected ? '已收藏' : '收藏' }}
          </el-button>
          <el-button type="primary" @click="downloadFile">下载</el-button>
        </div>
      </div>

      <!-- 标签页区域 -->
      <div style="margin-top: 30px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="文件预览" name="preview">
            <div v-if="isImageFile(fileData.filetype)">
              <img
                :src="getImagePreview(fileId)"
                alt="图片预览"
                style="max-width: 100%; max-height: 700px; display: block; margin: 20px auto; border-radius: 10px;"
                @error="handleImageError"
              />
            </div>
            <div v-else-if="previewUrl" style="height: 700px; margin-top: 20px">
              <iframe :src="previewUrl" style="width: 100%; height: 100%; border: none; border-radius: 10px"></iframe>
            </div>
            <div v-else style="text-align: center; padding: 50px; color: #999">
              该文件类型不支持预览
            </div>
          </el-tab-pane>

          <el-tab-pane label="用户评论" name="comments">
            <div style="margin-top: 20px">
              <!-- 评论表单 -->
              <div style="margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px">
                <el-input
                    type="textarea"
                    :rows="3"
                    placeholder="请输入您的评论..."
                    v-model="newComment"
                    style="margin-bottom: 15px"
                ></el-input>
                <div style="text-align: right">
                  <el-button type="primary" @click="submitComment" :disabled="!currentUser || !newComment.trim()">发表评论</el-button>
                </div>
              </div>

              <!-- 评论列表 -->
              <div v-for="(comment, index) in comments" :key="index" style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee">
                <div style="display: flex">

                  <div style="margin-right: 15px">
                    <!-- 添加加载状态提示 -->
                    <div v-if="comments.length === 0" style="text-align: center; padding: 40px; color: #999">
                      {{ loadingComments ? '加载用户信息中...' : '暂无评论' }}
                    </div>

                    <!-- 修改头像显示逻辑 -->
                    <el-avatar
                        :size="40"
                        :src="comment.avatar"
                        @error="handleAvatarError(comment)">
                    </el-avatar>
                  </div>
                  <div style="flex-grow: 1;color:black;">
                    <div style="display: flex; justify-content: space-between;">
                      <div style="font-weight: bold">{{ comment.name }}</div>
                      <div style="color: #999; font-size: 13px">{{ formatDate(comment.time) }}</div>
                    </div>
                    <div style="margin-top: 8px; padding-left: 10px; text-align: left;">{{ comment.content }}</div>
                  </div>
                </div>
              </div>

              <div v-if="comments.length === 0" style="text-align: center; padding: 40px; color: #999">
                暂无评论，快来发表第一条评论吧~
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import defaultAvatar from '@/assets/1.jpg';

// 导入SVG图标
import pdfIcon from '@/assets/file-icons/PDF.svg';
import docIcon from '@/assets/file-icons/DOC.svg';
import docxIcon from '@/assets/file-icons/DOCX.svg';
import excelIcon from '@/assets/file-icons/EXCEL.svg';
import pptIcon from '@/assets/file-icons/PPT.svg';
import pptxIcon from '@/assets/file-icons/PPTX.svg';
import imageIcon from '@/assets/file-icons/IMAGE.svg';
import zipIcon from '@/assets/file-icons/ZIP.svg';
import txtIcon from '@/assets/file-icons/TXT.svg';
import videoIcon from '@/assets/file-icons/VIDEO.svg';
import defaultFileIcon from '@/assets/file-icons/FILE.svg';

export default {
  data() {
    return {
      fileId: null,
      fileData: {
        filename: '',
        filetype: '',
        uploader: '',
        lookednum: 0,
        collectnum: 0,
        downloadnum: 0
      },
      activeTab: 'preview',
      previewUrl: '',
      comments: [],
      newComment: '',
      isCollected: false,
      defaultAvatar: defaultAvatar,
      currentUser: JSON.parse(localStorage.getItem('xm-user')||'{}'),

      // 图标映射
      fileIcons: {
        pdf: pdfIcon,
        doc: docIcon,
        docx: docxIcon,
        xls: excelIcon,
        xlsx: excelIcon,
        ppt: pptIcon,
        pptx: pptxIcon,
        jpg: imageIcon,
        jpeg: imageIcon,
        png: imageIcon,
        gif: imageIcon,
        zip: zipIcon,
        rar: zipIcon,
        txt: txtIcon,
        mp4: videoIcon,
        avi: videoIcon,
        mov: videoIcon
      }
    };
  },
  created() {
    this.parseRouteParams();
  },
  watch: {
    '$route': {
      immediate: true,
      deep: true,
      handler(to) {
        this.parseRouteParams();
      }
    }
  },
  mounted() {
    if (this.parseRouteParams()) {
      this.reloadPageData();
      this.loadPreview();
    } else {
      this.$message.error('页面参数错误，请重新进入');
      this.$router.push('/front/home');
    }
  },
  methods: {
    parseRouteParams() {
      this.fileId = this.$route.params.id || this.$route.query.id;

      if (!this.fileId || this.fileId === 'undefined') {
        console.error('文件ID无效:', this.fileId);
        this.$message.error('文件参数错误');
        return false;
      }

      this.fileId = Number(this.fileId);
      return true;
    },

    reloadPageData() {
      if (!this.parseRouteParams()) {
        return;
      }

      console.log('加载文件数据，ID:', this.fileId);
      this.loadFileDetail();
      this.loadComments();
      this.recordLooked();
      this.checkCollectStatus();
      this.loadPreview();
    },

    getFileIcon(fileType) {
      if (!fileType) return defaultFileIcon;
      const lowerType = fileType.toLowerCase();

      for (const [key, icon] of Object.entries(this.fileIcons)) {
        if (lowerType.includes(key)) {
          return icon;
        }
      }

      return defaultFileIcon;
    },

    async loadFileDetail() {
      if (!this.fileId || isNaN(this.fileId)) {
        console.error('文件ID无效:', this.fileId);
        this.$message.error('文件参数错误');
        return;
      }

      try {
        const detailRes = await axios.get(`http://localhost:8080/api/file/getFileDetail?id=${this.fileId}`);
        console.log('文件详情:', detailRes);
        if (detailRes.data.code === 200) {
          this.fileData = detailRes.data.data;
        } else {
          this.$message.error('获取文件详情失败');
        }
      } catch (error) {
        console.error('获取文件详情失败:', error);
        this.$message.error('获取文件详情失败');
      }
    },

    async recordLooked() {
      if (!this.currentUser) return;
      if (!this.fileId || isNaN(this.fileId)) return;

      try {
        await axios.post('http://localhost:8080/api/looked/add', null, {
          params: {
            userId: this.currentUser.id,
            fileId: this.fileId
          }
        });
      } catch (error) {
        console.error('记录浏览失败:', error);
      }
    },

    async checkCollectStatus() {
      if (!this.currentUser || !this.fileId) return;

      try {
        const res = await axios.get('http://localhost:8080/api/collect/status', {
          params: {
            userId: this.currentUser.id,
            fileId: this.fileId
          }
        });

        if (res.data.code === 200) {
          this.isCollected = res.data.data; // 直接使用布尔值更新状态
        }
      } catch (error) {
        console.error('检查收藏状态失败:', error);
      }
    },

    async toggleCollect() {
      if (!this.currentUser) {
        this.$message.warning('请先登录');
        return;
      }
      if (!this.fileId || isNaN(this.fileId)) return;

      try {
        const isAdd = !this.isCollected;
        const endpoint = isAdd ? 'http://localhost:8080/api/collect/add' : 'http://localhost:8080/api/collect/remove';

        // 发送收藏/取消收藏请求
        await axios.post(endpoint, null, {
          params: {
            userId: this.currentUser.id,
            fileId: this.fileId
          }
        });

        // 强制重新加载文件详情和收藏状态
        await this.loadFileDetail();
        await this.checkCollectStatus();

        // 根据操作类型显示成功消息
        this.$message.success(isAdd ? '收藏成功' : '已取消收藏');

      } catch (error) {
        console.error('操作失败:', error);
        this.$message.error('操作失败，请重试');
      }
    },

    async loadComments() {
      if (!this.fileId || isNaN(this.fileId)) return;

      this.loadingComments = true;

      try {
        const res = await axios.get(`http://localhost:8080/api/comment/getByFileId/${this.fileId}`);
        console.log('评论数据:', res.data); // 调试输出

        if (res.data.code === 200 && res.data.data) {
          // 直接使用后端返回的评论数据
          this.comments = res.data.data;

          // 为每条评论添加用户信息
          for (const comment of this.comments) {
            if (comment.userid) {
              try {
                const userRes = await axios.get(`http://localhost:8080/user/getById/${comment.userid}`);
                console.log('用户信息:', userRes.data);

                if (userRes.data.code === 200 && userRes.data.data) {
                  const user = userRes.data.data;
                  comment.name = user.name || '用户' + comment.userid;

                  // 修改这里：将相对路径转换为完整URL
                  if (user.avatar) {
                    // 确保头像URL是完整路径
                    if (!user.avatar.startsWith('http')) {
                      // 添加服务器基础URL
                      comment.avatar = `http://localhost:8080${user.avatar}`;
                    } else {
                      comment.avatar = user.avatar;
                    }
                  } else {
                    comment.avatar = this.defaultAvatar;
                  }
                }
              } catch (error) {
                console.error('获取用户信息失败:', error);
                comment.name = '未知用户';
                comment.avatar = this.defaultAvatar;
              }
            }
          }
        } else {
          this.$message.error('获取评论失败: ' + (res.data.msg || ''));
        }
      } catch (error) {
        console.error('获取评论失败:', error);
        this.$message.error('获取评论失败: ' + error.message);
      } finally {
        this.loadingComments = false;
      }
    },

    async submitComment() {
      if (!this.currentUser) {
        this.$message.warning('请先登录');
        return;
      }

      if (!this.newComment.trim()) {
        this.$message.warning('评论内容不能为空');
        return;
      }

      try {
        const comment = {
          userid: this.currentUser.id,
          fileid: this.fileId,
          content: this.newComment
        };

        const res = await axios.post('http://localhost:8080/api/comment/add', comment);
        if (res.data.code === 200) {
          this.$message.success('评论发表成功');
          this.newComment = '';
          await this.loadComments();
        } else {
          this.$message.error('评论发表失败');
        }
      } catch (error) {
        console.error('发表评论失败:', error);
        this.$message.error('发表评论失败');
      }
    },

    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },

    handleAvatarError(comment) {
      // 只有当头像URL有效但加载失败时才替换
      if (comment.avatar && comment.avatar !== this.defaultAvatar) {
        comment.avatar = this.defaultAvatar;
        return false;
      }
      return true; // 允许显示默认头像
    },

    // 新增：下载文件功能
    async downloadFile() {
      if (!this.currentUser) {
        this.$message.warning('请先登录');
        return;
      }

      if (!this.fileId) {
        this.$message.error('文件ID无效');
        return;
      }

      try {
        // 构造下载URL，包含用户ID以记录下载
        const downloadUrl = `http://localhost:8080/api/file/download/${this.fileId}?userId=${this.currentUser.id}`;
        
        // 创建隐藏的下载链接
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = this.fileData.filename || '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.$message.success('开始下载文件');
        
        // 重新加载文件详情以更新下载次数
        setTimeout(() => {
          this.loadFileDetail();
        }, 1000);

      } catch (error) {
        console.error('下载失败:', error);
        this.$message.error('下载失败');
      }
    },

    // 新增：加载文件预览
    async loadPreview() {
      if (!this.fileId) return;

      try {
        // 根据文件类型决定预览方式
        const fileType = this.fileData.filetype?.toLowerCase() || '';
        
        if (this.canPreview(fileType)) {
          // 设置预览URL
          this.previewUrl = `http://localhost:8080/api/file/file/preview/${this.fileId}`;
        } else {
          this.previewUrl = '';
        }
      } catch (error) {
        console.error('加载预览失败:', error);
        this.previewUrl = '';
      }
    },

    // 新增：判断文件是否可预览
    canPreview(fileType) {
      const previewableTypes = [
        'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
        'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'
      ];
      return previewableTypes.includes(fileType);
    },

    isImageFile(filetype) {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      return imageTypes.includes((filetype || '').toLowerCase());
    },

    getImagePreview(fileId) {
      return `http://localhost:8080/api/file/preview/${fileId}`;
    },

    handleImageError(event) {
      event.target.alt = '图片加载失败';
      event.target.src = require('@/assets/file-icons/IMAGE.svg'); // 或其它默认图片
    }
  }
};
</script>

<style scoped>
.main-content {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 20px 0;
}

.el-tabs {
  margin-top: 20px;
}

.el-avatar {
  background-color: #f0f2f5;
}
</style>