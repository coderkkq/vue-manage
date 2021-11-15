<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 添加角色的按钮区域 -->
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 栅格系统 -->
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  @close="removeRightById(scope.row, item1.id)"
                  closable
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 下面的el-col渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      closable
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过for循环嵌套渲染第三级权限 -->
                    <!-- 其中close是tag组件的事件 -->
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <!-- 删除按钮 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <!-- 分配角色按钮 -->
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配角色</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 对话框内容主体区域 -->
      <el-form
        ref="addFormRef"
        label-width="80px"
        :rules="addFormRules"
        :model="addForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色列表对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 对话框内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- tree树形控件展示角色所有权限 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所以角色列表数据
      rolesList: [],
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      // 查询到的角色信息对象
      editForm: {},
      // 添加角色对话框的显示和隐藏
      addDialogVisible: false,
      // 编辑角色 对话框的显示和隐藏
      editDialogVisible: false,
      // 添加表单的验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 1,
            max: 7,
            message: "角色名的长度在1~7个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 1,
            max: 7,
            message: "角色描述的长度在1~7个字符之间",
            trigger: "blur",
          },
        ],
      },
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 1,
            max: 7,
            message: "角色名的长度在1~7个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 1,
            max: 7,
            message: "用户名的长度在1~7个字符之间",
            trigger: "blur",
          },
        ],
      },
      // 分配角色对话框的显示和隐藏
      setRightDialogVisible: false,
      // 角色所有权限数据
      rightsList: [],
      // 这是树形控件的属性绑定对象
      treeProps: {
        // 绑定权限名称
        label: "authName",
        // 数据父子嵌套属性
        children: "children",
      },
      // 默认选中的节点id值
      defKeys: [],
      // 保存的角色id（当前即将分配权限的角色id）
      roleId: ''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所以角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色数据列表失败");
      }
      this.rolesList = res.data;
      // console.log(this.rolesList);
    },
    // 监听添加角色对话框关闭的事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击确认按钮添加角色(这里调用表单的validate方法对整个表单进行校验)
    addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error("添加角色失败");
        }
        this.$message.success("添加用户成功");
        // 添加角色成功后隐藏对话框
        this.addDialogVisible = false;
        // 重新获取角色列表
        this.getRolesList();
      });
    },
    // 点击编辑按钮展示编辑角色的对话框，发送请求根据角色id查询对应角色
    async showEditDialog(id) {
      // 显示对话框
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色信息失败！");
      }
      // 存储角色信息
      this.editForm = res.data;
      // console.log(this.editForm);
    },
    // 监听编辑角色对话框关闭的事件
    editDialogClosed() {
      // 实现对话框中表单的清空操作
      this.$refs.editFormRef.resetFields();
    },
    // 编辑角色对话框 确认按钮 点击事件
    editRolesInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(valid);  vaild是一个Boolean值
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.id,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        );
        // console.log(res);
        if (res.meta.status !== 400) {
          return this.$message.error("更新角色数据失败");
        }
        // 按确认后，关闭对话框
        this.editDialogVisible = false;
        // 刷新数据列表
        this.getRolesList();
        // 提示修改成功
        this.$message.success("更新数据成功");
      });
    },
    // 根据id删除指定的用户信息
    async removeRoleById(id) {
      // 这里使用了 message-box组件的弹框 效果
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 如果用户确认删除，则返回的是字符串confirm
      // 如果用户取消删除，则返回的是字符串cancel
      if (confirmResult !== "confirm") {
        return this.$message("已取消删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败！");
      }
      this.$message.success("删除角色成功！");
      this.getRolesList();
    },
    // 角色列表根据id 删除tag标签（对应权限）
    async removeRightById(role, rightId) {
      // 弹框提示是否确认删除权限
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message("取消了本次删除权限！");
      }
      // 发送 删除角色指定权限 的请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      // this.getRolesList() 这个会导致页面重新渲染，不建议采用（会合上）
      role.children = res.data;
      this.$message.success("成功删除权限！");
    },
    // 点击 分配角色 按钮事件，展示对话框
    async showSetRightDialog(role) {
      // 保存角色id，为后面分配角色使用
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get("rights/tree");
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败");
      }
      // 保存获取的权限数据
      this.rightsList = res.data;
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true;
    },
    // 监听分配角色权限对话框的关闭
    setRightDialogClosed() {
      // 每次关闭对话框，重置一下权限数组(默认选中的权限id)  否则这是一个小bug
      this.defKeys = []
    },
    // 通过递归的形式，获取角色下所有三级权限
    // 的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // console.log(node);
      // 如果当前 node 节点不包含children 属性，
      // 则是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      })
    },
    // 点击确认按钮 为角色分配权限
    // 其中调用tree控件的方法
    // getCheckedKeys():返回被选中节点，为数组结构
    // getHalfCheckedNodes():返回目前半选中节点，为数组
    async allotRights() {
      const keys = 
      [...this.$refs.treeRef.
      getCheckedKeys(),
      ...this.$refs.treeRef.
      getHalfCheckedKeys()
      ]
    //  console.log(keys);
    // 发送网络请求需要传入的是String类型的数据
    // 所以将keys数组拆分成以,连接的字符串
    const idStr = keys.join(',')
    // console.log(idStr);
    // 点击确认按钮发送分配权限请求，并将结果结构为 res
    const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, 
    {rids: idStr})

    if(res.meta.status !== 200) {
      return this.$message.error('分配权限失败！')
    }
    this.$message.success('分配角色成功！')
    // 重新刷新数据列表
    this.getRolesList()
    // 把对话框隐藏
    this.setRightDialogVisible = false
    }
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
// 角色列表el-row居中效果
.vcenter {
  display: flex;
  align-items: center;
}
</style>