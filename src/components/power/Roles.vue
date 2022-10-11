<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <!-- 添加角色按钮区 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表区 -->
            <el-table :data="roleList" border stripe>
                <!-- 展开列 -->
                <el-table-column label="@" type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1===0? 'bdtop' : '','venter']"
                            v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环 嵌套渲染二级权限 -->
                                <el-row :class="[i2===0? '' : 'bdtop','venter']" v-for="(item2, i2) in item1.children"
                                    :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag closable @close="removeRightById(scope.row, item2.id)" type="success">
                                            {{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag closable @close="removeRightById(scope.row, item3.id)" type="warning"
                                            v-for="(item3, i3) in item2.children" :key="item3.id">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                        <pre></pre>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <!-- 作用域插槽,可传数据 -->
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDiglog(scope.row.id)">
                            编辑</el-button>

                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeUserById(scope.row.id)">删除</el-button>

                        <el-button @click="showSetRightDialog(scope.row)" type="warning" icon="el-icon-setting"
                            size="mini">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加角色的对话框 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogclosed">
            <!-- 角色对话框内容主体区 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item label="角色名称" prop="roleName" >
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 用户对话框底部区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改角色的对话框 -->
        <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogclosed">
            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
                <el-form-item label="角色名称" prop="roleName" >
                    <el-input v-model="editForm.roleName" ></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserinfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <!-- 分配权限对话框内容主体区 -->
            <!-- el-tree  树形控件
            show-checkbox 节点是否可被选择 
            default-checked-keys 默认勾选的节点的 key 的数组
            node-key 每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
            default-expand-all	是否默认展开所有节点-->
            
              
            <el-tree 
            :data="rightsList" 
            :props="treeProps" 
            :default-checked-keys="defKeys"
            ref="treeRef"
            show-checkbox node-key="id" 
            default-expand-all></el-tree>
            <!-- 分配权限对话框底部区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 所有角色列表数据
            roleList: [],
            //控制分配对话框的显示与隐藏
            setRightDialogVisible: false,
            //控制添加角色对话框的显示与隐藏
            addDialogVisible: false,
            //控制编辑角色对话框的显示与隐藏
            editDialogVisible: false,
            //所有权限的数据
            rightsList: [],
            //树形控件的属性绑定对象
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            //默认选中的节点ID值数组
            defKeys: [],
            // 当前即将分配权限的id
            roleid: '',
            // 添加角色表单数据
            addForm: {
                roleName: '',
                roleDesc: '',
            },
            // 添加/修改角色表单的验证规则对象
            addFormRules: {
                roleName: [
                    { required: true, message: '请编辑角色名称', trigger: 'blur' },
                ],
            },
            //查询到的角色信息对象
            editForm: {},

        }
    },
    created() {
        // 获取所有的权限
        this.getRolesList()
    },
    methods: {
        // 获取所有角色列表
        async getRolesList() {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200)
                return this.$message.error('获取角色列表失败')
            this.roleList = res.data

            console.log(res)
        },
        //根据id删除对应权限 删除角色指定权限
        async removeRightById(role, rightId) {
            const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)//捕获用户点击取消按钮的结果返回值
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            //删除角色指定权限
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败')
            }
            this.$message.success('删除权限成功')
            //删除用户成功后服务器返回最新的权限列表数据重新赋值给当前权限列表数据         
            role.children = res.data
        },
        //展示分配权限的对话框
        async showSetRightDialog(role) {
            //角色列表里全部的id
            this.roleid = role.id

            //获取所有权限数据
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200)
                return this.$message.error('获取权限数据失败')
            // 获取到的权限数据保存到data中
            this.rightsList = res.data
            //  console.log(res)
            //递归获取三级节点的id
            this.getLeafKeys(role, this.defKeys)

            this.setRightDialogVisible = true
        },
        //通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
        getLeafKeys(node, arr) {
            //如果当前node节点不包含children属性,则是三级节点
            if (!node.children) {
                return arr.push(node.id)
            }
            //如果当前node节点不是三级节点,则通过递归遍历找到三级节点
            node.children.forEach(item =>
                this.getLeafKeys(item, arr)
            );
        },
        // 监听分配权限对话框的关闭事件,清空数据，防止上一次数据遗留
        setRightDialogClosed() {
            this.defKeys = []
        },
        //监听分配权限对话框的确定事件
        async allotRights() {
            const keys = [
            // getCheckedKeys	若节点可被选择（即 show-checkbox 为 true )
            // 则返回目前被选中的节点的 key 所组成的数组

            // getHalfCheckedKeys	若节点可被选择（即 show-checkbox 为 true)
            // 则返回目前半选中的节点的 key 所组成的数组
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
           // 权限 ID 列表（字符串
            const idstr = keys.join(',')
            const { data: res } = await
                this.$http.post(`roles/${this.roleid}/rights`, { rids: idstr })

            if (res.meta.status !== 200)
                return this.$message.error('分配权限失败')
            this.$message.success('分配权限成功')
            //刷新列表
            this.getRolesList()
            //关闭分配权限对话框
            this.setRightDialogVisible = false
        },
        //点击按钮，添加新角色
        addUser() {
            this.$refs.addFormRef.validate(async v => {
                //校验不通过
                if (!v) return
                //可以发起添加角色的网络请求
                const { data: res } = await this.$http.post('roles', this.addForm)
                if (res.meta.status !== 201) {
                    this.$message.error('添加角色失败')
                }
                this.$message.success('添加角色成功')
                //添加成功后隐藏添加角色对话框
                this.addDialogVisible = false
                //添加成功后重新获取角色列表数据(刷新列表)
                this.getRolesList()
            })
        },
        //监听添加角色对话框的关闭事件
        addDialogclosed() {
            this.$refs.addFormRef.resetFields()
        },
        //根据ID删除对应角色信息
        async removeUserById(id) {
            //弹框提示是否删除数据
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)//如果用户点击取消按钮catch捕获错误，并将错误return出去

            // 用户确认删除,返回值为字符串confirm
            // 用户取消删除,返回值为字符串cancel
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete('roles/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除角色失败')
            }

            this.$message.success('删除角色成功')

            //删除角色成功后重新获取角色列表数据(刷新列表)
            this.getRolesList()
        },
        //展示编辑角色对话框并查询角色信息
        async showEditDiglog(id) {
            const { data: res } = await this.$http.get('roles/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('查询角色信息失败')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        //修改角色信息并提交
        editUserinfo() {
            this.$refs.editFormRef.validate(async v => {
                //校验不通过
                if (!v) return
                //可以发起修改角色的网络请求
                const { data: res } = await this.$http.put(
                    'roles/' + this.editForm.roleId, {
                    roleName: this.editForm.roleName,
                    roleDesc: this.editForm.roleDesc,
                })
                if (res.meta.status !== 200) {
                    this.$message.error('修改角色失败')
                }
                this.$message.success('修改角色成功')
                //修改成功后隐藏修改角色对话框
                this.editDialogVisible = false
                //修改成功后重新获取角色列表数据(刷新列表)
                this.getRolesList()
            })
        },
        //监听修改角色对话框的关闭事件
        editDialogclosed() {
            this.$refs.editFormRef.resetFields()
        },

    },

}
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

.venter {
    display: flex;
    align-items: center;
}
</style>

