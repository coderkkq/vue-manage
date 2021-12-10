<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- alert提示框 -->
    <el-alert
      title="消息提示的文案"
      type="info"
      effect="dark"
      show-icon
      center
      :closable="false"
    >
    </el-alert>
    <!-- 步骤条 -->
    <el-steps
      :active="active - 0"
      finish-status="success"
      align-center
      :space="200"
    >
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>

    <!-- 表单 -->
    <el-form
      :model="addForm"
      :rules="addFormRules"
      ref="addFormRef"
      label-width="100px"
      label-position="top"
    >
      <!-- 表单内嵌tabs -->
      <el-tabs
        tabPosition="left"
        v-model="active"
        :before-leave="leaveTab"
        @tab-click="handleClick"
      >
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader
              v-model="addForm.goods_cat"
              :options="goodscate"
              :props="cateProps"
              clearable
              :show-all-levels="false"
              @change="handleChange"
            ></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form-item
            :label="item.attr_name"
            v-for="item in goodsCateDynamicParams"
            :key="item.attr_id"
          >
            <!-- 多选框 -->
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox
                v-for="(it, i) in item.attr_vals"
                :key="i"
                :label="it"
                border
              ></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <!-- 表单子组件区域 -->
          <el-form-item
            :label="item.attr_name"
            v-for="item in goodsCateStaticAttribute"
            :key="item.attr_id"
          >
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <!-- Upload组件实现图片上传功能 -->
          <el-upload
            action="http://127.0.0.1:8888/api/private/v1/upload"
            :on-preview="handlePreview"
            :on-remove="removePreview"
            list-type="picture"
            :headers="setToken"
            :on-success="uploadSuccess"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <!-- 富文本编辑器 -->
          <quill-editor ref="myQuillEditor" v-model="addForm.goods_introduce" />
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <!-- 弹出图片的对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="pictureDialogVisible"
      width="40%"
    >
      <el-image style="width: 100%; height: 100%" :src="url"></el-image>
    </el-dialog>
  </div>
</template>

<script>
// 导入实现深拷贝的方法
import {deepClone2} from "../../common/util";
export default {
  data() {
    return {
      active: 0,
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类列表
        goods_cat: [],
        pics: [],
        // 商品详情介绍
        goods_introduce: "",
        // 商品参数
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请输入商品分类", trigger: "blur" },
        ],
      },
      goodscate: [],
      // 级联选择器配置
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 商品分类动态参数
      goodsCateDynamicParams: [],
      // 商品分类静态属性
      goodsCateStaticAttribute: [],
      // 保存的token值
      token: "",
      // 图片预览对话框
      pictureDialogVisible: false,
      // 预览图片url
      url: "",
    };
  },
  created() {
    this.getGoodsCate();
    // 获取token
    this.getToken();
  },
  methods: {
    async getGoodsCate() {
      const { data: res } = await this.$http.get("categories");
      console.log(res);
      this.goodscate = res.data;
    },
    // 级联选择器内容发生变化会触发的方法
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // tabs提供的钩子，完成tabs跳转时的需求
    leaveTab(newActive, oldActive) {
      // 确认商品的长度为3并且旧的下标是字符串 0
      if (this.addForm.goods_cat.length !== 3 && oldActive === "0") {
        this.$message.info("请选择商品分类！");
        return false;
      }
    },
    // tabs切换提供的事件函数
    async handleClick(tab) {
      // console.log(tab);
      // 切换到name值为'1'的时候发送网络请求
      if (tab.name === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.three_level_cateId}/attributes`,
          {
            params: {
              sel: "many",
            },
          }
        );
        console.log(res);
        if (res.meta.status === 200) {
          // 将获取的数据中的attr_vals中的字符串改为数组
          res.data.forEach((item) => {
            item.attr_vals =
              item.attr_vals === 0 ? [] : item.attr_vals.split(",");
          });
          this.goodsCateDynamicParams = res.data;
          // console.log(this.goodsCateDynamicParams);
        }
      } else if (tab.name === "2") {
        // 发送网络请求
        const { data: res } = await this.$http.get(
          `categories/${this.three_level_cateId}/attributes`,
          {
            params: {
              sel: "only",
            },
          }
        );
        console.log(res.data);
        this.goodsCateStaticAttribute = res.data;
      }
    },
    // 点击预览图片触发的钩子
    handlePreview(file) {
      console.log(file);
      this.pictureDialogVisible = true;
      this.url = file.response.data.url;
    },
    // 移除图片触发的钩子
    removePreview(file) {
      console.log(file);
      // 查找被删除图片在数组中的下标
      var index = this.addForm.pics.findIndex((item) => {
        item.pic = file.response.data.tmp_path;
      });
      // 利用下标和splice()删除对应数组元素
      this.addForm.pics.splice(index, 1);
      console.log(this.addForm.pics);
    },
    // 获取浏览器缓存的token
    getToken() {
      this.token = sessionStorage.getItem("token");
    },
    // 上传图片成功触发的钩子
    uploadSuccess(responce) {
      console.log(responce);
      this.addForm.pics.push({ pic: responce.data.tmp_path });
      // console.log(this.addForm.pics);
    },
    // 点击添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error("表单验证失败！");
        }
        // 使用深拷贝复制一份 addForm
        var addForm2 = deepClone2(this.addForm);
        // 将goods_cat数组转化为以'逗号'分开的列表
        addForm2.goods_cat = addForm2.goods_cat.join(",");
        // 处理商品的动态参数
        this.goodsCateDynamicParams.forEach(item => {
          const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')}
           this.addForm.attrs.push(newInfo)
        })
       
        // 处理商品的静态属性
       this.goodsCateStaticAttribute.forEach(item => {
         const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals}
         this.addForm.attrs.push(newInfo)
       })
        // 将addForm中的attrs数组复制给addForm2
        addForm2.attrs =this.addForm.attrs
        console.log(addForm2);
        // 以上步骤都是为网络请求的参数做准备，现在发起请求
        const {data : res} = await this.$http.post('goods',addForm2)
        if(res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        // 添加商品成功后重新进入goods路径，钩子函数自动刷新列表
        this.$router.push('/goods')
      });
    },
  },
  computed: {
    // 三级分类id
    three_level_cateId() {
      // 判断是否是三级分类
      return this.addForm.goods_cat.length === 3
        ? this.addForm.goods_cat[2]
        : null;
    },
    // 使用计算属性设置token
    setToken() {
      return {
        Authorization: this.token
      };
    },
  },
};
</script>

<style lang="less" scoped>
.el-tabs {
  margin-top: 20px;
}
.el-checkbox {
  margin: 0;
}
.el-button {
  margin-top: 30px;
}
</style>