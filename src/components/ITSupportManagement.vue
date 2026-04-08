<template>
  <div class="it-management-page">
    <el-tabs type="border-card" v-model="activeTab" @tab-click="fetchRecords">
      
      <el-tab-pane label="📅 待處理排期表" name="pending">
        <el-alert title="以下為尚未完成的排期支援任務，完成後請點擊「標記為已完成」。" type="warning" show-icon style="margin-bottom: 20px;" />
        
        <div style="margin-bottom: 15px; text-align: right;" v-if="pendingRecords.length > 0">
          <el-radio-group v-model="pendingSort" size="small">
            <el-radio-button label="time">🕒 依時間排序</el-radio-button>
            <el-radio-button label="name">👤 依人員姓名</el-radio-button>
          </el-radio-group>
        </div>

        <el-empty v-if="pendingRecords.length === 0" description="目前沒有待處理的排期" />
        
        <el-space direction="vertical" fill style="width: 100%;">
          <el-card v-for="record in pendingRecords" :key="record.id" shadow="hover" style="border-left: 5px solid #E6A23C;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="margin: 0 0 10px 0; color: #303133;">📍 {{ record.location }}</h3>
                <p style="margin: 5px 0;"><strong>支援人員：</strong>{{ record.name }}</p>
                <p style="margin: 5px 0;"><strong>預定時間：</strong><span style="color: #E6A23C; font-weight: bold;">{{ formatDate(record.scheduledTime) }}</span></p>
                <p style="margin: 5px 0;"><strong>支援內容：</strong>{{ record.content }}</p>
              </div>
              <el-button type="success" @click="markAsCompleted(record.id)">✅ 標記為已完成</el-button>
            </div>
          </el-card>
        </el-space>
      </el-tab-pane>

      <el-tab-pane label="📁 歷史支援記錄" name="completed">
        
        <div style="margin-bottom: 15px; text-align: right;" v-if="completedRecords.length > 0">
          <el-radio-group v-model="completedSort" size="small">
            <el-radio-button label="time">🕒 最新完成優先</el-radio-button>
            <el-radio-button label="name">👤 依人員姓名</el-radio-button>
          </el-radio-group>
        </div>

        <el-empty v-if="completedRecords.length === 0" description="目前沒有已完成的記錄" />
        
        <el-space direction="vertical" fill style="width: 100%;">
          <el-card v-for="record in completedRecords" :key="record.id" shadow="hover" style="border-left: 5px solid #67C23A;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="margin: 0 0 10px 0; color: #303133;">
                  <el-tag :type="record.type === '即時支援' ? 'danger' : 'primary'" size="small" style="margin-right: 10px;">
                    {{ record.type }}
                  </el-tag>
                  📍 {{ record.location }}
                </h3>
                <p style="margin: 5px 0;"><strong>支援人員：</strong>{{ record.name }}</p>
                <p style="margin: 5px 0;"><strong>支援內容：</strong>{{ record.content }}</p>
                <p style="margin: 5px 0; font-size: 13px; color: #909399;">
                  建立時間：{{ formatDate(record.requestTime) }}<br/>
                  完成時間：{{ formatDate(record.completionTime) }}
                </p>
              </div>
            </div>
          </el-card>
        </el-space>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ElMessage } from 'element-plus';

const records = ref([]);
const activeTab = ref('pending');

// 新增：用來控制排序狀態的變數
const pendingSort = ref('time');
const completedSort = ref('time');

// 自動分類與排序：待處理的排期
const pendingRecords = computed(() => {
  let list = records.value.filter(r => r.status === 'pending');
  
  if (pendingSort.value === 'name') {
    // 依中文姓名筆畫/拼音排序
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-HK'));
  } else {
    // 預設（不特別排序人名），依預定時間先後排序
    return list.sort((a, b) => (a.scheduledTime?.toDate() || 0) - (b.scheduledTime?.toDate() || 0));
  }
});

// 自動分類與排序：已完成的記錄
const completedRecords = computed(() => {
  let list = records.value.filter(r => r.status === 'completed');
  
  if (completedSort.value === 'name') {
    // 依中文姓名筆畫/拼音排序
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-HK'));
  } else {
    // 預設（不特別排序人名），讓最新的完成記錄排在最上面
    return list.sort((a, b) => (b.completionTime?.toDate() || 0) - (a.completionTime?.toDate() || 0));
  }
});

const fetchRecords = async () => {
  try {
    const q = query(collection(db, "it_support"));
    const querySnapshot = await getDocs(q);
    records.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("讀取錯誤", error);
    ElMessage.error('讀取資料失敗');
  }
};

const markAsCompleted = async (recordId) => {
  try {
    const recordRef = doc(db, "it_support", recordId);
    await updateDoc(recordRef, { 
      status: 'completed',
      completionTime: new Date()
    });

    ElMessage.success('已成功標記為完成！');
    fetchRecords(); // 重新整理列表
  } catch (error) {
    console.error("更新錯誤", error);
    ElMessage.error('操作失敗，請重試。');
  }
};

const formatDate = (dateInput) => {
  if (!dateInput) return '無';
  const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  return d.toLocaleString('zh-HK', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
};

onMounted(() => {
  fetchRecords();
});
</script>