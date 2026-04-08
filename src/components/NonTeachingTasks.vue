<template>
  <div class="task-management-page">
    <el-tabs type="border-card" v-model="activeTab" @tab-click="handleTabClick">
      
      <el-tab-pane label="📝 填寫非教學任務" name="form">
        <el-form label-width="120px" style="max-width: 600px; margin: 20px auto;">
          
          <el-form-item label="記錄人員" required>
            <el-input v-model="form.userName" disabled />
          </el-form-item>

          <el-form-item label="任務類別" required>
            <el-select v-model="form.category" placeholder="請選擇任務類別" style="width: 100%;">
              <el-option label="學校AI發展" value="學校AI發展" />
              <el-option label="資訊科技輔助教學" value="資訊科技輔助教學" />
              <el-option label="學生個別化學習" value="學生個別化學習" />
              <el-option label="資訊科技輔助行政" value="資訊科技輔助行政" />
              <el-option label="優化校務系統" value="優化校務系統" />
              <el-option label="教育基本項目-校本培訓" value="教育基本項目-校本培訓" />
            </el-select>
          </el-form-item>

          <el-form-item label="完成說明" required>
            <el-input 
              v-model="form.description" 
              type="textarea" 
              :rows="5" 
              placeholder="請詳細說明完成了什麼事項..." 
            />
          </el-form-item>
          
          <el-form-item style="margin-top: 30px;">
            <el-button type="primary" size="large" @click="submitTask" style="width: 100%;" :loading="isSubmitting">
              送出完成記錄
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="📁 任務完成記錄" name="records">
        <el-table :data="records" style="width: 100%" height="500" stripe border>
          <el-table-column prop="createdAt" label="記錄時間" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="人員" width="120" sortable :sort-method="sortByName" />
          <el-table-column prop="category" label="任務類別" width="200">
            <template #default="scope">
              <el-tag type="success" effect="plain">{{ scope.row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="完成說明" show-overflow-tooltip />
        </el-table>
        <el-empty v-if="records.length === 0" description="目前沒有任務記錄" />
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { ElMessage } from 'element-plus';

const activeTab = ref('form');
const records = ref([]);
const isSubmitting = ref(false);

const form = reactive({
  userName: '',
  category: '',
  description: ''
});

// 元件載入時，自動抓取當前登入者姓名
onMounted(() => {
  form.userName = auth.currentUser?.displayName || auth.currentUser?.email || '未知用戶';
  fetchRecords();
});

// 切換 Tab 時自動重新讀取資料
const handleTabClick = (tab) => {
  if (tab.paneName === 'records') {
    fetchRecords();
  }
};

// 讓系統知道如何用中文的筆畫/拼音來比較兩個名字
const sortByName = (a, b) => {
  const nameA = a.userName || '';
  const nameB = b.userName || '';
  return nameA.localeCompare(nameB, 'zh-HK'); 
};

const submitTask = async () => {
  if (!form.category || !form.description) {
    ElMessage.warning('請填寫任務類別與說明！');
    return;
  }

  isSubmitting.value = true;
  try {
    await addDoc(collection(db, "non_teaching_tasks"), {
      userName: form.userName,
      category: form.category,
      description: form.description,
      createdAt: new Date()
    });
    
    ElMessage.success('任務記錄已成功送出！');
    
    // 清空表單（保留姓名）
    form.category = '';
    form.description = '';
    
    // 自動切換到記錄列表頁籤並刷新
    activeTab.value = 'records';
    fetchRecords();
  } catch (error) {
    console.error("寫入錯誤: ", error);
    ElMessage.error('送出失敗，請稍後重試。');
  } finally {
    isSubmitting.value = false;
  }
};

const fetchRecords = async () => {
  try {
    // 取得資料並以時間排序（新的在上面）
    const q = query(collection(db, "non_teaching_tasks"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    records.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("讀取記錄失敗", error);
  }
};

const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  return d.toLocaleString('zh-HK', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
};
</script>