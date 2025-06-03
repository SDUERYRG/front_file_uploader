<template>
  <div class="main-content">
    <div style="height: 80px; background-color: #ffd29a">
    </div>
    <div style="display: flex">
      <div class="left">
      </div>
      <div style="width: 80%; background-color: white; ">
        <div style="color: saddlebrown; margin: 15px 0 15px 18px; font-weight: bold; font-size: 25px; text-align: left;">
          文件分类
        </div>
        <div style="display: flex; margin: 0 25px">
          <div style="flex: 2">
            <div class="category-list">
              <div
                  v-for="category in categories"
                  :key="category.name"
                  class="category-item"
                  @click="navToCategory(category.name)"
              >
                <img
                    :src="getCategoryIcon(category.icon)"
                    class="category-icon"
                    @error="handleIconError"
                    :alt="category.name + '图标'"
                >
                <div class="category-info">
                  <span class="category-name">{{ category.name }}</span>
                  <span class="file-count">({{ category.count }})</span>
                </div>
              </div>
            </div>
          </div>
          <div style="flex: 5; height: 300px; background-color: #ffedd6">
            <div>
              <div height="300px" style="border-radius: 10px">
                <div style="border-radius: 10px">
                  <!-- 上传组件 -->
                  <div class="upload-demo">
                    <el-upload
                        ref="uploadRef"
                        v-if="!uploadData.hasPreviewImage && !uploadData.previewFile"
                        drag
                        :auto-upload="false"
                        :on-change="handleFileChange"
                        :show-file-list="false"
                        style="width: 100%;">
                      <el-icon style="font-size: 24px;"><Document /></el-icon>
                      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>

                    <!-- 图片预览 -->
                    <div v-if="uploadData.hasPreviewImage" style="position: relative; margin-top: 20px">
                      <img :src="uploadData.previewImage"
                           alt="Preview"
                           style="width: 100%; max-height: 300px; object-fit: contain;"
                           @mouseenter="uploadData.showCloseIcon = true"
                           @mouseleave="uploadData.showCloseIcon = false">
                      <el-icon v-if="uploadData.showCloseIcon"
                               style="position: absolute; top: 10px; right: 10px; font-size: 24px; cursor: pointer;"
                               @click="clearPreview">
                        <Close />
                      </el-icon>
                    </div>

                    <!-- 文件预览 -->
                    <div v-if="uploadData.previewFile"
                         style="margin-top: 20px; display: flex; align-items: center;color:black;
            background-color: white; padding: 10px; width: 100%;">
                      <img :src="uploadData.previewFile"
                           alt="File Icon"
                           style="width: 90px; height: 90px; margin-right: 10px; object-fit: contain;">
                      <div>
                        <div style="font-weight: 500">{{ uploadData.fileName }}</div>
                        <div style="color: #666; font-size: 12px">{{ uploadData.fileSize }}</div>
                      </div>
                    </div>

                    <!-- 上传按钮 -->
                    <div class="upload-actions">
                      <el-button
                          style="width: 200px;"
                          type="primary"
                          :loading="uploadData.uploading"
                          @click="uploadFile"
                      >
                        {{ uploadData.uploading ? '上传中...' : '确认上传' }}
                      </el-button>
                      <el-button
                          style="width: 200px; margin-left: 10px;"
                          @click="cancelUpload"
                          v-if="uploadData.myFile"
                      >
                        取消上传
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style="margin-top: 30px; display: flex">
              <div style="flex: 1">
                <el-carousel height="300px" style="border-radius: 10px">
                  <el-carousel-item v-for="item in carousel_left">
                    <img :src="item" alt="" style="width: 100%; height: 200px; border-radius: 10px">
                  </el-carousel-item>
                </el-carousel>
              </div>
              <div style="flex: 1; margin-left: 5px">
                <el-carousel height="300px" style="border-radius: 10px">
                  <el-carousel-item v-for="item in carousel_right">
                    <img :src="item" alt="" style="width: 100%; height: 200px; border-radius: 10px">
                  </el-carousel-item>
                </el-carousel>
              </div>
            </div>
          </div>
          <div style="flex: 3; height: 530px;border-radius: 10px; background-color: #fff6eb">
            <div style="text-align: center; margin-top: 30px">
              <div v-if="!avatarUrl" class="empty-avatar user-avatar">
                <i class="el-icon-user"></i>
              </div>
              <img v-else :src="avatarUrl" class="user-avatar">
              <div style="margin-top: 10px; color: black">Hi，{{user.username}}</div>
            </div>
            <div style="margin-top: 20px; padding: 0 15px">
                            <img src="@/assets/imgs/文件分享.jpg" alt="" style="height: 150px; width: 100%; border-radius: 20px">
            </div>
            <div style="display: flex; margin-top: 50px">
                            <div style="flex: 1; text-align: center">
                              <img src="@/assets/icons/收藏.jpg" alt="" style="height: 25px; width: 25px">
                              <div><a href="#"  @click="navTo('/front/collect')">我的收藏</a></div>
                            </div>
                            <div style="flex: 1; text-align: center">
                              <img src="@/assets/icons/足迹.jpg" alt="" style="height: 25px; width: 25px">
                              <div><a href="#"  @click="navTo('/front/looked')">浏览历史</a></div>
                            </div>
                            <div style="flex: 1; text-align: center">
                              <img src="@/assets/icons/下载.jpg" alt="" style="height: 25px; width: 25px">
                              <div><a href="#"  @click="navTo('/front/download')">我的下载</a></div>
                            </div>
                            <div style="flex: 1; text-align: center">
                              <img src="@/assets/icons/上传.jpg" alt="" style="height: 25px; width: 25px">
                              <div><a href="#"  @click="navTo('/front/upload')">我的上传</a></div>
                            </div>
            </div>
            <el-button @click="showChangePwdDialog">修改密码</el-button>
          </div>
        </div>
        <div style="margin:40px 0 0 15px; height: 40px; background-color: #eed287; font-size: 20px; color: #fff; width: 130px; font-weight: bold; line-height: 40px; text-align: center; border-radius: 20px">大家都在看</div>
        <div style="margin-left: 5px">
          <el-row>
            <el-col :span="5" v-for="item in viewedData" :key="item.id">
              <div style="cursor: pointer; padding: 10px; border-radius: 8px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s;"
                   @click="goToDetail(item.id)"
                   @mouseenter="e => e.currentTarget.style.transform = 'translateY(-5px)'"
                   @mouseleave="e => e.currentTarget.style.transform = ''">
                <img
                  :src="isImageFile(item.filetype) ? getImagePreview(item.id) : getFileIcon(item.filetype)"
                  alt=""
                  style="width: 100%; height: 175px; object-fit: contain; border-radius: 10px; background: #f5f5f5"
                  @error="handleImageError($event, item.filetype)"
                >
                <div style="margin-top: 10px; font-weight: 500; font-size: 16px; width: 180px; color: #000000FF; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{item.filename}}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; color: #666; font-size: 14px">
                 <span>
          <img src="@/assets/icons/浏览.jpg" alt="浏览量" style="vertical-align: middle; width: 16px; height: 16px; margin-right: 5px;">
          {{ item.lookednum || 0 }}
        </span>
                  <!-- 收藏量图片示意 -->
                  <span>
          <img src="@/assets/icons/收藏.jpg" alt="收藏量" style="vertical-align: middle; width: 16px; height: 16px; margin-right: 5px;">
          {{ item.collectnum || 0 }}
        </span>
                  <!-- 下载量图片示意 -->
                  <span>
          <img src="@/assets/icons/下载.jpg" alt="下载量" style="vertical-align: middle; width: 16px; height: 16px; margin-right: 5px;">
          {{ item.downloadnum || 0 }}
        </span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

<!--        <div style="margin:40px 0 0 15px; height: 40px; background-color: #eed287; font-size: 20px; color: #fff; width: 130px; font-weight: bold; line-height: 40px; text-align: center; border-radius: 20px">猜你喜欢</div>-->
        <div style="margin-left: 5px">
          <!--          <el-row>-->
          <!--            <el-col :span="5" v-for="item in recommendData">-->
          <!--              <img @click="navTo('/front/detail?id='+item.id)"  :src="item.img" alt="" style="width: 100%; height: 175px; border-radius: 10px; border: #cccccc 1px solid">-->
          <!--              <div style="margin-top: 10px; font-weight: 500; font-size: 16px; width: 180px; color: #000000FF; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{item.name}}</div>-->
          <!--              <div style="margin-top: 5px; font-size: 20px; color: #FF5000FF">￥ {{item.price}} / {{item.unit}}</div>-->
          <!--            </el-col>-->
          <!--          </el-row>-->
        </div>
      </div>
      <div class="right">
        <!--        <img src="@/assets/imgs/dogs.png" alt="" style="width: 160%;margin-top: 10px">-->
        <!--        <img src="@/assets/imgs/dogs2.png" alt="" style="width: 100%;margin-top: 200px">-->
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="changePwdDialogVisible" title="修改密码">
      <div>弹窗内容测试</div>
    </el-dialog>
  </div>
</template>

<script>
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
  components: {
    Close,
    Document
  },
  data() {
    return {
      user: JSON.parse(localStorage.getItem('xm-user')||'{}'),
      typeData: [],
      viewedData: [],
      baseUrl: 'http://localhost:8080',
      top: null,
      goodsData:[],
      recommendData:[],
      categories: [],
      // 轮播图数据
      carousel_left: [
        '/carousel/carousel1.svg',
        '/carousel/carousel2.svg',
        '/carousel/carousel3.svg'
      ],
      carousel_right: [
        '/carousel/carousel4.svg',
        '/carousel/carousel5.svg',
        '/carousel/carousel6.svg'
      ],
      uploadData: {
        previewImage: '',
        showCloseIcon: false,
        hasPreviewImage: false,
        previewFile: '',
        fileName: '',
        fileSize: '',
        myFile: null,
        uploading: false,
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
      },
      categoryTags: [
        { name: '文档', icon: DOC },
        { name: '图片', icon: IMAGE },
        { name: 'PPT', icon: PPT },
        { name: '视频', icon: VIDEO },
        { name: '其他', icon: FILE },
        { name: '压缩包', icon: ZIP }
      ],
      changePwdDialogVisible: false,
      changePwdForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  computed:{
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
    this.loadCategories();
    this.loadTopViewedFiles();
  },
  // methods：本页面所有的点击事件或者其他函数定义区
  methods: {
    navTo(url) {
      location.href = url
    },
    goToCollect() {
      this.$router.push('/front/collect');
    },
    loadTopViewedFiles() {
      this.$request.get('/api/file/topViewed').then(res => {
        console.log('热门文件响应:', res);

        // 根据响应结构调整
        if (res.data && res.data.code === 200) {
          this.viewedData = res.data.data;
          console.log('加载的热门文件:', this.viewedData);
        } else if (res.code === 200) {
          // 如果响应结构是 {code:200, data: [...]}
          this.viewedData = res.data;
        } else {
          this.$message.error(res.msg || '加载热门文件失败');
        }
      }).catch(error => {
        console.error('获取热门文件失败:', error);
        this.$message.error('获取热门文件失败');
      })
    },
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
    cancelUpload() {
      this.clearPreview();
      this.$refs.uploadRef?.clearFiles();  // 清除el-upload内部文件列表
    },
    handleFileChange(file) {
      this.uploadData.myFile = file.raw
      const fileExt = file.name.split('.').pop().toLowerCase()
      const isImage = file.raw.type.startsWith('image/')

      // 处理文件大小显示
      this.uploadData.fileSize = this.formatFileSize(file.size)

      if (isImage) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.uploadData.previewImage = e.target.result
          this.uploadData.hasPreviewImage = true
          this.uploadData.previewFile = ''
        }
        reader.readAsDataURL(file.raw)
      } else {
        this.uploadData.fileName = file.name
        this.uploadData.previewFile = this.uploadData.fileTypes[fileExt]
            || this.uploadData.fileTypes.default
        this.uploadData.hasPreviewImage = false
      }
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    clearPreview() {
      this.uploadData = {
        ...this.uploadData,
        previewImage: '',
        previewFile: '',
        hasPreviewImage: false,
        fileName: '',
        fileSize: '',
        myFile: null
      };
    },

    async uploadFile() {
      if (!this.uploadData.myFile) {
        this.$message.warning('请先选择文件');
        return;
      }

      this.uploadData.uploading = true;

      try {
        const formData = new FormData();
        formData.append('file', this.uploadData.myFile);
        formData.append('userId', this.user.id);
        formData.append('fileId', 0);

        const res = await this.$request.post('/api/file/upload', formData);

        // 添加调试信息
        console.log('上传响应:', res);

        if (res.status === 200) {  // 改为 res.code 而不是 res.data.code
          this.$message.success('文件上传成功');
          this.clearPreview();

          // 重新加载分类数据
          await this.loadCategories();
        } else {
          this.$message.error(res.msg || '文件上传失败');  // 改为 res.msg
        }
      } catch (error) {
        console.error('上传错误:', error);
        this.$message.error('上传失败: ' + (error.response?.data?.msg || error.message));
      } finally {
        this.uploadData.uploading = false;
      }
    },
    async loadCategories() {
      try {
        const res = await this.$request.get('/api/file/categories');
        if (res.data.code === 200) {
          // 修正后的映射表（与后台返回的分类名称完全匹配）
          const categoryMap = {
            '文档': 'DOC',
            '图片': 'IMAGE',
            'PPT': 'PPT',  // 原映射表中为'演示文稿': 'PPT'
            '压缩包': 'ZIP',
            '视频': 'VIDEO',  // 新增视频图标
            '其他': 'FILE'     // 使用默认图标
          };

          this.categories = res.data.data.map(cat => ({
            ...cat,
            icon: `/file-icons/${categoryMap[cat.name] || 'FILE'}.svg`
          }));
        }
      } catch (error) {
        console.error('请求失败:', error);
      }
    },
    getCategoryIcon(iconPath) {
      try {
        // 调试日志
        console.log('原始图标路径:', iconPath);

        // 处理路径格式
        const cleanPath = iconPath
            .replace(/^\/?file-icons\//, '')  // 移除开头的/file-icons/
            .replace(/\.svg$/, '');          // 移除.svg后缀

        // 构造正确路径
        const iconName = `${cleanPath}.svg`;
        const fullPath = new URL(`../assets/file-icons/${iconName}`, import.meta.url).href;

        console.log('生成图标路径:', fullPath);
        return fullPath;
      } catch (e) {
        console.error('路径解析错误:', e);
        return new URL('../assets/file-icons/FILE.svg', import.meta.url).href;
      }
    },
    handleIconError(event) {
      console.warn('图标加载失败，使用默认图标', event.target.src);
      event.target.src = new URL('../assets/file-icons/FILE.svg', import.meta.url).href;
      event.target.onerror = null; // 防止循环报错
    },
    navToCategory(category) {
      this.$router.push({
        path: '/front/fileList',
        query: { category: encodeURIComponent(category) }
      });
    },
    goToDetail(fileId) {
      this.$router.push({
        path: '/front/detail',
        query: { id: fileId }
      });
    },
    isImageFile(filetype) {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      return imageTypes.includes((filetype || '').toLowerCase());
    },
    getImagePreview(fileId) {
      return `http://localhost:8080/api/file/preview/${fileId}`;
    },
    handleImageError(event, filetype) {
      event.target.src = this.getFileIcon(filetype);
    },
    showChangePwdDialog() {
      console.log('点击了修改密码');
      this.changePwdDialogVisible = true;
    },


    async submitChangePwd() {
      // 校验
      if (!this.changePwdForm.oldPassword || !this.changePwdForm.newPassword || !this.changePwdForm.confirmPassword) {
        this.$message.warning('请填写完整信息');
        return;
      }
      if (this.changePwdForm.newPassword !== this.changePwdForm.confirmPassword) {
        this.$message.error('两次输入的新密码不一致');
        return;
      }
      // 发送请求
      try {
        const res = await this.$axios.post('/api/user/changePassword', {
          oldPassword: this.changePwdForm.oldPassword,
          newPassword: this.changePwdForm.newPassword
        });
        if (res.data.code === 200) {
          this.$message.success('密码修改成功');
          this.changePwdDialogVisible = false;
        } else {
          this.$message.error(res.data.message || '修改失败');
        }
      } catch (e) {
        this.$message.error('请求失败');
      }
    }
  }
}
</script>

<style scoped>
.main-content {
  min-height: 100vh;
  /*overflow: hidden;*/
  background-size: 100%;
}
.left {
  width: 10%;
  background-repeat: no-repeat;
  background-color: #ffd29a;
}
.right {
  width: 10%;
  background-repeat: no-repeat;
  background-color: #ffd29a;
}
.el-col-5{
  width: 20%;
  max-width: 20%;
  padding: 10px 10px;
}
.upload-demo {
  padding: 70px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.el-upload-dragger {
  background-color: #fafafa;
  border: 2px dashed #e5e7eb;
  transition: border-color 0.3s;
}

.el-upload-dragger:hover {
  border-color: #ffd29a;
}

.preview-container {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
/* 修改确认上传按钮颜色 */
.upload-actions .el-button--primary {
  background-color: #f9c26f !important;
  border-color: #ffd29a !important;
}

/* 悬停和点击状态 */
.upload-actions .el-button--primary:hover,
.upload-actions .el-button--primary:active {
  background-color: #e6b888 !important;
  border-color: #e6b888 !important;
}
.category-list {
  padding: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 8px 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:hover {
  transform: translateX(10px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.category-icon {
  width: 32px;
  height: 32px;
  margin-right: 15px;
}

.category-info {
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.file-count {
  font-size: 12px;
  color: #666;
}
/* 头像和文字样式 */
.user-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin-right: 8px;
}

.category-tags {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 20px 0 20px 18px;
  width: 120px;
}
.category-tag {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background 0.2s;
}
.category-tag:hover {
  background: #fff6eb;
}
.category-tag-icon {
  width: 28px;
  height: 28px;
  margin-right: 10px;
}
.category-tag-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.download-page-layout {
  display: flex;
  flex-direction: row;
}

.category-tags {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 40px 0 0 18px;
  width: 120px;
}
.category-tag {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background 0.2s;
}
.category-tag:hover {
  background: #f5f7fa;
}
.category-tag-icon {
  width: 28px;
  height: 28px;
  margin-right: 10px;
}
.category-tag-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}
</style>