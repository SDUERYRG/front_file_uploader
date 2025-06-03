<template>
  <div class="file-list-page">
    <h2>{{ currentCategory }} 文件</h2>
    <el-table :data="files" style="width: 100%">
      <el-table-column prop="filename" label="文件名">
        <template #default="{ row }">
          <div class="file-item">
            <img :src="getFileIcon(row.filetype)" class="file-icon">
            <span class="file-name" @click="navToDetail(row.id)">{{ row.filename }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="大小" width="120">
        <template #default="{ row }">
          {{ formatSize(row.filesize) }}
        </template>
      </el-table-column>
      <el-table-column prop="filetype" label="类型" width="120"/>
    </el-table>
  </div>

</template>


<script>
export default {
  data() {
    return {
      currentCategory: '',
      files: [],
      previewVisible: false,
      currentFile: {},
      fileContent: null,
      previewUrl: '',
      textContent: ''
    }
  },
  created() {
    this.currentCategory = decodeURIComponent(this.$route.query.category);
    this.loadFiles();
  },
  computed:{
    isTextFile() {
      return ['txt'].includes(this.currentFile.filetype?.toLowerCase());
    },
    isImageFile() {
      return ['jpg', 'jpeg', 'png'].includes(this.currentFile.filetype?.toLowerCase());
    },
    isPdfFile() {
      return this.currentFile.filetype?.toLowerCase() === 'pdf';
    },
    isOfficeFile() {
      const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
      return officeTypes.includes(this.currentFile.filetype?.toLowerCase());
    }
  },
  methods: {
    async loadFiles() {
      try {
        const res = await this.$request.get(`/api/file/byCategory?category=${encodeURIComponent(this.currentCategory)}`);
        if (res.data.code === 200) {
          this.files = res.data.data.map(item => ({
            id: item.id,
            filename: item.filename,
            filetype: item.filetype,
            filesize: item.filesize
          }));
          console.log('Mapped files:', this.files);
          if (this.files.length === 0) {
            this.$message.info('当前分类下没有文件');
          }
        } else {
          this.$message.error(`加载失败: ${res.data.msg}`);
        }
      } catch (error) {
        this.$message.error('请求失败: ' + (error.response?.data?.msg || error.message));
        this.files = [];
      }
    },
    getFileIcon(fileType) {
      // 定义文件类型与图标名称的映射（注意大小写）
      const iconMap = {
        jpg: 'IMAGE',
        jpeg: 'IMAGE',
        png: 'IMAGE',
        doc: 'DOC',
        docx: 'DOCX',
        xlsx: 'EXCEL',
        ppt: 'PPT',
        pptx: 'PPTX',
        pdf: 'PDF',
        txt: 'TXT',
        zip: 'ZIP',
        vue: 'VUE'
      };

      // 获取小写类型名
      const type = fileType.toLowerCase();
      // 获取图标文件名（默认使用 FILE.svg）
      const iconName = iconMap[type] || 'FILE';

      // 动态加载路径（核心代码）
      return new URL(`../assets/file-icons/${iconName}.svg`, import.meta.url).href;
    },
    formatSize(size) {
      const fileSize = Number(size);
      if (isNaN(fileSize)) return '未知大小';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(fileSize) / Math.log(k));
      return parseFloat((fileSize / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    /*async handlePreview(file) {
      try {
        if (!file?.id) {
          this.$message.error('文件ID缺失');
          return;
        }

        // ================== 请求地址构造 ==================
        const baseURL = this.$request?.defaults?.baseURL || '/api';
        this.previewUrl = `${window.location.origin}/api/file/preview/${file.id}`;
        console.log('完整预览地址:', this.previewUrl);

        // ================== 打开预览弹窗 ==================
        this.previewVisible = true;
        this.currentFile = file;
        this.fileContent = null;

        // ================== 文本文件特殊处理 ==================
        if (this.isTextFile) {
          console.log('[前端调试] 开始加载文本文件内容');
          try {
            // 直接使用预览地址获取内容
            const { data } = await this.$request.get(this.previewUrl, {
              transformResponse: [(data) => data], // 保留原始数据
              responseType: 'text' // 强制以文本形式接收
            });

            console.log('[前端调试] 文本文件响应数据:', data);
            this.textContent = data;
          } catch (error) {
            console.error('[前端错误] 文本文件加载失败:', error);
            this.$message.error('文本内容加载失败');
          }
        }
      } catch (error) {
        console.error('[前端错误] 预览流程异常:', {
          error: error.message,
          stack: error.stack,
          response: error.response?.data
        });

        this.$message.error(`预览失败: ${
            error.response?.data?.msg ||
            error.message ||
            '未知错误'
        }`);
      }
    },*/
    downloadFile(file) {
      const link = document.createElement('a');
      link.href = this.previewUrl;
      link.download = file.filename;
      link.click();
    },
    // 新增导航到详情页方法
    navToDetail(fileId) {
      this.$router.push({
        path: '/front/detail',
        query: { id: fileId }
      });
    }
  }
}
</script>
<style scoped>
.file-icon {
  padding: 5px;
  width: 30px;        /* 控制宽度 */
  height: 30px;       /* 控制高度 */
  object-fit: contain; /* 保持图标比例不拉伸 */
  vertical-align: middle; /* 与文字对齐 */
}
.file-name {
  cursor: pointer;
  color: #409EFF;
  margin-left: 8px;
  transition: color 0.3s;
}

.file-name:hover {
  color: #66b1ff;
  text-decoration: underline;
}

/* 新增样式 */
.pdf-iframe,
.default-iframe {
  width: 100%;
  height: 70vh;
  border: none;
  background: #fff;
}

.text-preview {
  white-space: pre-wrap;
  max-height: 70vh;
  overflow: auto;
  padding: 10px;
  background: #f5f5f5;
}
</style>