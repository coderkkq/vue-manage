<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 事先准备好的dom盒子 -->
      <div id="main" style="width: 800px; height: 450px"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from "echarts";
// 导入合并对象的方法
import {merger} from '../../common/util'
export default {
  data() {
    return {
      // 这是需要合并的数据
      options: {
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  },
  created() {},
  methods: {},
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById("main"));
    // 发起请求
    const { data: res } = await this.$http.get("reports/type/1");
    // console.log(res);
    if (res.meta.status !== 200) {
      return this.$message.error("获取数据失败！");
    }
    // 合并对象
    res.data = merger(res.data, this.options)
    console.log(res.data);
    // 获取数据成功后 ，绘制图表
    myChart.setOption(res.data);
   
  },
};
</script>

<style lang="less" scoped>
</style>