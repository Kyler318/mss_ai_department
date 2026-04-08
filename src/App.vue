<template>
  <router-view v-if="route.path === '/login'" />

  <el-container v-else style="height: 100vh;">
    <el-aside width="220px" style="background-color: #304156;">
      <div style="height: 60px; line-height: 60px; text-align: center; color: white; font-size: 18px; font-weight: bold; border-bottom: 1px solid #1f2d3d;">
        💻 設備支援及租借系統
      </div>
      
      <el-menu
        :default-active="route.path"
        router
        class="el-menu-vertical-demo"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        style="border-right: none;"
      >
      <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>數據儀表板</span>
      </el-menu-item>

      <el-menu-item-group title="工作與任務">
        <el-menu-item index="/tasks">
          <el-icon><DocumentChecked /></el-icon>
          <span>非教學任務職責</span>
        </el-menu-item>

      <el-menu-item index="/leave-app">
        <el-icon><Document /></el-icon>
        <span>行政表單申請</span>
      </el-menu-item>
      </el-menu-item-group>
        
        <el-menu-item-group title="設備租借">
          <el-menu-item index="/rental"><el-icon><EditPen /></el-icon><span>新增租借</span></el-menu-item>
          <el-menu-item index="/management"><el-icon><List /></el-icon><span>歸還與管理</span></el-menu-item>
          <el-menu-item index="/inventory"><el-icon><Box /></el-icon><span>庫存總表</span></el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group title="IT 支援">
          <el-menu-item index="/it-form"><el-icon><Monitor /></el-icon><span>新增支援請求</span></el-menu-item>
          <el-menu-item index="/it-management"><el-icon><Calendar /></el-icon><span>支援管理與記錄</span></el-menu-item>
        </el-menu-item-group>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="background-color: white; box-shadow: 0 1px 4px rgba(0,21,41,.08); display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 20px; color: #303133;">系統管理台</h2>
        <div>
          <template v-if="currentUserDisplayName">
            <span style="margin-right: 15px; font-weight: bold; color: #409EFF;">👤 {{ currentUserDisplayName }}</span>
            <el-button type="danger" size="small" plain @click="handleLogout">登出</el-button>
          </template>
          
          <template v-else>
            <el-button type="primary" size="small" plain @click="router.push('/login')">👨‍💻 資訊科技部人員登入</el-button>
          </template>
        </div>
      </el-header>
      
      <el-main style="background-color: #f0f2f5;">
        <router-view /> </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth } from './firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { EditPen, List, Monitor, Calendar, Box, DataLine, DocumentChecked, Document } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const currentUserDisplayName = ref('');

// 監聽目前登入的用戶並取得名字
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserDisplayName.value = user.displayName || user.email;
    } else {
      // 確保登出時清空名字
      currentUserDisplayName.value = '';
    }
  });
});

const handleLogout = async () => {
  await signOut(auth);
  router.push('/login');
};
</script>