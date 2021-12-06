<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效   模板区域 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: green"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 模板区域 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 模板区域 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditAddCateDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options：用来指定数据源 -->
          <!-- props 用来指定配置对象-->
          <!-- v-model 用来绑定选中的 商品的名称 为数组结构 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            expandTrigger="hover"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <!-- 编辑分类表单区域 -->
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <!-- 编辑表单尾部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表，默认为空
      cateList: [],
      // 网络请求参数
      queryInfo: {
        type: 3,
        // 页码
        pagenum: 1,
        // 每页显示数据条数
        pagesize: 5,
      },
      // 商品分类 总的数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "isOk",
        },
        {
          label: "排序",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "order",
        },
        {
          label: "操作",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "opt",
        },
      ],
      // 监听添加分类对话框的显示和隐藏
      addCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0,
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名", trigger: "blur" },
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 用value指定选中的商品分类名称（这里指定唯一id）
        value: "cat_id",
        label: "cat_name",
        children: "children",
        // 配置级联选择器是否可以选中第一级
        checkStrictly: true,
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制编辑分类对话框的显示和隐藏
      editCateDialogVisible: false,
      // 编辑表单绑定的数据
      editCateForm: {},
      // 编辑表单验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const data = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      let res = data.res
      if (res.meta.status == 200) {
        console.log("chenggong");
      } else {
        return this.$message.error("获取商品分类数据失败！");
      }
      console.log(res.data);
      // 保存商品分类数据
      this.cateList = res.data.result;
      // 保存商品分类总的数据条数
      this.total = res.data.total;
    },
    // 监听分页区域一页显示多少条数据的改变(pageSize的改变)，点击切换数据条数
    // 这里的newSize是组件中可以获取到的
    handleSizeChange(newSize) {
      // console.log(newSize);
      // 将每页获取的数据条数赋值给参数 pagesize
      this.queryInfo.pagesize = newSize;
      // 对修改后的参数重新发送网络请求获取数据
      this.getCateList();
    },
    // 监听pagenum（页码值）变化,点击切换页码值
    handleCurrentChange(newNum) {
      // console.log(newNum);
      // 为请求参数赋值为 newNum
      this.queryInfo.pagenum = newNum;
      // 发送网络请求
      this.getCateList();
    },
    // 点击添加分类按钮，显示添加分类对话框
    showAddCateDialog() {
      // 获取父级分类数据列表
      this.getParentCateList();
      // 展示对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: {
          type: 2,
        },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败！");
      }
      console.log(res.data);
      // 保存父级分类列表
      this.parentCateList = res.data;
    },
    // 监听父级分类中value值的变化
    parentCateChanged() {
      // console.log(this.selectedKeys);
      // 如果selectedKets 数组中的length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 将数组中的最后一个父级分类id赋值给参数中的 cat_pid 值
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        // 参数中的 cat_level 跟随id数组的长度变化
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // else: 如果没有父级，则默认id为0， 默认level为0
        // id默认值0
        this.addCateForm.cat_pid = 0;
        // level 默认值0
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击添加分类 确认按钮，添加新的分类
    addCate() {
      // console.log(this.addCateForm);
      // 调用表单的validate方法 对整个表单进行验证
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        // 校验成功后 发送网络请求 添加分类
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败!");
        }
        // 刷新分类列表
        this.getCateList();
        this.$message.success("添加分类成功！");
        // 隐藏对话框
        this.addCateDialogVisible = false;
      });
    },
    // 关闭对话框，重置表单数据(监听对话框的close事件)
    addCateDialogClosed() {
      // 调用表单的重置方法
      this.$refs.addCateFormRef.resetFields();
      // 清空级联选择器的 selectedKeys 数组
      this.selectedKeys = [];
      // 将表单里面的cat_pid 和 cat_level设置为0
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // 点击编辑按钮 显示 编辑分类对话框
    async showEditAddCateDialog(id) {
      this.editCateDialogVisible = true;
      // 根据id值查询分类,发送网络请求
      const { data: res } = await this.$http.get("categories/" + id);
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("查询分类失败");
      }
      // 存储分类信息
      this.editCateForm = res.data;
    },
    // 监听编辑按钮对话框的关闭事件
    editCateDialogClosed() {
      // 调用form表单的重置方法 清空表单
      this.$refs.editCateFormRef.resetFields();
    },
    // 点击编辑分类确认按钮，校验表单信息，发送网络请求 修改分类名称
    editFormInfo() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        // console.log(valid);  // vaild是一个Boolean值(指验证结果)
        if (!valid) return;
        // 发送网络请求修改分类信息
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          {
            cat_name: this.editCateForm.cat_name,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改分类名称失败！");
        }
        this.$message.success("修改分类名称成功！");
        this.getCateList();
        this.editCateDialogVisible = false;
      });
    },
    // 根据id 删除 指定分类
    async removeCateById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 如果取消了，返回取消的信息
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      // 点击确认发送网络请求
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status !== 200) {
        this.$message.error("删除分类失败！");
      }
      this.$message.success("删除分类成功！");
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
// 树形控件
.treeTable {
  margin-top: 15px;
}
// 级联选择器
.el-cascader {
  width: 100%;
}
.el-cascader-panel {
  height: 500px;
}
</style>