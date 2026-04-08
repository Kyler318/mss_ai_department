<template>
  <div class="management-page">
    
    <el-card shadow="never" style="margin-bottom: 20px; background-color: #fdf6ec;">
      <template #header>
        <span style="font-weight: bold; color: #e6a23c;">⚠️ 未還設備概覽</span>
      </template>
      <div v-if="Object.keys(unreturnedSummary).length === 0" style="color: #909399;">
        目前所有設備均已歸還。
      </div>
      <div v-else>
        <p v-for="(summary, name) in unreturnedSummary" :key="name" style="margin: 5px 0;">
          <strong style="font-size: 16px;">{{ name }}</strong>：剩餘 <el-tag type="danger" round>{{ summary.count }}</el-tag> 部 
          <span style="color: #606266; font-size: 13px;">(類型: {{ summary.types.join(', ') }})</span>
        </p>
      </div>
    </el-card>

    <div style="margin-bottom: 20px;">
      <span style="margin-right: 10px; font-weight: bold; color: #606266;">選擇查詢月份：</span>
      <el-date-picker
        v-model="selectedMonth"
        type="month"
        placeholder="選擇月份"
        value-format="YYYY-MM"
        @change="fetchRecords"
      />
    </div>

    <el-space direction="vertical" fill style="width: 100%;">
      <el-card 
        v-for="record in records" 
        :key="record.id" 
        shadow="hover"
        :style="activeRecordId === record.id ? 'border: 2px solid #67C23A;' : ''"
        @click="activeRecordId = record.id"
        style="cursor: pointer;"
      >
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 16px; font-weight: bold;">👤 {{ record.borrowerName }}</span>
            <span style="color: #909399; font-size: 14px;">借出時間：{{ formatDate(record.borrowTime) }}</span>
          </div>
        </template>

        <div v-for="item in record.items" :key="item.id" style="margin-bottom: 10px;">
          <div v-if="item.isReturned" style="color: #a8abb2; margin-bottom: 5px;">
            <el-tag type="info" style="margin-right: 10px;">已歸還</el-tag>
            <span style="text-decoration: line-through;">{{ item.type === '其他' ? item.customType : item.type }} ({{ item.assetId }})</span>
            <span style="font-size: 12px; margin-left: 10px;">還於: {{ formatDate(item.returnTime) }}</span>
            
            <span v-if="item.returnOperator" style="font-size: 12px; margin-left: 10px; color: #409EFF;">
              👤 歸還操作人：{{ item.returnOperator }}
            </span>
          </div>
          
          <div v-else>
            <el-checkbox v-model="returnSelection[record.id]" :label="item.id">
              <el-tag type="warning" style="margin-right: 10px;">未歸還</el-tag>
              <span style="font-weight: bold; color: #303133;">{{ item.type === '其他' ? item.customType : item.type }}</span> 
              <span style="color: #606266;"> (資產編號: {{ item.assetId }})</span>
            </el-checkbox>
          </div>
        </div>

        <div style="margin-top: 15px; text-align: right;" v-if="returnSelection[record.id]?.length > 0">
          <el-button type="success" @click.stop="submitReturn(record.id)">確認歸還勾選設備</el-button>
        </div>
      </el-card>
      
      <el-empty v-if="records.length === 0" description="該月份無租借記錄" />
    </el-space>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db,auth } from '../firebaseConfig';
import { ElMessage } from 'element-plus';

const records = ref([]);
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const returnSelection = ref({});
const activeRecordId = ref(null);

const unreturnedSummary = computed(() => {
  const summary = {};
  records.value.forEach(record => {
    record.items.forEach(item => {
      if (!item.isReturned) {
        if (!summary[record.borrowerName]) {
          summary[record.borrowerName] = { count: 0, types: new Set() };
        }
        summary[record.borrowerName].count++;
        const displayType = item.type === '其他' ? item.customType : item.type;
        summary[record.borrowerName].types.add(displayType);
      }
    });
  });
  
  for (let name in summary) {
    summary[name].types = Array.from(summary[name].types);
  }
  return summary;
});

const fetchRecords = async () => {
  if (!selectedMonth.value) return;
  
  const startDate = new Date(`${selectedMonth.value}-01T00:00:00`);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

  try {
    const q = query(
      collection(db, "rentals"),
      where("borrowTime", ">=", startDate),
      where("borrowTime", "<=", endDate)
    );

    const querySnapshot = await getDocs(q);
    records.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    records.value.forEach(r => {
      if (!returnSelection.value[r.id]) returnSelection.value[r.id] = [];
    });
  } catch (error) {
    console.error("讀取錯誤", error);
    ElMessage.error('讀取資料失敗');
  }
};

const submitReturn = async (recordId) => {
  const selectedItemIds = returnSelection.value[recordId];
  if (!selectedItemIds || selectedItemIds.length === 0) return;

  const recordIndex = records.value.findIndex(r => r.id === recordId);
  const currentRecord = records.value[recordIndex];
  const operatorName = auth.currentUser?.displayName || auth.currentUser?.email || '系統管理員';

  // 整理出被勾選準備歸還的設備
  const returnedItemsList = []; 

  const updatedItems = currentRecord.items.map(item => {
    if (selectedItemIds.includes(item.id)) {
      returnedItemsList.push(item); // 收集起來等一下要去改庫存
      return { 
        ...item, 
        isReturned: true, 
        returnTime: new Date(),
        returnOperator: operatorName 
      };
    }
    return item;
  });

  try {
    // 1. 更新租借記錄為「已歸還」
    const recordRef = doc(db, "rentals", recordId);
    await updateDoc(recordRef, { items: updatedItems });

    // 2. 核心動作：把總庫存的狀態改回「可借用」
    for (const item of returnedItemsList) {
      // 為了相容以前沒有 inventoryId 的舊記錄，我們用 assetId 去尋找庫存並更新
      const q = query(collection(db, "inventory"), where("assetId", "==", item.assetId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // 找到該資產，把狀態改回可借用
        const invDocId = querySnapshot.docs[0].id;
        await updateDoc(doc(db, "inventory", invDocId), { status: '可借用' });
      }
    }

    // 3. 更新前端畫面
    records.value[recordIndex].items = updatedItems;
    returnSelection.value[recordId] = [];
    ElMessage.success('設備歸還成功！庫存已自動釋放。');
  } catch (error) {
    console.error("更新錯誤", error);
    ElMessage.error('歸還操作失敗，請重試。');
  }
};

const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  return d.toLocaleString('zh-HK');
};

onMounted(() => {
  fetchRecords();
});
</script>