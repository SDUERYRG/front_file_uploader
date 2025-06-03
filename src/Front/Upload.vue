<template>
  <div class="upload-manager">
    <div class="header">
      <h2><i class="el-icon-upload2"></i> 我的上传</h2>
      <el-button type="primary" @click="goBack" class="back-btn">
        <i class="el-icon-back"></i> 返回文件库
      </el-button>
    </div>

    <div class="content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <div v-else-if="files.length === 0" class="empty">
        <i class="el-icon-upload"></i>
        <p>您还没有上传过文件~</p>
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
              <span>大小: {{ formatSize(file.filesize) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="file-actions">
            <el-button
                type="danger"
                size="small"
                plain
                :loading="file.deleting"
                @click.stop="deleteFile(file)"
            >
              <i class="el-icon-delete"></i> 删除文件
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { Close, Document } from '@element-plus/icons-vue'
import PDF from '@/assets/file-icons/PDF.svg';
import DOC from '@/assets/file-icons/DOC.svg';
import DOCX from '@/assets/file-icons/DOCX.svg';
import EXCEL from '@/assets/file-icons/EXCEL.svg';
import PPT from '@/assets/file-icons/PPT.svg';
import PPTX from '@/assets/file-icons/PPTX.svg';
import TXT from '@/assets/file-icons/TXT.svg';
import FILE from '@/assets/file-icons/FILE.svg';
import ZIP from '@/assets/file-icons/ZIP.svg';
import IMAGE from '@/assets/file-icons/IMAGE.svg';
import VIDEO from '@/assets/file-icons/VIDEO.svg';

export default {
  name: 'UploadManager',
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('xm-user') || {}),
      files: [],
      loading: true,
      baseUrl: 'http://localhost:8080', // 后端地址
      fileTypes: {
        pdf: PDF,
        doc: DOC,
        docx: DOCX,
        xls: EXCEL,
        ppt: PPT,
        pptx: PPTX,
        txt: TXT,
        zip: ZIP,
        rar: ZIP,
        gz: ZIP,
        default: FILE
      },
    };
  },
  created() {
    this.loadFiles();
  },
  methods: {
    // 获取文件列表
    async loadFiles() {
      try {
        this.loading = true;

        if (!this.currentUser || !this.currentUser.id) {
          throw new Error('用户未登录');
        }

        const response = await axios.get(
            `${this.baseUrl}/api/file/byUser`,
            { params: { userId: this.currentUser.id } }
        );

        console.log('文件byUser:', response);
        if (response.data.code === 200) {
          this.files = response.data.data.map(file => ({
            ...file,
            deleting: false,
            upload_time: file.created_at
          }));
        } else {
          throw new Error(response.data.message || '获取文件失败');
        }
      } catch (error) {
        ElMessage.error(error.message);
      } finally {
        this.loading = false;
      }
    },

    // 删除文件（逻辑删除）
    async deleteFile(file) {
      // 确认删除
      const confirmed = await this.$confirm(
        `确定要删除文件 "${file.filename}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(() => false);

      if (!confirmed) return;

      try {
        // 设置删除状态
        file.deleting = true;

        const response = await axios.put(
          `${this.baseUrl}/api/file/logicDelete`,
          null,
          {
            params: {
              userId: this.currentUser.id,
              fileId: file.id
            }
          }
        );

        if (response.data.status === 'success') {
          ElMessage.success('文件删除成功');
          
          // 从列表中移除该文件
          this.files = this.files.filter(f => f.id !== file.id);
        } else {
          throw new Error(response.data.message || '删除失败');
        }
      } catch (error) {
        console.error('删除文件失败:', error);
        ElMessage.error(error.response?.data?.message || error.message || '删除失败');
      } finally {
        // 无论成功还是失败都要移除loading状态
        file.deleting = false;
      }
    },

    // 页面导航
    goBack() {
      this.$router.go(-1);
    },
    navTo(url) {
      location.href = url
    },
    // 辅助方法
    getFileIcon(filetype) {
      if (!filetype) return FILE; // 处理空文件类型情况

      const ext = filetype.toLowerCase();

      // 扩展文件类型映射
      const typeMap = {
        // 文档类型
        pdf: PDF,
        doc: DOC,
        docx: DOCX,
        xls: EXCEL,
        xlsx: EXCEL,
        txt: TXT,

        // 图片类型
        png: IMAGE,
        jpg: IMAGE,
        jpeg: IMAGE,
        gif: IMAGE,
        bmp: IMAGE,
        webp: IMAGE,
        svg: IMAGE,

        // 演示文稿
        ppt: PPT,
        pptx: PPTX,

        // 压缩文件
        zip: ZIP,
        rar: ZIP,
        '7z': ZIP,
        gz: ZIP,
        tar: ZIP,

        // 视频文件
        mp4: VIDEO,
        mov: VIDEO,
        avi: VIDEO,
        mkv: VIDEO,
        wmv: VIDEO,
        flv: VIDEO,

        // // 音频文件
        // mp3: AUDIO,
        // wav: AUDIO,
        // ogg: AUDIO,

        // // 代码文件
        // js: CODE,
        // java: CODE,
        // py: CODE,
        // cpp: CODE,
        // html: CODE,
        // css: CODE,
        // php: CODE,
        // xml: CODE,
        // json: CODE,
        // sql: CODE
      };

      return typeMap[ext] || FILE; // 确保总是返回一个图标
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
    formatSize(bytes) {
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    },
    isImageFile(filetype) {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      console.log('isImageFile:', imageTypes.includes((filetype || '').toLowerCase()))
      return imageTypes.includes((filetype || '').toLowerCase());
    },
    getImagePreview(fileId) {
      return `${this.baseUrl}/api/file/preview/${fileId}`;
    },
    handleImageError(event, filetype) {
      event.target.src = this.getFileIcon(filetype);
    },
  }
};
</script>

<style lang="scss" scoped>
.upload-manager {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    color: #606266;
    i {
      color: #e6a23c;
      margin-right: 8px;
    }
  }
}

.content {
  min-height: 400px;
}

.loading {
  padding: 50px 0;
  text-align: center;
}

.empty {
  text-align: center;
  padding: 80px 0;

  i {
    font-size: 120px;
    color: #c0c4cc;
  }
}

.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.file-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
}

.file-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.file-info {
  flex-grow: 1;
  margin-left: 15px;

  .file-name {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 5px;
  }

  .file-meta {
    font-size: 12px;
    color: #909399;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.file-actions {
  text-align: right;

  button {
    margin-left: 8px;
  }
}
</style>