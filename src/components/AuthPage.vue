<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5;">
    <el-card style="width: 400px; padding: 20px;" shadow="always">
      <h2 style="text-align: center; color: #409EFF; margin-bottom: 20px;">💻 設備支援系統</h2>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="登入" name="login">
          <el-form>
            <el-form-item>
              <el-input v-model="loginForm.username" placeholder="登入帳號 (例如: wang)" clearable />
            </el-form-item>
            <el-form-item>
              <el-input v-model="loginForm.password" type="password" placeholder="密碼" show-password @keyup.enter="handleLogin" />
            </el-form-item>
            <el-button type="primary" style="width: 100%;" @click="handleLogin" :loading="loading">登入</el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="註冊帳號" name="register">
          <el-form>
            <el-form-item>
              <el-input v-model="registerForm.displayName" placeholder="真實姓名 (顯示用，如: 王老師)" clearable />
            </el-form-item>
            <el-form-item>
              <el-input v-model="registerForm.username" placeholder="設定登入帳號 (只能輸入英文數字)" clearable />
            </el-form-item>
            <el-form-item>
              <el-input v-model="registerForm.password" type="password" placeholder="設定密碼 (至少 6 碼)" show-password />
            </el-form-item>
            <el-button type="success" style="width: 100%;" @click="handleRegister" :loading="loading">註冊帳號</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const activeTab = ref('login');
const loading = ref(false);

// 將 email 欄位改成 username
const loginForm = ref({ username: '', password: '' });
const registerForm = ref({ username: '', password: '', displayName: '' });

// 用來欺騙 Firebase 的隱藏網域
const FAKE_DOMAIN = '@rental.system.local';

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    return ElMessage.warning('請填寫完整資訊');
  }
  loading.value = true;
  try {
    // 背景偷偷組合出信箱格式： username + @rental.system.local
    const fakeEmail = `${loginForm.value.username}${FAKE_DOMAIN}`;
    await signInWithEmailAndPassword(auth, fakeEmail, loginForm.value.password);
    
    ElMessage.success('登入成功！');
    router.push('/');
  } catch (error) {
    console.error("登入錯誤:", error);
    ElMessage.error('登入失敗：帳號或密碼錯誤');
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  if (!registerForm.value.username || !registerForm.value.password || !registerForm.value.displayName) {
    return ElMessage.warning('請填寫完整資訊');
  }
  
  // 簡單檢查帳號是否只包含英文和數字
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  if (!usernameRegex.test(registerForm.value.username)) {
    return ElMessage.warning('登入帳號只能包含英文和數字');
  }

  loading.value = true;
  try {
    // 一樣背景偷偷組合出信箱格式
    const fakeEmail = `${registerForm.value.username}${FAKE_DOMAIN}`;
    const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, registerForm.value.password);
    
    // 將輸入的真實姓名存入 Firebase Auth 的 DisplayName 中
    await updateProfile(userCredential.user, { displayName: registerForm.value.displayName });
    
    ElMessage.success('註冊成功！已自動登入');
    window.location.href = '/';
  } catch (error) {
    console.error("註冊錯誤:", error);
    // 攔截 Firebase 帳號重複的錯誤
    if (error.code === 'auth/email-already-in-use') {
      ElMessage.error('註冊失敗：此帳號已被使用');
    } else {
      ElMessage.error('註冊失敗：' + error.message);
    }
  } finally {
    loading.value = false;
  }
};
</script>