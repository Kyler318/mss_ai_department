<template>
  <el-card class="box-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span style="font-weight: bold; font-size: 18px;">📝 新增租借記錄</span>
      </div>
    </template>
    
    <el-form label-width="100px" style="max-width: 600px; margin: 0 auto;">
      <el-form-item label="借用人姓名" required>
        <el-input v-model="borrowerName" placeholder="請輸入中文姓名" clearable />
      </el-form-item>

      <div v-for="(item, index) in items" :key="index">
        <el-divider v-if="index > 0"></el-divider>
        
        <el-form-item :label="'選擇設備 ' + (index + 1)" required>
          <el-select 
            v-model="item.inventoryId" 
            filterable 
            placeholder="請搜尋或選擇設備 (僅顯示目前可借用)" 
            style="width: 100%;"
            @change="(val) => handleDeviceSelect(val, index)"
          >
            <el-option 
              v-for="inv in availableInventory" 
              :key="inv.id" 
              :label="`[${inv.type}] ${inv.assetId}`" 
              :value="inv.id"
              :disabled="selectedIds.includes(inv.id)" 
            />
          </el-select>
        </el-form-item>

        <div style="text-align: right; margin-bottom: 15px;" v-if="items.length > 1">
          <el-button type="danger" plain size="small" @click="removeItem(index)">移除此設備</el-button>
        </div>
      </div>

      <el-form-item>
        <el-button type="primary" plain @click="addItem" style="width: 100%;">+ 借用多項設備</el-button>
      </el-form-item>
      
      <el-form-item style="margin-top: 30px;">
        <el-button type="primary" size="large" @click="submitRental" style="width: 100%;" :loading="isSubmitting">確認送出租借</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ElMessage } from 'element-plus';

const borrowerName = ref('');
// 紀錄選擇的庫存 ID、類型、資產編號
const items = ref([{ inventoryId: '', type: '', assetId: '', isReturned: false, returnTime: null }]);
const availableInventory = ref([]);
const isSubmitting = ref(false);

// 為了防止同一次借用選到兩台一樣的設備
const selectedIds = computed(() => items.value.map(item => item.inventoryId).filter(id => id));

// 1. 從 Firebase 抓取「可借用」的庫存清單
const fetchAvailableInventory = async () => {
  try {
    const q = query(collection(db, "inventory"), where("status", "==", "可借用"));
    const querySnapshot = await getDocs(q);
    availableInventory.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("讀取庫存失敗", error);
    ElMessage.error('無法載入庫存清單');
  }
};

// 2. 當下拉選單選中設備時，自動填入對應的 type 和 assetId
const handleDeviceSelect = (inventoryId, index) => {
  const selectedDevice = availableInventory.value.find(inv => inv.id === inventoryId);
  if (selectedDevice) {
    items.value[index].type = selectedDevice.type;
    items.value[index].assetId = selectedDevice.assetId;
  }
};

const addItem = () => {
  items.value.push({ inventoryId: '', type: '', assetId: '', isReturned: false, returnTime: null });
};

const removeItem = (index) => {
  items.value.splice(index, 1);
};

// 3. 送出租借
const submitRental = async () => {
  if (!borrowerName.value) return ElMessage.warning('請填寫借用人姓名！');
  if (items.value.some(item => !item.inventoryId)) return ElMessage.warning('請確保所有選項都已選擇設備！');
  
  isSubmitting.value = true;
  try {
    const processedItems = items.value.map((item, index) => ({
      ...item,
      id: `${Date.now()}-${index}` // 給每一項一個唯一 ID
    }));

    // A. 寫入租借記錄到 rentals collection
    await addDoc(collection(db, "rentals"), {
      borrowerName: borrowerName.value,
      borrowTime: new Date(),
      items: processedItems
    });
    
    // B. 同步更新 inventory collection，把設備狀態改成「借出中」
    for (const item of processedItems) {
      const invRef = doc(db, "inventory", item.inventoryId);
      await updateDoc(invRef, { status: '借出中' });
    }
    
    ElMessage.success('租借成功！設備已標記為借出。');
    
    // 清空表單並重新抓取最新庫存
    borrowerName.value = '';
    items.value = [{ inventoryId: '', type: '', assetId: '', isReturned: false, returnTime: null }];
    await fetchAvailableInventory(); 
  } catch (error) {
    console.error("寫入錯誤: ", error);
    ElMessage.error('系統發生錯誤，請稍後再試。');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchAvailableInventory();
});
</script>