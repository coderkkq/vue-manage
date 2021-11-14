<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="">
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logOut">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px': '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <!-- 开启router，以index为path进行跳转 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#3d8bf3"
          unique-opened
          :collapse='isCollapse'
          :collapse-transition='false'
          router  
          :default-active= 'activePath'
        >
          <!-- 一级菜单 -->
          <!-- 这里的 index 是指下拉的唯一标识，需要字符串 不加唯一标识点击菜单就会全部菜单跟着打开-->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="subItem.path" v-for="subItem in item.children" 
            :key="subItem.id" @click="saveNavState(subItem.path)">
              <!-- 一级菜单模板区 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 菜单字体图标设置
      iconsObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠菜单栏
      isCollapse: false,
      // 被激活的地址
      activePath: ''
    }
  },
  created() {
    this.getMenulist()
    // 首页组件创建后左侧导航高亮显示选中状态
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 点击首页退出按钮
    logOut() {
      // 清空浏览器本地的token值
      window.sessionStorage.clear();
      // 退出跳转到login页面
      this.$router.push("/login");
    },
    async getMenulist() {
      const {data: res} = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.menulist = res.data
      // console.log(res);
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      // 这里window存一下是为了存储activePath的值，页面跳转会保持
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #363d40;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #313743;
  .toggle-button {
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #e9edf1;
}
.iconfont {
  margin-right: 10px;
}
</style>