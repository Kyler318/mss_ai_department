<template>
  <div class="dashboard-page">
    <h2 style="margin-bottom: 25px; color: #303133;">👋 歡迎回來，{{ currentUserName }}</h2>

    <el-row :gutter="20" style="margin-bottom: 25px;">
      <el-col :span="8">
        <el-card shadow="hover" style="background-color: #f0f9eb; border-left: 5px solid #67C23A; border-radius: 10px;">
          <el-statistic title="📦 庫存設備總數" :value="totalInventory" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" style="background-color: #fdf6ec; border-left: 5px solid #E6A23C; border-radius: 10px;">
          <el-statistic title="📤 目前借出中" :value="rentedOut" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" style="background-color: #fef0f0; border-left: 5px solid #F56C6C; border-radius: 10px;">
          <el-statistic title="🔴 待處理 IT 支援" :value="pendingIT" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" style="border-radius: 10px;">
          <template #header>
            <span style="font-weight: bold; font-size: 16px;">📊 設備庫存狀態比例</span>
          </template>
          <div ref="chartRef" style="height: 300px; width: 100%;"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" style="border-radius: 10px;">
          <template #header>
            <span style="font-weight: bold; font-size: 16px;">📅 近期待處理支援任務</span>
          </template>
          <el-table :data="recentPendingIT" style="width: 100%" height="300" stripe>
            <el-table-column prop="location" label="地點" width="100" />
            <el-table-column prop="name" label="跟進人員" width="100" />
            <el-table-column prop="content" label="支援內容" show-overflow-tooltip />
          </el-table>
          <el-empty v-if="recentPendingIT.length === 0" description="目前沒有待處理任務 🎊" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import * as echarts from 'echarts'; // 引入 ECharts

const currentUserName = ref('');
const totalInventory = ref(0);
const rentedOut = ref(0);
const pendingIT = ref(0);
const recentPendingIT = ref([]);

const chartRef = ref(null);
let myChart = null;

const fetchData = async () => {
  // 1. 取得目前登入者名稱
  currentUserName.value = auth.currentUser?.displayName || auth.currentUser?.email || '系統管理員';

  // 2. 計算庫存與借出數量
  const invSnapshot = await getDocs(collection(db, "inventory"));
  let available = 0;
  let rented = 0;
  invSnapshot.forEach(doc => {
    if (doc.data().status === '借出中') rented++;
    else available++;
  });
  totalInventory.value = available + rented;
  rentedOut.value = rented;

  // 3. 獲取待處理的 IT 支援
  const itQuery = query(collection(db, "it_support"), where("status", "==", "pending"));
  const itSnapshot = await getDocs(itQuery);
  pendingIT.value = itSnapshot.size;
  
  // 將待處理任務存入陣列供表格顯示
  recentPendingIT.value = itSnapshot.docs.map(doc => doc.data());

  // 4. 數據準備好後，開始畫圖
  initChart(available, rented);
};

const initChart = (available, rented) => {
  if (chartRef.value) {
    // 初始化 ECharts
    myChart = markRaw(echarts.init(chartRef.value));
    
    const option = {
      tooltip: { trigger: 'item' },
      legend: { top: '0%', left: 'center' },
      color: ['#67C23A', '#E6A23C'], // 綠色代表可借用，橘色代表借出中
      series: [
        {
          name: '設備狀態',
          type: 'pie',
          radius: ['40%', '70%'], // 讓它變成甜甜圈形狀
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 20, fontWeight: 'bold' }
          },
          labelLine: { show: false },
          data: [
            { value: available, name: '可借用' },
            { value: rented, name: '借出中' }
          ]
        }
      ]
    };
    myChart.setOption(option);
    
    // 當瀏覽器視窗大小改變時，圖表自動跟著縮放
    window.addEventListener('resize', () => {
      myChart.resize();
    });
  }
};

onMounted(() => {
  fetchData();
});
</script>