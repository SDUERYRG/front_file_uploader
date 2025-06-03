<template>
  <div class="search-container">
    <h3>搜索关键词：{{ keyword }}</h3>
    <div class="result-count">找到 {{ files.length }} 个结果</div>

    <el-table :data="files" style="width: 100%">
      <el-table-column prop="filename" label="文件名"></el-table-column>
      <el-table-column prop="filetype" label="类型" width="120"></el-table-column>
      <el-table-column prop="filesize" label="大小" width="120">
        <template #default="{ row }">
          {{ formatSize(row.filesize) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="text" @click="download(row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      files: [],
      keyword: ''
    };
  },
  mounted() {
    this.keyword = this.$route.query.keyword || '';
    this.loadResults();
  },
  methods: {
    loadResults() {
      this.$request.get('/api/file/search?keyword=' + this.keyword).then(res => {
        console.log("后端返回的数据: ", res);
        if (res.data.code === 200) {
          this.files = res.data.data; // 确保 res.data 是一个数组
          console.log("更新后的文件列表: ", this.files);
        } else {
          this.$message.error(res.msg);
        }
      }).catch(err => {
        console.error("请求错误: ", err);
        this.$message.error('请求失败，请重试');
      });
    },
    formatSize(size) {
      if (size > 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(1) + 'MB';
      }
      return (size / 1024).toFixed(1) + 'KB';
    },
    download(file) {
      window.open(`/api/file/download/${file.id}`, '_blank');
    }
  }
};
</script>

<style scoped>
.search-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.result-count {
  margin: 15px 0;
  color: #666;
}
</style>