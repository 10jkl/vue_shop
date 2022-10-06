<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <!-- 提示区 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
            <!-- 步骤条区 ,activeIndex-0将字符串'0'转化为数值0-->
            <el-steps align-center :space="200" :active="activeIndex-0" finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- tab栏区 -->
            <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" label-position="top">
                <!-- before-leave,切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject,则阻止切换。      -->
                <!-- tab-click,tab 被选中时触发 -->
                <!-- tab-position	选项卡所在位置 -->
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTab" @tab-click="tabclicked">
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
                        <!-- 选择商品分类的级联选择框 -->
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader expand-trigger="hover" :options="Catelist" :props="cateProps"
                                v-model="addForm.goods_cat" @change="handleChange" clearable>
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 循环渲染tab标签 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTabledata" :key="item.attr_id">
                            <!-- 复选框组区 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <!-- i为数组索引 -->
                                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i">
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTabledata" :key="item.attr_id">
                            <el-input v-model="item.attr_vals">
                            </el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                          <!-- action表示图片要上传的后台api地址 -->
                        <el-upload  :action="uploadURL"
                            :on-preview="handlePreview" 
                            :on-remove="handleRemove" 
                            list-type="picture"
                            :headers="headerobj"
                            :on-success="headerSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model="addForm.goods_introduce">
                        </quill-editor>
                        <!-- 添加商品按钮 -->
                        <el-button type="primary" class="add" @click="Add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog title="图片预览" :visible.sync="DialogVisible" width="50%" >
            <img :src="previewPath" width="100%">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    data() {
        return {
            activeIndex: '0',
            //添加商品表单数据对象
            addForm: {
                goods_name: '',
                goods_price: 20,
                goods_weight: 10,
                goods_number: 1,
                //商品所属的分类数组
                goods_cat: [],
                //图片数组
                pics:[],
                //介绍
                goods_introduce:'',
                attrs:[]
            },
            //添加商品表单数据对象的校验规则
            addFormrules: {
                goods_name: [
                    { required: true, message: '请输入商品名', trigger: 'blur' },
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' },
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' },
                ],
                goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' },
                ],
                goods_cat: [
                    { required: true, message: '请选择商品分类', trigger: 'blur' },
                ],
            },
            //商品分类列表
            Catelist: [],
            cateProps: {
                value: "cat_id",
                label: "cat_name",
                children: "children",
            },
            //动态参数数据
            manyTabledata: [],
            //静态属性数据
            onlyTabledata: [],
            //上传图片url地址
            uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
           //图片上传组件的headers请求头对象
            headerobj:{
                Authorization:window.sessionStorage.getItem('token')
            },
            previewPath:'',
            DialogVisible:false,
              
        }
    },
    created() {
        this.getCatelist()
    },
    methods: {
        //获取所有商品分类数据列表
        async getCatelist() {
            const { data: res } = await this.$http.get(`categories`)
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败')
            }
            console.log(res.data)
            this.Catelist = res.data
        },
        //级联选择器选中项变化，会触发这个函数
        handleChange() {
            //选中的不是三级分类
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = [];
            }
        },
        //即将进入的标签页名字为activeName,即将离开的标签页名字为oldActiveName
        beforeTab(activeName, oldActiveName) {
            if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请先选择商品分类')
                return false
            }
        },
        async tabclicked() {
            //访问商品动态参数面板
            if (this.activeIndex === '1') {
                const { data: res } = await this.$http.get
                    (`categories/${this.cataId}/attributes`,
                        { params: { sel: 'many' } })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取动态参数失败')
                }
                //先判断attr_vals不为空将attr_vals字符串变为数组
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ?
                        [] : item.attr_vals.split(',')
                })

                this.manyTabledata = res.data
                console.log('商品动态参数', res.data)
                //访问商品属性面板
            } else if (this.activeIndex === '2') {
                const { data: res } = await this.$http.get
                    (`categories/${this.cataId}/attributes`,
                        { params: { sel: 'only' } })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品属性失败')
                }
                this.onlyTabledata = res.data
            }
        },
        //处理图片预览效果
        handlePreview(file){
            console.log(file)
          this.previewPath=file.response.data.url
         this.DialogVisible=true
        },
        //处理图片移除效果
        handleRemove(file){
            //1获取将要删除的图片临时路径
            const filepath=file.response.data.tmp_path
            //2从pics数组中 找到这个图片对应的索引值
             const i= this.addForm.pics.findIndex(x=>
            x.pic===filepath)
            //3调用数组的splice方法 把图片信息对象 从pics数组移除
            this.addForm.pics.splice(i,1)
            
        },
         //监听图片上传成功事件on-success文件上传成功时的钩子function(response, file, fileList)
        headerSuccess(response){
            console.log(response)
            //1拼接得到一个图片信息对象 
            const picinfo={pic: response.data.tmp_path}
            //2将图片信息push到pics数组中
           
            this.addForm.pics.push(picinfo)
           
           
        },
        //添加商品
        Add(){
            this.$refs.addFormRef.validate(async v=>{
                if(!v){
                    return this.$message.error('请填写完完整商品表单')
                }
                //执行添加商品业务逻辑
                //lodash cloneDeep(obj)深拷贝
               const form= _.cloneDeep(this.addForm)
               form.goods_cat=form.goods_cat.join(',')
               //处理动态参数
               this.manyTabledata.forEach(item=>{
                const newinfo={
                attr_id: item.attr_id,
                attr_value: item.attr_vals.join(',')
                }
                this.addForm.attrs.push(newinfo)
               })
               //处理静态属性
               this.onlyTabledata.forEach(item=>{
                const newinfo={
                attr_id: item.attr_id,
                attr_value: item.attr_vals
                }
                this.addForm.attrs.push(newinfo)
               })
               form.attrs=this.addForm.attrs
               
               console.log(form)
               //发起请求添加商品,商品名称必须是唯一的
               const { data: res } = await this.$http.post(`goods`, form)
            if (res.meta.status !== 201) {
                //不知道为什么上传图片就会添加商品失败，所有我就直接跳转了
                return  this.$router.push('/goods')
            }
            this.$message.success('添加商品成功')
            this.$router.push('/goods') 

            })
        },
    },

    computed: {
        //利用计算属性计算当前选中的三级分类id
        cataId() {
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2];
            }
            return null;
        },
    },
}
</script>

<style lang="less" scoped>
.el-checkbox {
    margin: 0 15px 0 0 !important;
}
.add{
    margin-top: 20px;
}
</style>