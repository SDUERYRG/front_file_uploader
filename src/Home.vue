<template>
  <div>
    <h1>欢迎来到主页</h1>
    <div class="upload-dialog">
      <div class="upload-demo">
        <el-upload
          v-if="!hasPreviewImage && !previewFile"
          drag
          action="http://localhost:8080/helloworld"
          :on-success="handleFileChange"
          style="width: 60%;"
          >
          <el-icon style="font-size: 24px;"><Document /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <div v-if="hasPreviewImage" style="position: relative;">
          <img :src="previewImage" alt="Preview" style="width: 400px; height: 300px; object-fit: contain;" @mouseenter="showCloseIcon = true" @mouseleave="showCloseIcon = false" />
          <el-icon v-if="showCloseIcon" style="position: absolute; top: 10px; right: 10px; font-size: 24px; cursor: pointer;" @mouseenter="showCloseIcon = true" @click="clearPreviewImage();"><Close /></el-icon>
        </div>
        <div v-if="previewFile" style="margin-top: 10px; display: flex; align-items: center; background-color: white; padding: 10px; width: 300px;height: 100px;">
          <img id="icon_image" :src="previewFile" alt="File Icon" style="width: 90px; height: 90px; margin-right: 10px; object-fit: contain;">
          </img>
          <span>{{ fileName }}</span>
        </div>
      </div>
      <el-button style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);" @click="">悬浮按钮</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import request from './api/request';

const previewImage = ref('');
const showCloseIcon = ref(false);
const hasPreviewImage = ref(false);
const previewFile = ref('');
const fileName = ref('');

// 仅仅在选择文件后回显预览图片，不进行上传操作，response我不知道为什么写
const handleFileChange = async (response: any, file: any) => {
  console.log(response);
  const fileType = file.raw.name.split('.').pop()?.toUpperCase(); // 获取文件类型
  console.log(fileType);

  if (response == true) {
    try {
      const formData = new FormData();
      formData.append('file', file.raw);
      const isImage = file.raw.type.indexOf('image') > -1;
      if (isImage) {
        const reader = new FileReader();
        reader.readAsDataURL(file.raw);
        reader.onload = () => {
          console.log(file.raw.name);
          previewImage.value = reader.result as string;
          alert(previewImage.value);
          hasPreviewImage.value = true;
        };
      } else {
        previewFile.value = "/src/assets/" + fileType + ".svg";
        hasPreviewImage.value = false;
        fileName.value = file.raw.name;
        console.log(previewFile.value);
        document.getElementById('icon_image')!.setAttribute('src', previewFile.value);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }
};

const clearPreviewImage = () => {
  previewImage.value = '';
  hasPreviewImage.value = false;
};



</script>

<style scoped>
.upload-dialog{
    display: flex; 
    justify-content: center; 
    align-items: center; 
    height: 100%;
}
.upload-demo {
    width: 800px; 
    height: 600px; 
    background-color: antiquewhite; 
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center;
}
</style>