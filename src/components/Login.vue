<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="a">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/cook.png">
            </div>
            <!-- 登录表单区 -->
            <el-form ref="loginFormref" :model="loginForm" :rules="loginFormrules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
                </el-form-item>
                <!-- 按钮 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetloginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
      /* eslint-disable */
export default {
  
    data() {
        return {
            //这是登录表单的数据绑定对象
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            //这是表单的验证规则对象
            loginFormrules: {
               // 验证用户名
                username: [
                { required: true, message: '请输入登录名称', trigger: 'blur' },
                { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
               // 验证密码
                password: [
                { required: true, message: '请输入登录密码', trigger: 'blur' },
                { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        //点击重置按钮，重置登录表单
        resetloginForm(){
           // console.log(this).
           this.$refs.loginFormref.resetFields();
        },
        //登录
        login(){
          // console.log(this).
           this.$refs.loginFormref.validate(async valid=>{
            if (!valid) return;
            const{ data: res } =await this.$http.post('login',this.loginForm);
            console.log(res)
            if(res.meta.status !== 200) 
            return this.$message.error('登录失败');
              this.$message.success('登录成功')
              window.sessionStorage.setItem('token',res.data.token);
              this.$router.push('/home')
           });
        },
    },
}
</script>

<style  lang="less" scoped>
.a {
    background-color: aqua;
    height: 100%;
}

.login_box {
    width: 450px;
    height: 300px;
    background-color: white;
    border-radius: 10px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
        height: 130px;
        width: 130px;
        border: 1px solid white;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px fuchsia;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: antiquewhite;
        }
    }

    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }

    .btns {
        display: flex;
        justify-content: flex-end;
    }

}
</style>
