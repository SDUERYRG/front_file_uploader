<template>
  <div class="history-container">
    <div class="header">
      <h2><i class="el-icon-time"></i> 我的浏览历史</h2>
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
        <i class="el-icon-clock"></i>
        <p>还没有浏览记录~</p>
      </div>

      <!-- 文件列表 -->
      <div v-else class="file-list">
        <div
            v-for="file in files"
            :key="file.id"
            class="file-item"
        >
          <!-- 文件图标 -->
          <div class="file-item" @click="navTo('/front/detail?fileId=' + file.fileid)">
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
                <span>浏览时间: {{ formatDate(file.time) }}</span>
                <span>上传者: {{ file.uploader || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
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
  name: 'HistoryPage',
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('xm-user') || {}),
      files: [],
      loading: true,
      baseUrl: 'http://localhost:8080',
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
    this.loadHistoryFiles();
  },
  methods: {
    navTo(url) {
      location.href = url
    },
    async loadHistoryFiles() {
      try {
        this.loading = true;

        if (!this.currentUser?.id) {
          this.$message.warning('请先登录');
          this.loading = false;
          return;
        }

        // 1. 获取浏览记录
        const historyRes = await axios.get(
            `${this.baseUrl}/api/looked/user/${this.currentUser.id}`
        );

        if (historyRes.data.code !== 200) {
          throw new Error(historyRes.data.message || '获取浏览记录失败');
        }

        const rawRecords = historyRes.data.data;
        const processedRecords = this.processHistory(rawRecords);
        const fileIds = [...new Set(processedRecords.map(r => r.fileid))];

        console.log("需要查询的文件ID:", fileIds);

        // 2. 逐个获取文件详情
        this.files = await Promise.all(processedRecords.map(async (record) => {
          try {
            const res = await axios.get(`${this.baseUrl}/api/file/getFileDetail`, {
              params: { id: record.fileid }
            });

            if (res.data.code === 200 && res.data.data) {
              const fileData = res.data.data;
              return {
                ...record,
                filename: fileData.filename,
                filetype: fileData.filetype,
                category: fileData.category || '未分类',
                uploader: fileData.uploader || '未知',
                size: fileData.size || 0
              };
            } else {
              throw new Error(res.data.msg || '文件查询失败');
            }
          } catch (error) {
            console.error(`文件 ${record.fileid} 查询失败:`, error);
            return {
              ...record,
              filename: `文件获取失败 (ID: ${record.fileid})`,
              filetype: 'error',
              category: '查询失败',
              uploader: '未知',
              size: 0
            };
          }
        }));

        this.loading = false;
      } catch (error) {
        console.error('历史记录加载错误:', error);
        this.$message.error('加载历史记录失败: ' + (error.message || '未知错误'));
        this.loading = false;
      }
    },
    // 处理历史记录去重并排序
    processHistory(records) {
      console.log("原始浏览记录:", records);

      const grouped = records.reduce((acc, record) => {
        // 确保有有效的fileid
        if (!record.fileid) {
          console.warn('无效记录，缺少fileid:', record);
          return acc;
        }

        if (!acc[record.fileid]) {
          acc[record.fileid] = record;
        } else {
          if (new Date(record.time) > new Date(acc[record.fileid].time)) {
            acc[record.fileid] = record;
          }
        }
        return acc;
      }, {});

      const result = Object.values(grouped)
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .map(file => ({
            ...file,
            id: file.fileid, // 确保有唯一的id
            removing: false
          }));

      console.log("处理后的浏览记录:", result);
      return result;
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
    goBack() {
      this.$router.go(-1);
    },
    getFileIcon(fileType) {
      console.log('当前文件类型:', fileType)
      if (!fileType) return defaultFileIcon;
      const lowerType = fileType.toLowerCase();

      for (const [key, icon] of Object.entries(this.fileIcons)) {
        if (lowerType.includes(key)) {
          return icon;
        }
      }

      return defaultFileIcon;
    },
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    isImageFile(filetype) {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      return imageTypes.includes((filetype || '').toLowerCase());
    },
    getImagePreview(fileId) {
      return `${this.baseUrl}/api/file/preview/${fileId}`;
    },
    handleImageError(event, filetype) {
      event.target.src = this.getFileIcon(filetype);
    }
  }
};
</script>

<style lang="scss" scoped>
.history-container {
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