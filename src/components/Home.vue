<template>
  <div>
    <el-button type="info" @click="logOut">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 点击首页退出按钮
    logOut() {
      // 清空浏览器本地的token值
      window.sessionStorage.clear()
      // 退出跳转到login页面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>