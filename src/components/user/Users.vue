<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" @clear="getUserList" clearable>
                        <!-- slot="append"显示搜索按钮 -->
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区 -->
            <el-table :data="userlist" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态" prop="mg_state">
                    <!-- slot-scope接收数据 -->
                    <template slot-scope="scope">
                        <!-- {{scope.row}} -->
                        <el-switch v-model="scope.row.mg_state" @change="userstatechanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200px">
                    <template slot-scope="scope">
                        <!-- {{scope.row}} -->
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" 
                        size="mini" @click="showEditDiglog(scope.row.id)">
                        </el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[1, 5, 10, 20]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户的对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogclosed">
            <!-- 用户对话框内容主体区 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 用户对话框底部区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户的对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogclosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserinfo">确 定</el-button>
            </span>
        </el-dialog>
        
        <!-- 分配角色的对话框 -->
        <el-dialog title="分配角色" 
        :visible.sync="setDialogVisible" 
        width="50%" @close="setRoleDialogClosed">
            <div>
                <p> 当前的用户:{{userinfo.username}}</p>
                <p> 当前的角色:{{userinfo.role_name}}</p>
                <p> 分配新角色:
                    <el-select v-model="selectedRoleid" placeholder="请选择">
                        <el-option 
                        v-for="item in rolesList" :key="item.id" 
                        :label="item.roleName" 
                        :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleinfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        //验证邮箱规则
        var checkEmail = (rule, value, cb) => {
            //验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if (regEmail.test(value)) {
                //合法邮箱
                return cb()
            }
            cb(new Error('请输入合法邮箱'))
        };
        //验证手机号规则
        var checkMobile = (rule, value, cb) => {
            //验证手机号的正则表达式
            const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if (regMobile.test(value)) {
                //合法手机号
                return cb()
            }
            cb(new Error('请输入合法手机号'))
        };
        return {
            //获取用户列表的参数对象
            queryInfo: {
                //
                query: '',
                // 当前的页数
                pagenum: 1,
                //当前每页显示多少条数据
                pagesize: 5
            },
            userlist: [],
            total: 0,
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible: false,
            // 添加用户表单数据
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: '',
            },
            // 添加用户表单的验证规则对象
            addFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            //控制修改用户对话框的显示与隐藏
            editDialogVisible: false,
            //查询到的用户信息对象
            editForm: {},
            // 修改用户表单的验证规则对象
            editFormRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 控制分配角色对话框的显示与隐藏
            setDialogVisible: false,
            //需要被分配角色的用户信息
            userinfo: {},
            //所有角色的数据列表
            rolesList: [],
            //已选中的角色id值
            selectedRoleid:'',
        }
    },

    created() {
        this.getUserList()
    },

    methods: {
        //获取所有用户列表数据
        async getUserList() {
            const { data: res } = await this.$http.get('users', { params: this.queryInfo })
            if (res.meta.status !== 200)
                return this.$message.error('获取用户列表失败')
            this.userlist = res.data.users
            this.total = res.data.total
            console.log(res)
        },
        // 监听每页显示多少条数据改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听 页数改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 监听switch状态的改变
        async userstatechanged(userinfo) {
            const { data: res } =
                await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if (res.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('更新状态失败')
            }
            this.$message.success('更新状态成功')
        },
        //监听添加用户对话框的关闭事件
        addDialogclosed() {
            this.$refs.addFormRef.resetFields()
        },
        //点击按钮，添加新用户
        addUser() {
            this.$refs.addFormRef.validate(async v => {
                //校验不通过
                if (!v) return
                //可以发起添加用户的网络请求
                const { data: res } = await this.$http.post('users', this.addForm)
                if (res.meta.status !== 201) {
                    this.$message.error('添加用户失败')
                }
                this.$message.success('添加用户成功')
                //添加成功后隐藏添加用户对话框
                this.addDialogVisible = false
                //添加成功后重新获取用户列表数据(刷新列表)
                this.getUserList()
            })
        },
        //展示编辑用户对话框并查询用户信息
        async showEditDiglog(id) {
            const { data: res } = await this.$http.get('users/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('查询用户信息失败')
            }
            this.editForm = res.data

            this.editDialogVisible = true
        },
        //监听修改用户对话框的关闭事件
        editDialogclosed() {
            this.$refs.editFormRef.resetFields()
        },
        //修改用户信息并提交
        editUserinfo() {
            this.$refs.editFormRef.validate(async v => {
                //校验不通过
                if (!v) return
                //可以发起修改用户的网络请求
                const { data: res } = await this.$http.put(
                    'users/' + this.editForm.id, {
                    email: this.editForm.email,
                    mobile: this.editForm.mobile
                })
                if (res.meta.status !== 200) {
                    this.$message.error('修改用户失败')
                }
                this.$message.success('修改用户成功')
                //修改成功后隐藏修改用户对话框
                this.editDialogVisible = false
                //修改成功后重新获取用户列表数据(刷新列表)
                this.getUserList()
            })
        },
        //根据ID删除对应用户信息
        async removeUserById(id) {
            //弹框提示是否删除数据
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)//如果用户点击取消按钮catch捕获错误，并将错误return出去

            // 用户确认删除,返回值为字符串confirm
            // 用户取消删除,返回值为字符串cancel
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete('users/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除用户失败')
            }

            this.$message.success('删除用户成功')

            //删除用户成功后重新获取用户列表数据(刷新列表)
            this.getUserList()
        },
        //展示分配角色对话框
        async setRole(userinfo) {
            this.userinfo = userinfo

            //在展示对话框之前，获取所有的角色的列表
            const { data: res } =
                await this.$http.get(`roles`)
            if (res.meta.status !== 200) {
                return this.$message.error('获取所有的角色的列表失败')
            }
            this.rolesList = res.data
            this.$message.success('获取所有的角色的列表成功')
            this.setDialogVisible = true
        },
        //点击分配角色对话框确认按钮事件
      async  saveRoleinfo(){
            if(!this.selectedRoleid){
                return this.$message.error('请选择相应的分配角色')
            }
            const { data: res } =
                await this.$http.put(`users/${this.userinfo.id}/role`,
                {rid:this.selectedRoleid})
            if (res.meta.status !== 200) {
                return this.$message.error('分配角色失败')
            }
            this.$message.success('分配角色成功')
            this.getUserList()
            this.setDialogVisible = false
        },
        //监听分配角色对话框关闭事件
        setRoleDialogClosed(){
            this.selectedRoleid=''
            this.userinfo={}
        },

    },
}
</script>

<style lang="less" scoped>

</style>

