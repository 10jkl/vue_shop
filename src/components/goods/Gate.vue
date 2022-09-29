<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <!-- 添加分类按钮区 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showaddcateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 分类表格区 -->
            <!-- 全局组件  -->
            <tree-table class="treetable" :data="cateList" :columns="columns" :selection-type="false"
                :expand-type="false" :show-row-hover="false" show-index index-text="#" border>
                <!-- 是否有效区  作用域插槽 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" style="color: yellowgreen" v-if="scope.row.cat_deleted === false"></i>
                    <i class="el-icon-error" style="color: yellowgreen" v-else></i>
                </template>
                <!-- 排序区  作用域插槽 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0"> 1级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1"> 2级</el-tag>
                    <el-tag size="mini" type="warning" v-else> 3级</el-tag>
                </template>
                <!-- 操作区  作用域插槽 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="querinfo.pagenum " :page-sizes="[1, 5, 10, 20]" :page-size="querinfo.pagesize "
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addcateDialogVisible" width="50%" @close="addcateDialogclosed">
            <!-- 分类对话框内容主体区 -->
            <el-form :model="addcateForm" :rules="addcateFormRules" ref="addcateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addcateForm.cat_name"></el-input>
                </el-form-item>

                <el-form-item label="父级分类">
                    <!-- options用来指定数据源 -->
                    <!-- props用来指定配置对象 -->
                    <el-cascader 
                    expand-trigger="hover"
                    :options="parentCateList" 
                    :props="cascaderProps" 
                    v-model="selectedKeys" 
                    @change="parentCateChange" clearable>
                    </el-cascader>
                  
                </el-form-item>
            </el-form>
            <!-- 添加分类对话框底部区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addcateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addcate">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    data() {
        return {
            //查询条件
            querinfo: {
                type: 3,
                //当前页码值
                pagenum: 1,
                //	每页显示多少条数据	
                pagesize: 5
            },
            //商品分类的数据列表，默认为空
            cateList: [],
            //总数据条数
            total: 0,
            //为tree-table指定列的定义
            columns: [
                {
                    label: "分类名称",
                    prop: "cat_name"
                },
                {
                    label: "是否有效",
                    //将当前列定义为模板列
                    type: "template",
                    //  当前列使用的模板名称
                    template: "isok"
                },
                {
                    label: "排序",
                    //将当前列定义为模板列
                    type: "template",
                    //  当前列使用的模板名称
                    template: "order"
                },
                {
                    label: "操作",
                    //将当前列定义为模板列
                    type: "template",
                    //  当前列使用的模板名称
                    template: "opt"
                },
            ],
            // 控制分类对话框的显示与隐藏
            addcateDialogVisible: false,
            //添加分类的表单数据对象
            addcateForm: {
                // 将要添加的分类名称
                cat_name: '',
                // 父级分类id
                cat_pid: 0,
                //分类等级,默认要添加为一级分类
                cat_level: 0,
            },
            // 添加分类表单的验证规则对象
            addcateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                ],
            },
            //父级分类的列表
            parentCateList: [],
            //指定级联选择器的配置对象
            cascaderProps:{
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            //选中的父级分类的id数组
            selectedKeys:[],
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        //获取商品分类数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.querinfo })
            if (res.meta.status !== 200)
                return this.$message.error('获取商品分类列表失败')
            console.log(res)
            //把数据列表赋值给cateList
            this.cateList = res.data.result
            //把总数据条数赋值给total
            this.total = res.data.total
        },
        //监听pagesize改变
        handleSizeChange(newSize) {
            this.querinfo.pagesize = newSize
            this.getCateList()
        },
        //监听pagenum改变
        handleCurrentChange(newPage) {
            this.querinfo.pagenum = newPage
            this.getCateList()
        },
        // 点击添加分类按钮显示对话框
        showaddcateDialog() {
            //点击添加分类按钮获取父级分类的数据列表
            this.getParentCateList()

            this.addcateDialogVisible = true
        },
        //获取父级分类的数据列表
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', { params: {type:2} })
            if (res.meta.status !== 200)
                return this.$message.error('获取父级分类列表失败')
       
                this.parentCateList = res.data
            console.log(this.parentCateList)
            
        },
        //父级分类框选择项发生变化触发这个函数
        parentCateChange() {
            console.log(this.selectedKeys)
            //如果selectedKeys数组中length大于0，证明选中父级分类，反之
            //就说明没有选中父级分类
            if (this.selectedKeys.length > 0) {
                //父级分类的id
                this.addcateForm.cat_pid = this.selectedKeys[
                    this.selectedKeys.length - 1]
                //为当前分类的等级赋值
                this.addcateForm.cat_level = this.selectedKeys.length
                return
            } else {
                this.addcateForm.cat_pid = 0
                this.addcateForm.cat_level = 0
            }
        },
        //点击确认按钮，添加新的分类
        addcate() {
            this.$refs.addcateFormRef.validate(async v => {
                //校验不通过
                if (!v) return
                //可以发起添加用户的网络请求
                const { data: res } = await this.$http.post('categories', this.addcateForm)
                if (res.meta.status !== 201) {
                    this.$message.error('添加分类失败')
                }
                this.$message.success('添加分类成功')
                this.getCateList()
                this.addcateDialogVisible = false
                //console.log(this.addcateForm)
            })
        },
        //对话框关闭事件，重置表单数据
        addcateDialogclosed() {
            this.$refs.addcateFormRef.resetFields()
            this.selectedKeys = []
            this.addcateForm.cat_pid = 0
            this.addcateForm.cat_level = 0
        },

    },
}
</script>

<style lang="less" scoped>
.treetable {
    margin-top: 20px;
}

.el-cascader {
    width: 100%;
}
</style>