<template>
  <div class="inventory-page">
    <el-card shadow="hover" style="margin-bottom: 20px;">
      <template #header>
        <span style="font-weight: bold; font-size: 18px;">📦 新增設備至總庫存</span>
      </template>
      
      <el-form :inline="true" :model="newItem" class="demo-form-inline">
        <el-form-item label="設備類型">
          <el-select v-model="newItem.type" placeholder="選擇類型" style="width: 150px;">
            <el-option label="手提電腦" value="手提電腦" />
            <el-option label="iPad" value="iPad" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="資產編號">
          <el-input v-model="newItem.assetId" placeholder="例如: NB-001" clearable @keyup.enter="addInventoryItem" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="addInventoryItem">➕ 新增入庫</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <span style="font-weight: bold; font-size: 18px;">📋 目前庫存清單</span>
      </template>
      
      <el-table :data="inventoryList" style="width: 100%" height="400" stripe>
        <el-table-column prop="assetId" label="資產編號" width="180" sortable />
        <el-table-column prop="type" label="設備類型" width="150" sortable />
        <el-table-column prop="status" label="目前狀態" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === '可借用' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="danger" plain @click="deleteItem(scope.row.id)" :disabled="scope.row.status === '借出中'">
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ElMessage, ElMessageBox } from 'element-plus';

const newItem = ref({ type: '手提電腦', assetId: '' });
const inventoryList = ref([]);

// 讀取庫存資料
const fetchInventory = async () => {
  try {
    // 根據資產編號排序
    const q = query(collection(db, "inventory"), orderBy("assetId"));
    const querySnapshot = await getDocs(q);
    inventoryList.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("讀取庫存失敗", error);
  }
};

// 新增設備到庫存
const addInventoryItem = async () => {
  if (!newItem.value.assetId) {
    return ElMessage.warning('請輸入資產編號');
  }

  // 檢查是否已經有重複的資產編號
  const isDuplicate = inventoryList.value.some(item => item.assetId === newItem.value.assetId);
  if (isDuplicate) {
    return ElMessage.error('此資產編號已存在於庫存中！');
  }

  try {
    await addDoc(collection(db, "inventory"), {
      type: newItem.value.type,
      assetId: newItem.value.assetId,
      status: '可借用' // 預設狀態為可借用
    });
    
    ElMessage.success('設備已成功入庫！');
    newItem.value.assetId = ''; // 清空輸入框
    fetchInventory(); // 重新讀取列表
  } catch (error) {
    console.error("新增失敗", error);
    ElMessage.error('入庫失敗');
  }
};

// 刪除庫存 (僅限未借出時可刪除)
// 刪除庫存 (加入二次確認防呆機制)
const deleteItem = async (id) => {
  try {
    // 1. 彈出警告確認視窗
    await ElMessageBox.confirm(
      '確定要將此設備從總庫存中永久刪除嗎？',
      '⚠️ 刪除確認',
      {
        confirmButtonText: '確定刪除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 2. 如果使用者點擊了「確定刪除」，才會執行到這裡
    await deleteDoc(doc(db, "inventory", id));
    ElMessage.success('設備已成功刪除');
    fetchInventory(); // 重新整理列表

  } catch (error) {
    // 3. 判斷是使用者按了「取消」，還是真的發生了系統錯誤
    if (error === 'cancel') {
      ElMessage.info('已取消刪除操作');
    } else {
      console.error("刪除失敗", error);
      ElMessage.error('刪除操作失敗，請重試。');
    }
  }
};

onMounted(() => {
  fetchInventory();
});
</script>