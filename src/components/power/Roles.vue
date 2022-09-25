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
                    <el-button type="primary">添加角色</el-button>
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
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                        <el-button @click="showSetRightDialog(scope.row)" type="warning" icon="el-icon-setting"
                            size="mini">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <!-- 分配权限对话框内容主体区 -->
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
                :default-checked-keys="defKeys" ref="treeRef"></el-tree>
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
            roleid: ''
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
        //根据id删除对应权限
        async removeRightById(role, rightId) {
            const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)//捕获用户点击取消按钮的结果返回值
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
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
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
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

