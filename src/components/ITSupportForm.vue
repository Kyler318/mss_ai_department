<template>
  <el-card class="box-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span style="font-weight: bold; font-size: 18px;">🛠️ 新增 IT 支援記錄</span>
      </div>
    </template>
    
    <el-form label-width="120px" style="max-width: 600px; margin: 0 auto;">
        
        <el-form-item label="支援人員" required>
            <el-input v-model="form.name" disabled />
        </el-form-item>

      <el-form-item label="支援類型" required>
        <el-radio-group v-model="form.type">
          <el-radio label="即時支援" border>即時支援</el-radio>
          <el-radio label="排期支援" border>排期支援</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="支援地點" required>
        <el-select v-model="form.location" filterable placeholder="請選擇或搜尋地點" style="width: 100%;">
          <el-option v-for="loc in locations" :key="loc" :label="loc" :value="loc" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="form.type === '排期支援'" label="預定支援時間" required>
        <el-date-picker
          v-model="form.scheduledTime"
          type="datetime"
          placeholder="選擇日期和時間"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="支援內容" required>
        <el-input 
          v-model="form.content" 
          type="textarea" 
          :rows="4" 
          placeholder="請詳細描述需要支援的事項（例如：投影機無畫面、電腦無法開機等）" 
        />
      </el-form-item>
      
      <el-form-item style="margin-top: 30px;">
        <el-button type="primary" size="large" @click="submitSupport" style="width: 100%;">
          送出支援單
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, onMounted } from 'vue'; // 補上 onMounted
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { ElMessage } from 'element-plus';

// 課室清單
const locations = [
  '教員室','校長室','資詢處','1號室', '2號室', '3號室', '4號室', '音樂室', '大健康室', '視覺藝術室', 
  '6號室', '7號室', '8號室', '電腦室', '電腦B室', '舞蹈室', '10號室', 
  '會議室', '8樓電腦B室', '8樓4號室', '8樓5號室', '8樓6號室', '8樓7號室'
];

// 這裡只保留一個 form 的宣告
const form = reactive({
  name: '', 
  type: '即時支援',
  location: '',
  scheduledTime: null,
  content: ''
});

// 元件載入時，自動抓取當前帳號的中文名
onMounted(() => {
  form.name = auth.currentUser?.displayName || auth.currentUser?.email || '未知用戶';
});

const submitSupport = async () => {
  if (!form.name || !form.location || !form.content) {
    ElMessage.warning('請填寫所有必填欄位！');
    return;
  }
  if (form.type === '排期支援' && !form.scheduledTime) {
    ElMessage.warning('排期支援必須選擇預定時間！');
    return;
  }

  try {
    const now = new Date();
    // 判斷狀態：即時支援直接完成，排期則是 pending (待處理)
    const status = form.type === '即時支援' ? 'completed' : 'pending';
    
    await addDoc(collection(db, "it_support"), {
      name: form.name,
      type: form.type,
      location: form.location,
      content: form.content,
      status: status,
      requestTime: now,
      scheduledTime: form.type === '排期支援' ? form.scheduledTime : null,
      completionTime: form.type === '即時支援' ? now : null 
    });
    
    ElMessage.success('IT 支援記錄已成功新增！');
    
    // 清空表單 (除了名字保留)
    form.type = '即時支援';
    form.location = '';
    form.scheduledTime = null;
    form.content = '';
  } catch (error) {
    console.error("寫入錯誤: ", error);
    ElMessage.error('系統發生錯誤，請稍後再試。');
  }
};
</script>