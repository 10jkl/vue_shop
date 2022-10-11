<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <!-- 查找订单按钮区 -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-input placeholder="请输入你要查找的订单内容" 
                    v-model="querinfo.query" 
                    @clear="getOrderList" clearable>
                        <el-button slot="append" 
                        icon="el-icon-search" 
                        @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <el-table :data="orderlist" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                    <template slot-scope="scope">
                        <el-tag icon="el-icon-success" style="color: yellowgreen" v-if="scope.row.pay_status === 1">已付款
                        </el-tag>
                        <el-tag icon="el-icon-error" style="color: yellowgreen" v-else>未付款</el-tag>
                    </template>

                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="130px">
                    <!-- 通过作用域插槽形式接收数据 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="show">
                        </el-button>
                        <!--查询物流按钮 -->
                        <el-tooltip content="查询物流" placement="top" :enterable="false">
                            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="querinfo.pagenum" :page-sizes="[1, 5, 10, 20]" :page-size="querinfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>

        <!-- 修改地址的对话框 -->
        <el-dialog title="修改地址" :visible.sync="addcateDialogVisible" width="50%" @close="dialogClose">
            <!-- 修改地址对话框内容主体区 -->
            <el-form :model="addcateForm" :rules="addcateFormRules" ref="addcateFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader expand-trigger="hover" :options="cityData" v-model="addcateForm.address1" clearable>
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addcateForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <!-- 修改地址对话框底部区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addcateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addcateDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 展示物流进度的对话框 -->
        <el-dialog title="物流进度" :visible.sync="wuliuDialogVisible" width="50%" >
            <!-- 时间线 -->
            <el-timeline>
                <el-timeline-item v-for="(activity, index) in wuliuinfo" :key="index" :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>

        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'

export default {
    data() {
        return {
            //查询条件
            querinfo: {
                query: '',
                //当前页码值
                pagenum: 1,
                //	每页显示多少条数据	
                pagesize: 5,
               
            },
            //订单数据列表数组
            orderlist: [],
            total: 0,
            // 控制修改地址对话框的显示与隐藏
            addcateDialogVisible: false,
            //修改地址的表单数据对象
            addcateForm: {
                address1: [],
                address2: ''
            },
            // 修改地址表单的验证规则对象
            addcateFormRules: {
                address1: [
                    { required: true, message: '请选择省市区/县', trigger: 'blur' },
                ],
                address2: [
                    { required: true, message: '请填写详细地址', trigger: 'blur' },
                ],
            },
            //省市区/县数据
            cityData: cityData,
            //物流对话框显示与隐藏
            wuliuDialogVisible: false,
            //物流信息数组
            wuliuinfo: []

        }
    },
    created() {
        this.getOrderList()
    },
    methods: {
        //获取订单数据列表
        async getOrderList() {
            const { data: res } = await this.$http.get('orders',
                { params: this.querinfo })
            if (res.meta.status !== 200)
                return this.$message.error('获取订单数据列表失败')
            console.log(res)
            //把订单数据列表赋值给orderlist
            this.orderlist = res.data.goods
            //把总数据条数赋值给total
            this.total = res.data.total
        },
        // 监听每页显示多少条数据改变的事件
        handleSizeChange(newSize) {
            this.querinfo.pagesize = newSize
            this.getOrderList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            this.querinfo.pagenum = newPage
            this.getOrderList()
        },
        //点击修改按钮展示修改地址对话框
        show() {
            this.addcateDialogVisible = true
        },
        //修改地址的对话框关闭清空数据
        dialogClose() {
            this.$refs.addcateFormRef.resetFields()
        },
        //获取物流进度
        async showProgress() {
            const { data: res } = await this.$http.get
                ('/kuaidi/1106975712662')
            if (res.meta.status !== 200)
                return this.$message.error('获取物流进度失败')

            this.wuliuinfo = res.data
            this.wuliuDialogVisible = true
            console.log(this.wuliuinfo)
        },
    },
}
</script>

<style lang="less" scoped>
.el-cascader {
    width: 100%;
}
</style>  