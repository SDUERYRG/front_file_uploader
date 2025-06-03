<template>
  <div class="collect-container">
    <div class="header">
      <h2><i class="el-icon-star-off"></i> 我的收藏</h2>
      <el-button type="primary" @click="goBack" class="back-btn">
        <i class="el-icon-back"></i> 返回文件列表
      </el-button>
    </div>

    <div class="content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <div v-else-if="files.length === 0" class="empty">
        <i class="el-icon-folder-add"></i>
        <p>还没有收藏任何文件~</p>
      </div>

      <!-- 文件列表 -->
      <div v-else class="file-list">
        <div
            v-for="file in files"
            :key="file.id"
            class="file-item"
            @click="navTo('/front/detail?id='+file.id)"
        >
          <!-- 文件图标 -->
          <div class="file-icon">
            <img
              :src="isImageFile(file.filetype) ? getImagePreview(file.id) : getFileIcon(file.filetype)"
              alt="文件图标"
              @error="handleImageError($event, file.filetype)"
            />
          </div>

          <!-- 文件信息 -->
          <div class="file-info">
            <div class="file-name">{{ file.filename }}</div>
            <div class="file-meta">
              <span>上传者: {{ file.uploaderName || '未知' }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="file-actions">
            <el-button
                type="danger"
                size="mini"
                plain
                @click.stop="removeCollect(file.id)"
                :loading="file.removing"
            >
              <i class="el-icon-delete"></i> 取消收藏
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入 axios
import axios from 'axios';

// 导入图标
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
  name: 'CollectPage',
  data() {
    return {
      currentUser:JSON.parse(localStorage.getItem('xm-user') || {}),
      files: [],
      loading: true,
      baseUrl: 'http://localhost:8080', // 后端地址
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
    this.loadCollectFiles();
  },
  methods: {
    navTo(url) {
      location.href = url
    },
    // 获取收藏文件列表
    async loadCollectFiles() {
      try {
        this.loading = true;

        if (!this.currentUser || !this.currentUser.id) {
          this.$message.warning('请先登录');
          this.loading = false;
          return;
        }

        console.log(`请求收藏文件: ${this.baseUrl}/api/collect/user/${this.currentUser.id}`);

        const response = await axios.get(`${this.baseUrl}/api/collect/user/${this.currentUser.id}`);

        console.log('收藏文件响应:', response);

        if (response.data && response.data.code === 200) {
          // 使用Vue.set或展开运算符确保响应式更新
          this.files = response.data.data.map(file => ({
            ...file,
            removing: false,
            uploaderName: '加载中...' // 初始值
          }));

          // 为每个文件获取上传者信息
          await this.loadUploaderNames();
        } else {
          this.$message.error(response.data?.message || '获取收藏文件失败');
          this.files = []; // 清空文件列表
        }
      } catch (error) {
        console.error('获取收藏文件错误:', error);
        this.$message.error(`网络错误: ${error.message}`);
        this.files = []; // 清空文件列表
      } finally {
        this.loading = false;
      }
    },

    async loadUploaderNames() {
      try {
        const userRequests = this.files.map(file => {
          if (!file.userid) {
            return Promise.resolve({
              fileId: file.id,
              userName: '未知用户'
            });
          }

          return axios.get(`${this.baseUrl}/user/getById/${file.userid}`)
              .then(res => {
                if (res.data.code === 200 && res.data.data) {
                  return {
                    fileId: file.id,
                    userName: res.data.data.name || `用户${file.userid}`
                  };
                }
                return {
                  fileId: file.id,
                  userName: '未知用户'
                };
              })
              .catch(error => {
                console.error(`获取用户信息失败: ${file.userid}`, error);
                return {
                  fileId: file.id,
                  userName: '未知用户'
                };
              });
        });

        const results = await Promise.all(userRequests);

        this.files = this.files.map(file => {
          const result = results.find(r => r.fileId === file.id);
          return {
            ...file,
            uploaderName: result?.userName || '未知用户'
          };
        });
      } catch (error) {
        console.error('获取上传者名称失败:', error);
      }
    },

    // 取消收藏
    async removeCollect(fileId) {
      try {
        if (!this.currentUser) {
          this.$message.warning('请先登录');
          return;
        }

        // 确保使用字符串比较（解决ID类型不一致问题）
        const targetId = String(fileId);

        // 设置当前文件的加载状态
        this.files = this.files.map(file => {
          if (String(file.id) === targetId) {
            return { ...file, removing: true };
          }
          return file;
        });

        const response = await axios.post(
            `${this.baseUrl}/api/collect/remove`,
            null,
            {
              params: {
                userId: this.currentUser.id,
                fileId: targetId  // 确保使用字符串ID
              }
            }
        );

        console.log('取消收藏响应:', response.data); // 打印响应数据

        // 修改判断逻辑：根据 status 字段的值（布尔值）判断操作是否成功
        if (response.data && response.data.status === true) {
          this.$message.success(response.data.message || '取消收藏成功');

          // 使用字符串比较确保正确移除
          this.files = this.files.filter(file => String(file.id) !== targetId);
        } else {
          // 使用后端返回的错误消息
          const errorMsg = response.data?.message || '取消失败';
          this.$message.error(errorMsg);

          // 重置加载状态
          this.files = this.files.map(file => {
            if (String(file.id) === targetId) {
              return { ...file, removing: false };
            }
            return file;
          });
        }
      } catch (error) {
        console.error('取消收藏失败:', error);

        // 更详细的错误处理
        if (error.response) {
          console.error('错误响应:', error.response.data);
          this.$message.error(error.response.data?.message || '操作失败，请重试');
        } else {
          this.$message.error('网络错误，请重试');
        }

        // 重置加载状态
        this.files = this.files.map(file => {
          if (String(file.id) === String(fileId)) {
            return { ...file, removing: false };
          }
          return file;
        });
      }
    },

    // 返回上一页
    goBack() {
      this.$router.go(-1);
    },

    // 获取文件图标
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

    // 时间格式化
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },

    // 判断是否为图片文件
    isImageFile(filetype) {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      return imageTypes.includes((filetype || '').toLowerCase());
    },

    // 获取图片预览URL
    getImagePreview(fileId) {
      return `${this.baseUrl}/api/file/file/preview/${fileId}`;
    },

    // 图片加载失败时回退到文件类型图标
    handleImageError(event, filetype) {
      event.target.src = this.getFileIcon(filetype);
    }
  }
};
</script>

<style lang="scss" scoped>
.collect-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;

  h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #606266;

    i {
      color: #e6a23c;
    }
  }
}

.content {
  min-height: 300px;
}

.loading {
  padding: 20px;
}

.empty {
  text-align: center;
  padding: 40px 20px;

  i {
    font-size: 80px;
    color: #c0c4cc;
    margin-bottom: 20px;
  }

  p {
    color: #909399;
    margin-bottom: 20px;
  }
}

.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.file-item {
  display: flex;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.file-icon {
  margin-right: 15px;

  img {
    width: 40px;
    height: 40px;
  }
}

.file-info {
  flex: 1;

  .file-name {
    font-weight: bold;
    margin-bottom: 5px;
    color: #303133;
  }

  .file-meta {
    font-size: 12px;
    color: #909399;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
}

.file-actions {
  display: flex;
  align-items: center;
}
</style>