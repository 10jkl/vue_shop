<template>
    <el-container class="home-container">
        <!-- 头部 -->
        <el-header>
            <div>
                <img src="../assets/cook.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="iscollapse ? '64px' : '200px'">
                <!-- 菜单的折叠与展开 -->
                <div class="toggle-button" @click="toggleCollapse">|| ||</div>
                <!-- 侧边栏菜单区 -->
                <el-menu background-color="#333744" text-color="#fff" :collapse="iscollapse"
                    :collapse-transition="false" active-text-color="#409eff" unique-opened router
                    :default-active="activePath">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                        <!-- 一级菜单模板区 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsobj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                            @click="saveNavState('/' + subItem.path)">
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            //左侧菜单数据
            menulist: [],
            iconsobj: {
                '125': 'el-icon-user',
                '103': 'el-icon-setting',
                '101': 'el-icon-goods',
                '102': 'el-icon-s-order',
                '145': 'el-icon-s-data'
            },
            // 是否折叠
            iscollapse: false,
            // 被激活的链接地址
            activePath: ''
        }
    },
    created() {
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
        logout() {
            //清空token
            window.sessionStorage.clear()
            //跳转登录页
            this.$router.push('/login')
        },
        //获取所有的菜单
        async getMenuList() {
            const { data: res } = await this.$http.get('menus')
            if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg)
            this.menulist = res.data
            console.log(res)
        },
        //点击按钮切换菜单的折叠与展开
        toggleCollapse() {
            this.iscollapse = !this.iscollapse
        },
        // 保存链接的激活状态
        saveNavState(activePath) {
            window.sessionStorage.setItem('activePath', activePath)
            this.activePath = activePath
        },
    },
}
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: white;
    font-size: 20px;

    >div {
        display: flex;
        align-items: center;

        span {
            margin-left: 15px;
        }

        img {
            width: 15%;
            border-radius: 50%;
        }
    }
}

.el-aside {
    background-color: #333744;

    .el-menu {
        border-right: none;
    }
}

.el-main {
    background-color: #eaedf1;
}

.toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>