<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="30">
        <el-col :span="8">
          <el-input
            size="medium"
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-button type="primary" @click="addGoods"
            >添加商品</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goods" style="width: 100%" border>
        <el-table-column label="#" width="50" type="index"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="620">
        </el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="80">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80">
        </el-table-column>
        <el-table-column
          prop="add_time"
          label="创建时间"
          width="160"
        ></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editFormDialog(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteForm(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!----------------------------- 划分 ------------------------------------->
    <!-- 编辑对话框 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="editGoods"
        :rules="editFormRules"
        ref="editFormDialog"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editGoods.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editGoods.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量">
          <el-input v-model="editGoods.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="创建时间" prop="add_time">
          <el-input v-model="editGoods.add_time"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getYMDHMS } from "../../common/util";
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        // 第几页
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 5,
      },
      goods: [],
      total: 0,
      // 编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑商品数据
      editGoods: {},
      // 编辑表单验证规则
      editFormRules: {
        goods_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
          { min: 1, message: "长度在1个字符起", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
          { min: 1, max: 5, message: "长度在 1 到 5 个字符", trigger: "blur" },
        ],
        add_time: [
          { required: true, message: "请输入创建时间", trigger: "blur" },
          { min: 10, message: "长度在 10个字符起", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 封装请求商品列表数据的方法
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      console.log("res", res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表数据失败");
      }
      // 遍历数组，将时间戳转化为时间日期格式
      res.data.goods.forEach((item) => {
        item.add_time = getYMDHMS(item.add_time);
      });
      this.goods = res.data.goods;
      console.log(this.goods);
      this.total = res.data.total;
    },
    // 监听一页显示多少条数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newCurrent) {
      this.queryInfo.pagenum = newCurrent;
      this.getGoodsList();
    },
    // 点击弹出编辑表单对话框
    async editFormDialog(id) {
      this.editDialogVisible = true;
      // 发送网络请求
      const { data: res } = await this.$http.get(`goods/${id}`);
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败！");
      }
      res.data.add_time = getYMDHMS(res.data.add_time);
      this.editGoods = res.data;
      console.log(this.editGoods);
    },
    // 点击确认按钮完成表单编辑
    editForm() {
      this.$refs.editFormDialog.validate(async (valid) => {
        if (!valid) return this.$message.error("表单验证失败！");
        const { data: res } = await this.$http.put(
          "goods/" + this.editGoods.goods_id
        );
        if (res.meta.status !== 200) {
          this.$message.error("更新数据失败！");
        }
        this.getGoodsList();
        this.editDialogVisible = false;
      });
    },
    // 监听删除按钮，删除商品
    deleteForm(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async confirm => {
        //  console.log(confirm);
        if(confirm) {
          const {data: res} = await this.$http.delete('goods/' + id);
          if(res.meta.status !== 200) return this.$message.error('删除数据失败！');
          this.$message.success('删除数据成功！');
          this.getGoodsList();
        }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 点击添加商品按钮
    addGoods() {
      this.$router.push('/goods/add')
    }
  },
};
</script>

<style lang="less" scoped>
</style>