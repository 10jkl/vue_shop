<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <!-- 警告区 -->
            <el-alert title="注意:只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon>
            </el-alert>
            <!-- 选择商品分类区 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类:</span>
                    <!-- 选择商品分类的级联选择框 -->
                    <el-cascader expand-trigger="hover" :options="cateList" :props="cateProps"
                        v-model="selectedcateKeys" @change="handleChange" clearable>
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- table页签区 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtndisabled" @click="adddialogVisible=true">添加参数
                    </el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTabledata" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染tab标签 -->
                                <!-- i为数组索引 -->
                                <el-tag v-for="(item,i) in scope.row.attr_vals" 
                                :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                               <!-- 输入的文本框 -->
                                <el-input class="input-new-tag" 
                                v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                                    ref="saveTagInput" size="small" 
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" 
                                size="small" @click="showInput(scope.row)">+ New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column label="#" type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <!-- 作用域插槽 -->
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click='showeditDialog(scope.row.attr_id)'>编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                    @click="deleteDialog(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtndisabled" @click="adddialogVisible=true">添加属性
                    </el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTabledata" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染tab标签 -->
                                <!-- i为数组索引 -->
                                <el-tag v-for="(item,i) in scope.row.attr_vals" 
                                :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                               <!-- 输入的文本框 -->
                                <el-input class="input-new-tag" 
                                v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                                    ref="saveTagInput" size="small" 
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" 
                                size="small" @click="showInput(scope.row)">+ New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column label="#" type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click="showeditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                    @click="deleteDialog(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数对话框 -->
        <el-dialog :title='"添加"+titleText' :visible.sync="adddialogVisible" width="50%" @close="addCLOSED">
            <!-- 添加参数对话框具体内容 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="adddialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑参数对话框 -->
        <el-dialog :title='"编辑"+titleText' :visible.sync="editdialogVisible" width="50%" @close="editCLOSED">
            <!-- 添加参数对话框具体内容 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editdialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            cateList: [],
            cateProps: {
                value: "cat_id",
                label: "cat_name",
                children: "children",
            },
            //级联选择框双项绑定到的数组
            selectedcateKeys: [],
            //自动被激活的页签名称
            activeName: "many",
            //动态参数数据
            manyTabledata: [],
            //静态属性数据
            onlyTabledata: [],
            //添加参数对话框默认为隐藏
            adddialogVisible: false,
            //添加参数表单数据对象
            addForm: {
                attr_name: ''
            },
            //添加参数表单数据验证规则对象
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                ]
            },
            //编辑参数对话框默认为隐藏
            editdialogVisible: false,
            //编辑参数表单数据对象
            editForm: {

            },
            //编辑参数表单数据验证规则对象
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                ]
            },
            // //控制展开行添加文本框的显示与隐藏
            // inputVisible:false,
            //  //展开行添加文本框输入的内容
            // inputValue:'',



        };
    },
    created() {
        this.getCateList();
    },
    methods: {
        //获取所有商品列表数据
        async getCateList() {
            const { data: res } = await this.$http.get("categories");
            if (res.meta.status !== 200)
                return this.$message.error("获取商品分类失败");
            this.cateList = res.data;
            console.log(this.cateList);
        },
        //级联选择框变化，触发此函数
        handleChange() {
            this.getParamsData()
        },
        //tab页签点击事件处理函数
        handleTabClick() {
            this.getParamsData()
            console.log(this.activeName);
        },

        async getParamsData() {
            //选中的不是三级分类
            if (this.selectedcateKeys.length !== 3) {
                this.selectedcateKeys = [];
                this.manyTabledata=[]
                this.onlyTabledata=[]
                return
            }
            //选中的是三级分类
            console.log(this.selectedcateKeys);

            //根据所选分类的id，和当前所处的面板，获取对应的参数
            const { data: res } = await this.$http.get(
                `categories/${this.cataId}/attributes`,
                { params: { sel: this.activeName } }
            );
            if (res.meta.status !== 200) {
                return this.$message.error("获取对应的参数失败");
            }

            //先判断attr_vals不为空将attr_vals字符串变为数组
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ?
                    item.attr_vals.split(',') : []
                    //给每个el-input设置一个单独的inputVisible和inputValue
                    item.inputVisible=false
                    item.inputValue=''
            })
            console.log('三级分类对应的参数:', res.data);

            //根据所选分类的activeName，和当前所处的面板，获取对应的参数
            if (this.activeName === "many") {
                this.manyTabledata = res.data
            } else {
                this.onlyTabledata = res.data
            }
        },
        //监听添加对话框的关闭事件
        addCLOSED() {
            this.$refs.addFormRef.resetFields()
        },
        //点击添加对话框确认按钮，添加参数
        addParams() {
            this.$refs.addFormRef.validate(async v => {
                //校验不通过返回null
                if (!v) return
                //校验通过可以发起添加参数的网络请求
                const { data: res } = await this.$http.post(
                    `categories/${this.cataId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 201) {
                    return this.$message.error('添加参数失败')
                }
                this.$message.success('添加参数成功')
                this.adddialogVisible = false
                this.getParamsData()
            })
        },
        async showeditDialog(attr_id) {
            //查询当前参数信息
            const { data: res } = await this.$http.get
                (`categories/${this.cataId}/attributes/${attr_id}`,
                    { params: { attr_sel: this.activeName } }
                );
            if (res.meta.status !== 200) {
                return this.$message.error("获取当前参数信息失败");
            }

            this.editForm = res.data
            this.editdialogVisible = true
        },
        //监听修改对话框的关闭事件
        editCLOSED() {
            this.$refs.editFormRef.resetFields()
        },
        //点击编辑对话框确认按钮，编辑参数信息
        editParams() {
            this.$refs.editFormRef.validate(async v => {
                //校验不通过返回null
                if (!v) return
                //校验通过可以发起添加参数的网络请求
                const { data: res } = await this.$http.put(
                    `categories/${this.cataId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 200) {
                    return this.$message.error('编辑参数失败')
                }
                this.$message.success('编辑参数成功')
                this.getParamsData()
                this.editdialogVisible = false
            })
        },
        //根据id，删除对应参数信息
        async deleteDialog(id) {
            const confirmResult = await this.$confirm('此操作将删除对应参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)//如果用户点击取消按钮catch捕获错误，并将错误return出去

            // 用户确认删除,返回值为字符串confirm
            // 用户取消删除,返回值为字符串cancel
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            //删除业务逻辑
            const { data: res } = await this.$http.delete
                (`categories/${this.cataId}/attributes/${id}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除对应参数失败')
            }

            this.$message.success('删除对应参数成功')

            //删除对应参数成功后重新获取参数列表数据(刷新列表)
            this.getParamsData()

        },
        //展开行文本框失去焦点或按下enter键都会触发
       async handleInputConfirm(row){
            if(row.inputVisible.length===0){
                row.inputValue=''
                row.inputVisible=false
                return
            }
            //如果没有return则证明输入的内容需要做后续处理
            row.attr_vals.push(row.inputValue)
            row.inputValue=''
            row.inputVisible=false
            //需要发起请求,保存这次操作
            this.saveAttrvals(row)
            // const { data: res } = await this.$http.put(
            //         `categories/${this.cataId}/attributes/${row.attr_id}`, {
            //         attr_name: row.attr_name,
            //         attr_sel: row.attr_sel,
            //         attr_vals: row.attr_vals.join(',')
            //     })
            //     if (res.meta.status !== 200) {
            //         return this.$message.error('添加编辑参数失败')
            //     }
            //      this.$message.success('添加编辑参数成功')

        },
        //点击按钮展示展开行文本框,隐藏+ New Tag按钮
        showInput(row){
            row.inputVisible=true
            //让文本框自动获取焦点
            //$nextTick方法,就是当页面上元素被重新渲染之后,才会指定回调函数中的代码
            this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        })
    },
    //对attr_vals的操作，保存到数据库
  async  saveAttrvals(row){
        const { data: res } = await this.$http.put(
                    `categories/${this.cataId}/attributes/${row.attr_id}`, {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(',')
                })
                if (res.meta.status !== 200) {
                    return this.$message.error('添加/删除编辑参数失败')
                }
                 this.$message.success('添加/删除编辑参数成功')
    },
//删除对应的参数和选项
    handleClose(i,row){
        row.attr_vals.splice(i,1)
        this.saveAttrvals(row)
    },

    },

    //计算属性
    computed: {
        //如果table页签区添加按钮需要被禁用，则返回true，否则返回false
        isBtndisabled() {
            if (this.selectedcateKeys.length !== 3) {
                return true;
            }
            return false;
        },
        //当前选中的三级分类id
        cataId() {
            if (this.selectedcateKeys.length === 3) {
                return this.selectedcateKeys[2];
            }
            return null;
        },
        //动态计算标题文本
        titleText() {
            if (this.activeName === 'many') {
                return '动态参数'
            }
            return '静态属性'
        },
    },
};
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 20px 0;
}

.el-tag {
    margin: 10px;
}
.input-new-tag{
width: 150px;
}
</style>