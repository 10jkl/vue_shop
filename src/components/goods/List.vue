<template>
  <div>
     <!-- 面包屑导航区 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
             <!-- 搜索与添加区域 -->
             <el-row :gutter="20">
                <el-col :span="12">
                    <el-input placeholder="请输入你要查找的商品内容" v-model="queryInfo.query" @clear="getGoodsList"  clearable>
                        <el-button slot="append" icon="el-icon-search"  @click="getGoodsList" ></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>
             <!-- 商品列表区 -->
             <el-table :data="goodslist" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column width="95px" label="商品价格(元)" prop="goods_price"></el-table-column>
                <el-table-column width="70px" label="商品重量" prop="goods_weight"></el-table-column>
                <el-table-column width="70px" label="商品数量" prop="goods_number"></el-table-column>
                <el-table-column width="140px" label="创建时间" prop="add_time">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column width="140px" label="更新时间" prop="upd_time">
                    <template slot-scope="scope">
                        {{scope.row.upd_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <!-- 通过作用域插槽形式接收数据 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                        @click="showEditDiglog(scope.row.goods_id)">
                        </el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                        @click="removeById(scope.row.goods_id)"  ></el-button>
                    </template>
                </el-table-column>
            </el-table>
             <!-- 分页区域 -->
             <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[1, 5, 10, 20]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>
        
        <!-- 修改商品的对话框 -->
        <el-dialog title="修改商品" :visible.sync="editDialogVisible" width="50%" @close="editDialogclosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editForm.goods_name" ></el-input>
                </el-form-item>
                <el-form-item label="商品价格(元)" prop="goods_price">
                    <el-input v-model.number="editForm.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model.number="editForm.goods_number"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model.number="editForm.goods_weight"></el-input>
                </el-form-item>
                
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserinfo">确 定</el-button>
            </span>
        </el-dialog>
  </div>
</template>

<script>
import { number } from 'echarts'
export default {
    //私有数据节点
 data() {
    return {
         //获取商品列表的参数对象
         queryInfo: {
                query: '',
                // 当前的页数
                pagenum: 1,
                //当前每页显示多少条数据
                pagesize: 5
            },
            //商品列表
            goodslist:[],
            // 总数据条数
            total:0,
              //控制修改商品对话框的显示与隐藏
              editDialogVisible: false,
            //查询到的商品信息对象
            editForm: {},
            // 修改商品表单的验证规则对象
            editFormRules: {
                goods_name: [
                    { required: true, message: '请编辑商品名称', trigger: 'blur' },
                ],  
                goods_price: [
                    { required: true, message: '请编辑商品价格(只能输入数字)', trigger: 'blur' },
                ], 
                goods_number: [
                { required: true, message: '请编辑商品价格(只能输入数字)', trigger: 'blur' },         
                ], 
                goods_weight: [
                { required: true, message: '请编辑商品价格(只能输入数字)', trigger: 'blur' },             
                ], 
            },
    }
 },
 //生命周期函数
 created() {
    this.getGoodsList()
 },
 //所有事件处理函数节点
 methods: {
   async getGoodsList(){
        const { data: res } = await this.$http.get(`goods`, { params: this.queryInfo })
            if (res.meta.status !== 200){
                return this.$message.error('获取商品列表失败')
            }
                console.log(res.data)
            this.goodslist = res.data.goods
            this.total = res.data.total
            
    },
     // 监听每页显示多少条数据改变的事件
     handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        //根据ID删除对应商品信息
        async removeById(id) {
            //弹框提示是否删除数据
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)//如果用户点击取消按钮catch捕获错误，并将错误return出去

            // 用户确认删除,返回值为字符串confirm
            // 用户取消删除,返回值为字符串cancel
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete(`goods/` + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除商品失败')
            }

            this.$message.success('删除商品成功')

            //删除商品成功后重新获取商品列表数据(刷新列表)
            this.getGoodsList()
        },
           //展示编辑商品对话框并查询商品信息
           async showEditDiglog(id) {
            const { data: res } = await this.$http.get(`goods/` + id,{
                goods_cat: this.editForm.goods_cat,
            })
            if (res.meta.status !== 200) {
                return this.$message.error('查询商品信息失败')
            }
            this.editForm = res.data
            console.log(this.editForm)
            this.editDialogVisible = true
        },
        //监听修改商品对话框的关闭事件
        editDialogclosed() {
            this.$refs.editFormRef.resetFields()
        },
        //修改商品信息并提交
        editUserinfo() {
            this.$refs.editFormRef.validate(async v => {
                //校验不通过
                if (!v) return
                //可以发起修改商品的网络请求
                const { data: res } = await this.$http.put(
                    'goods/' + this.editForm.goods_id,
                    {goods_name: this.editForm.goods_name,
                    goods_price: this.editForm.goods_price,
                    goods_number: this.editForm.goods_number,
                    goods_weight: this.editForm.goods_weight,
                    goods_cat: this.editForm.goods_cat,
                }
                
                )
                if (res.meta.status !== 200) {
                  return  this.$message.error('修改商品失败')
                }
                this.$message.success('修改商品成功')
                //修改成功后隐藏修改商品对话框
                this.editDialogVisible = false
                //修改成功后重新获取商品列表数据(刷新列表)
                this.getGoodsList()
            })
        },
        goAddpage(){
            //利用路由调整到/goods/add的组件
           this.$router.push('/goods/add') 
        },
 },
}
</script>

<style lang="less" scoped>

</style>