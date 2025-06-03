<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../api/request'

interface FileItem {
  id: number
  filename: string
  filetype: string
  filesize: number
  lookednum: number
  collectnum: number
  downloadnum: number
}

export default defineComponent({
  name: "Download",
  setup() {
    const router = useRouter()
    const downloadFiles = ref<FileItem[]>([])
    const loading = ref(false)

    // 获取当前用户ID
    const getCurrentUserId = (): number | null => {
      const userStr = localStorage.getItem('xm-user')  // 正确：应该使用'xm-user'
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.id
      }
      return null
    }

    // 获取下载记录
    const fetchDownloadFiles = async () => {
      const userId = getCurrentUserId()
      console.log('=== 调试信息 ===')
      console.log('当前用户ID:', userId)
      console.log('localStorage中的原始数据:', localStorage.getItem('xm-user'))
      
      if (!userId) {
        console.error('用户未登录')
        router.push('/login')
        return
      }

      loading.value = true
      try {
        console.log('发送请求URL:', `/api/download/getUserDownloads?userId=${userId}`)
        
        const response = await request.get('/api/download/getUserDownloads', { userId })
        
        console.log('API完整响应:', response)
        console.log('响应状态码:', response.data.code)
        console.log('响应数据:', response.data)
        console.log('响应消息:', response.data.message)

        if (response.data.code === 200) {
          downloadFiles.value = response.data.data || []
          console.log('下载文件列表:', downloadFiles.value)
        } else {
          console.error('获取下载记录失败:', response.data.message)
        }
      } catch (error) {
        console.error('请求失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 格式化文件大小
    const formatFileSize = (size: number): string => {
      if (!size) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB']
      let index = 0
      let fileSize = size
      
      while (fileSize >= 1024 && index < units.length - 1) {
        fileSize /= 1024
        index++
      }
      
      return `${fileSize.toFixed(1)} ${units[index]}`
    }

    // 获取文件图标
    const getFileIcon = (filetype: string): string => {
      const type = filetype?.toLowerCase() || ''
      const iconMap: { [key: string]: string } = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'mp4': 'fas fa-file-video',
        'avi': 'fas fa-file-video',
        'mov': 'fas fa-file-video',
        'mp3': 'fas fa-file-audio',
        'wav': 'fas fa-file-audio',
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive',
        'txt': 'fas fa-file-alt'
      }
      return iconMap[type] || 'fas fa-file'
    }

    // 下载文件
    const downloadFile = async (fileId: number) => {
      const userId = getCurrentUserId()
      if (!userId) {
        console.error('用户未登录')
        return
      }

      try {
        const url = `/api/file/download/${fileId}?userId=${userId}`
        const link = document.createElement('a')
        link.href = url
        link.download = ''
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('下载失败:', error)
      }
    }

    // 跳转到文件详情
    const goToDetail = (fileId: number) => {
      router.push(`/front/detail?id=${fileId}`)
    }

    // 判断是否为图片文件
    const isImageFile = (filetype: string): boolean => {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      return imageTypes.includes((filetype || '').toLowerCase());
    };

    // 获取图片预览URL
    const getImagePreview = (fileId: number): string => {
      return `http://localhost:8080/api/file/preview/${fileId}`;
    };

    // 图片加载失败时回退到文件类型图标
    const handleImageError = (event: Event, filetype: string) => {
      const target = event.target as HTMLImageElement;
      target.src = getFileIcon(filetype);
    };

    onMounted(() => {
      fetchDownloadFiles()
    })

    return {
      downloadFiles,
      loading,
      formatFileSize,
      getFileIcon,
      downloadFile,
      goToDetail,
      isImageFile,
      getImagePreview,
      handleImageError
    }
  }
})
</script>

<template>
  <div class="download-container">
    <div class="page-header">
      <h2><i class="fas fa-download"></i> 我的下载</h2>
      <div class="stats">
        <span>共 {{ downloadFiles.length }} 个文件</span>
      </div>
    </div>

    <div class="content-area">
      <!-- 空状态 -->
      <div v-if="downloadFiles.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-download"></i>
        </div>
        <h3>暂无下载记录</h3>
        <p>您还没有下载过任何文件</p>
        <router-link to="/front/home" class="btn-primary">
          <i class="fas fa-search"></i> 去浏览文件
        </router-link>
      </div>

      <!-- 文件列表 -->
      <div v-else class="files-grid">
        <div 
          v-for="file in downloadFiles" 
          :key="file.id" 
          class="file-card"
          @click="goToDetail(file.id)"
        >
          <div class="file-icon">
            <img
              :src="isImageFile(file.filetype) ? getImagePreview(file.id) : getFileIcon(file.filetype)"
              alt="文件图标"
              @error="handleImageError($event, file.filetype)"
              style="max-width: 80px; max-height: 80px; object-fit: contain; border-radius: 8px;"
            />
          </div>
          
          <div class="file-info">
            <h4 class="file-name" :title="file.filename">{{ file.filename }}</h4>
            <div class="file-meta">
              <span class="file-type">{{ file.filetype }}</span>
              <span class="file-size">{{ formatFileSize(file.filesize) }}</span>
            </div>
            <div class="file-stats">
              <span><i class="fas fa-eye"></i> {{ file.lookednum || 0 }}</span>
              <span><i class="fas fa-heart"></i> {{ file.collectnum || 0 }}</span>
              <span><i class="fas fa-download"></i> {{ file.downloadnum || 0 }}</span>
            </div>
          </div>

          <div class="file-actions">
            <button 
              @click.stop="downloadFile(file.id)" 
              class="btn-download"
              :title="'下载 ' + file.filename"
            >
              <i class="fas fa-download"></i>
            </button>
            <button 
              @click.stop="goToDetail(file.id)" 
              class="btn-view"
              title="查看详情"
            >
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span>加载中...</span>
    </div>
  </div>
</template>

<style scoped>
.download-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.page-header h2 {
  color: #333;
  margin: 0;
  font-weight: 600;
}

.page-header h2 i {
  color: #007bff;
  margin-right: 10px;
}

.stats {
  color: #666;
  font-size: 14px;
}

.content-area {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 20px 0 10px;
  color: #333;
}

.btn-primary {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background: #0056b3;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.file-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.file-icon {
  font-size: 36px;
  color: #007bff;
  margin-bottom: 15px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.file-type {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
}

.file-stats {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #888;
}

.file-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-actions {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.file-card:hover .file-actions {
  opacity: 1;
}

.btn-download,
.btn-view {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.btn-download:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-view:hover {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading i {
  font-size: 24px;
  margin-right: 10px;
}

@media (max-width: 768px) {
  .files-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>