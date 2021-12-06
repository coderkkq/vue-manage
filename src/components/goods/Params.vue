<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            expandTrigger="hover"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData">
            <!-- 展开行 -->
              <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 点击 添加参数的表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 表单底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="eiitDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 点击 编辑参数的表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 表单底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="eiitDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择器选中的分类id数组
      selectedCateKeys: [],
      // 级联选择框的配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // tabs标签页 v-model默认选中 first 选项（被激活状态）
      activeName: "many",
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加参数对话框的显示和隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: "",
      },
      // 添加表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 控制编辑对话框的显示和隐藏
      eiitDialogVisible: false,
      // 修改的变淡数据对象
      editForm: {},
      // 编辑表单的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 解决了共享value和显示隐藏的bug，这里可以注释掉
      // // 控制按钮与文本框的显示和隐藏
      // inputVisible: false,
      // // 文本框中输入的内容
      // inputValue: ''
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类所有列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    // 级联选择框选中项变化，会触发这个函数
    // 证明选中的是三级分类
    // 选中三级分类后调用请求参数列表的方法获取数据
    // 由于文档说明 只可以选中三级分类，所以需要帅选逻辑：
    // 证明选中的不是三级分类
    handleChange() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      this.getParamsData();
    },
    // tabs 标签点击事件触发函数
    handleClick() {
      // console.log(this.activeName);
      this.getParamsData();
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 根据所选分类id，和当前所处数据的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败！");
      }
      res.data.forEach((item) => {
        // 解决出现文本为空却出现删除按钮的 bug，先判断参数是否有属性，若无，则返回空数组
        item.attr_vals = item.attr_vals
          ? (item.attr_vals = item.attr_vals.split(","))
          : [];
        // 解决共享绑定value和input显示和隐藏的bug
        // 为每一个商品都添加一个value 和 控制显示和隐藏的值
        //  控制文本框的显示和隐藏
        item.inputVisible = false;
        // 文本框中输入的值
        item.inputValue = "";
      });
      console.log(res.data);
      // 获取到数据后，根据‘切换状态’判断数据存放位置
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      }
      this.onlyTableData = res.data;
    },
    // 监听添加参数对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击确认按钮，添加参数（发送网络请求）
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        // 变淡验证通过，发送网络请求
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加失败！");
        }
        this.$message.success("添加成功！");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    // 点击编辑按钮展示编辑对话框
    async showEditDialog(id) {
      this.eiitDialogVisible = true;
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        { params: { attr_sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败！");
      }
      this.editForm = res.data;
      console.log(this.editForm);
    },
    // 点击关闭对话框重置表单数据
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 编辑对话框确认按钮 修改参数
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败！");
        }
        this.$message.success("修改参数成功！");
        this.getParamsData();
        this.eiitDialogVisible = false;
      });
    },
    // 监听删除参数按钮,删除对应id的参数
    async removeParams(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 用户取消了删除的操作
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      // 删除的业务逻辑
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败！");
      }
      this.$message.success("删除参数成功！");
      this.getParamsData();
    },
    // 文本框失去焦点或者按下enter键都会触发
    handleInputConfirm(row) {
      // 判断是否输入的是空字符串
      // trim()方法是去除字符串首尾空格
      if(row.inputValue.trim().length === 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return 
      }
      // 如果没有return 则执行下面的内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = '';
      row.inputVisible = false;
      // 发送网络请求修改数据库数据
     this.saveAttrVals(row)
    },
    // 封装修改参数网络请求的方法,tab标签数值的变化
    async saveAttrVals(row) {
       const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
      {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if(res.meta.status !== 200) {
        return this.$message.error('修改参数失败！')
      }
      this.$message.success('修改参数项成功！')
    },
    // 点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // 点击按钮自动获得焦点
       this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    // 删除对应的参数可选项
    handleClose(i,row) {
      row.attr_vals.splice(i,1)
       this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() { 
      return this.selectedCateKeys.length !== 3 ? true : false
    },
    // 当前选中的三级分类id
    cateId() {
      return this.selectedCateKeys.length === 3 ? this.selectedCateKeys[2] : null
    },
    // 动态计算标题文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.el-col {
  margin: 15px 0;
}
.el-tag {
  margin-left: 7px;
}
.el-input {
  width: 120px;
}
</style>