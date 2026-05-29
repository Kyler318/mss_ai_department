沒問題！這就為你奉上「已經修復手寫板無法繪製問題」的終極完整版 `LeaveApplication.vue` 程式碼。

我已經把 `activeTab` 的分頁切換監聽、畫布外框的固定高度 (`height: 200px; overflow: hidden`)，以及防干擾的 CSS 全部完美整合進去了。

請將 `src/components/LeaveApplication.vue` 的內容**全部替換**為以下這段程式碼：

```html
<template>
  <div class="leave-app-page">
    <el-tabs v-model="activeTab" type="border-card">
      
      <el-tab-pane label="📄 M15 假期申請" name="m15">
        <el-form :model="m15Form" label-width="120px" style="max-width: 800px; margin: 20px auto;">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" required><el-input v-model="m15Form.name" placeholder="請輸入姓名" /></el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="職位" required><el-input v-model="m15Form.position" placeholder="例如：教師" /></el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="休假期間" required>
            <el-date-picker v-model="m15Form.dateRange" type="daterange" range-separator="至" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="休假類別" required>
            <el-radio-group v-model="m15Form.leaveType">
              <el-radio label="年假">年假</el-radio>
              <el-radio label="病假">病假</el-radio>
              <el-radio label="補假">補假</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="休假原因" required>
            <el-input v-model="m15Form.reason" type="textarea" :rows="3" />
          </el-form-item>
          <el-button type="primary" size="large" @click="exportM15" style="width: 100%;">匯出 M15 申請表</el-button>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="🔄 M15A 時間調動" name="m15a">
        <el-form :model="m15aForm" label-width="110px" style="max-width: 950px; margin: 20px auto;">
          
          <div style="background: #fff; padding: 20px; border: 1px solid #dcdfe6; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #606266; border-left: 4px solid #409EFF; padding-left: 10px;">1.0 個人與調動資料 (必填)</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="姓名 (C4)" required><el-input v-model="m15aForm.name" placeholder="請輸入姓名" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="部門 (I4)" required>
                  <el-select v-model="m15aForm.dept" placeholder="請選擇部門" style="width: 100%;">
                    <el-option label="資訊科技/AI輔助部" value="資訊科技/AI輔助部" />
                    <el-option label="行政事務部" value="行政事務部" />
                    <el-option label="教學事務部" value="教學事務部" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="電話 (C5)" required><el-input v-model="m15aForm.phone" placeholder="填寫聯絡電話" /></el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="職位 (I5)" required><el-input v-model="m15aForm.position" placeholder="例如：教師" /></el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="調動日期 (E7)" required>
                  <el-date-picker
                    v-model="m15aForm.totalDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="開始日期"
                    end-placeholder="結束日期"
                    style="width: 100%;"
                  />
                  <div style="font-size: 12px; color: #909399; margin-top: 4px;">格式將自動轉為：3月24日-3月28日</div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="調動原因 (C8)" required>
              <el-input v-model="m15aForm.reason" placeholder="請輸入原因..." />
            </el-form-item>
          </div>

          <div v-for="(record, index) in m15aForm.records" :key="index" style="background: #fdfdfd; padding: 20px; border: 1px solid #ebeef5; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #409EFF;">📅 調動項目 {{ index + 1 }}</h4>
            <el-row :gutter="30">
              <el-col :span="12" style="border-right: 1px dashed #dcdfe6;">
                <div style="font-weight: bold; margin-bottom: 10px;">🕒 原定上班時間</div>
                <el-form-item label="日期"><el-date-picker v-model="record.origDate" type="date" style="width: 100%;" placeholder="選擇日期" @change="syncAdjDate(record)"/></el-form-item>
                <el-form-item label="時段一"><div style="display: flex; align-items: center; width: 100%;"><el-input v-model="record.origS1" placeholder="例如：09:00-13:30" /><span v-if="calculateHours(record.origS1) > 0" style="margin-left: 10px; color: #E6A23C; font-weight: bold; width: 50px;">{{ calculateHours(record.origS1) }}H</span></div></el-form-item>
                <el-form-item label="時段二"><div style="display: flex; align-items: center; width: 100%;"><el-input v-model="record.origS2" placeholder="選填，例如：14:30-16:30" /><span v-if="calculateHours(record.origS2) > 0" style="margin-left: 10px; color: #E6A23C; font-weight: bold; width: 50px;">{{ calculateHours(record.origS2) }}H</span></div></el-form-item>
                <el-form-item label="時段三"><div style="display: flex; align-items: center; width: 100%;"><el-input v-model="record.origS3" placeholder="選填，例如：18:00-21:00" /><span v-if="calculateHours(record.origS3) > 0" style="margin-left: 10px; color: #E6A23C; font-weight: bold; width: 50px;">{{ calculateHours(record.origS3) }}H</span></div></el-form-item>
              </el-col>
              
              <el-col :span="12">
                <div style="font-weight: bold; margin-bottom: 10px;">🔄 調動後上班時間</div>
                <el-form-item label="日期"><el-date-picker v-model="record.adjDate" type="date" style="width: 100%;" placeholder="選擇日期" /></el-form-item>
                <el-form-item label="時段一"><div style="display: flex; align-items: center; width: 100%;"><el-input v-model="record.adjS1" placeholder="例如：09:00-13:30" /><span v-if="calculateHours(record.adjS1) > 0" style="margin-left: 10px; color: #67C23A; font-weight: bold; width: 50px;">{{ calculateHours(record.adjS1) }}H</span></div></el-form-item>
                <el-form-item label="時段二"><div style="display: flex; align-items: center; width: 100%;"><el-input v-model="record.adjS2" placeholder="選填，例如：14:30-16:30" /><span v-if="calculateHours(record.adjS2) > 0" style="margin-left: 10px; color: #67C23A; font-weight: bold; width: 50px;">{{ calculateHours(record.adjS2) }}H</span></div></el-form-item>
                <el-form-item label="時段三"><div style="display: flex; align-items: center; width: 100%;"><el-input v-model="record.adjS3" placeholder="選填" /><span v-if="calculateHours(record.adjS3) > 0" style="margin-left: 10px; color: #67C23A; font-weight: bold; width: 50px;">{{ calculateHours(record.adjS3) }}H</span></div></el-form-item>
              </el-col>
            </el-row>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #dcdfe6; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #606266; border-left: 4px solid #67C23A; padding-left: 10px;">3.0 員工手寫簽署驗證</h4>
            
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #606266;"><span style="color: #F56C6C; margin-right: 4px;">*</span>請在下方框內簽名 (填寫 B22)</span>
              <el-button type="danger" plain size="small" @click="clearSignature">清除重簽</el-button>
            </div>
            
            <div style="border: 2px dashed #dcdfe6; border-radius: 8px; background-color: #fafafa; margin-bottom: 20px; height: 200px; overflow: hidden; position: relative;">
              <Vue3Signature 
                :key="activeTab"
                ref="signaturePad" 
                :sigOption="state.option" 
                :w="'100%'" 
                :h="'200px'" 
                @end="saveSignature"
                class="signature-canvas"
                style="width: 100%; height: 100%;"
              />
            </div>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="簽署日期 (B23)">
                  <el-input :value="getTodayStr()" disabled style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <el-button type="success" size="large" @click="exportM15A" style="width: 100%; font-weight: bold;">
            📥 匯出 M15A 調動表 (Excel)
          </el-button>
        </el-form>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ElMessage } from 'element-plus';
import Vue3Signature from "vue3-signature"; 

// 🟢 用來追蹤目前所在分頁，解決畫布在隱藏分頁無法初始化的問題
const activeTab = ref('m15');

// ================= 表單資料 =================
const m15Form = ref({ name: '', position: '', dateRange: [], leaveType: '年假', reason: '' });

const m15aForm = ref({
  name: '',
  dept: '資訊科技/AI輔助部',
  phone: '',
  position: '教師',
  totalDateRange: [], 
  reason: '',
  signatureImageBase64: '', 
  records: [
    { origDate: '', origS1: '', origS2: '', origS3: '', adjDate: '', adjS1: '', adjS2: '', adjS3: '' }, 
    { origDate: '', origS1: '', origS2: '', origS3: '', adjDate: '', adjS1: '', adjS2: '', adjS3: '' }, 
    { origDate: '', origS1: '', origS2: '', origS3: '', adjDate: '', adjS1: '', adjS2: '', adjS3: '' }  
  ]
});

// ================= 畫布簽名邏輯 =================
const signaturePad = ref(null);
const state = reactive({
  option: {
    penColor: "rgb(0, 0, 0)", // 簽名筆觸顏色 (黑色)
    backgroundColor: "rgba(0,0,0,0)", // 透明背景
    minWidth: 2, 
    maxWidth: 4
  }
});

const saveSignature = () => {
  if (signaturePad.value) {
    m15aForm.value.signatureImageBase64 = signaturePad.value.save("image/png");
  }
};

const clearSignature = () => {
  if (signaturePad.value) {
    signaturePad.value.clear();
    m15aForm.value.signatureImageBase64 = '';
  }
};

// ================= 功能：自動載入與儲存個人資料 =================
onMounted(() => {
  const savedInfo = localStorage.getItem('leaveAppPersonalInfo');
  if (savedInfo) {
    const info = JSON.parse(savedInfo);
    m15aForm.value.name = info.name || '';
    m15aForm.value.dept = info.dept || '資訊科技/AI輔助部';
    m15aForm.value.phone = info.phone || '';
    m15aForm.value.position = info.position || '教師';
    
    m15Form.value.name = info.name || '';
    m15Form.value.position = info.position || '教師';
  }
});

watch(
  () => ({
    name: m15aForm.value.name,
    dept: m15aForm.value.dept,
    phone: m15aForm.value.phone,
    position: m15aForm.value.position
  }),
  (newVal) => {
    localStorage.setItem('leaveAppPersonalInfo', JSON.stringify(newVal));
    m15Form.value.name = newVal.name;
    m15Form.value.position = newVal.position;
  },
  { deep: true }
);

const syncAdjDate = (record) => {
  if (record.origDate) {
    record.adjDate = record.origDate;
  }
};

const getTodayStr = () => {
  return formatExcelDate(new Date());
};

const formatExcelDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
};

const formatSummaryDateRange = (range) => {
  if (!range || range.length !== 2) return '';
  const d1 = new Date(range[0]);
  const d2 = new Date(range[1]);
  return `${d1.getMonth() + 1}月${d1.getDate()}日-${d2.getMonth() + 1}月${d2.getDate()}日`;
};

const calculateHours = (timeStr) => {
  if (!timeStr) return 0;
  const str = timeStr.replace(/\s+/g, '');
  if (!str.includes('-')) return 0;
  
  const [start, end] = str.split('-');
  const parseTime = (t) => {
    if (!t) return null;
    const parts = t.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) + parseInt(parts[1]) / 60;
    }
    return null;
  };
  const startH = parseTime(start);
  const endH = parseTime(end);
  if (startH !== null && endH !== null && endH >= startH) {
    return parseFloat((endH - startH).toFixed(2));
  }
  return 0;
};

const formatExcelTimeRange = (s1, s2, s3) => {
  let lines = [];
  let totalHours = 0;
  const sessions = [s1, s2, s3];
  sessions.forEach(session => {
    if (session && session.trim()) {
      const cleanSession = session.trim().replace(/\s+/g, '');
      const hrs = calculateHours(cleanSession);
      if (hrs > 0) {
        totalHours += hrs;
        lines.push(`${cleanSession}(${hrs}H)`);
      } else {
        lines.push(cleanSession);
      }
    }
  });
  if (totalHours > 0) {
    lines.push(`${parseFloat(totalHours.toFixed(2))}H`);
  }
  return lines.join('\n');
};

const exportM15 = async () => {
  if (!m15Form.value.name || !m15Form.value.position || !m15Form.value.reason || !m15Form.value.dateRange || m15Form.value.dateRange.length === 0) {
    ElMessage.warning('請完整填寫 M15 的所有必填欄位！');
    return;
  }
  try {
    const response = await fetch('/M15_Template.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await response.arrayBuffer());
    const ws = workbook.getWorksheet(1);
    ws.getCell('E4').value = m15Form.value.name;
    ws.getCell('H5').value = m15Form.value.position;
    ws.getCell('C9').value = m15Form.value.reason;
    if (m15Form.value.dateRange?.length === 2) {
      ws.getCell('F7').value = `${formatExcelDate(m15Form.value.dateRange[0])} 至 ${formatExcelDate(m15Form.value.dateRange[1])}`;
    }
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `M15_假期申請表_${m15Form.value.name}.xlsx`);
    ElMessage.success('M15 匯出成功！');
  } catch (err) { ElMessage.error(err.message); }
};

const exportM15A = async () => {
  const f = m15aForm.value;
  if (!f.name || !f.dept || !f.phone || !f.position || !f.reason || !f.totalDateRange || f.totalDateRange.length !== 2 || !f.signatureImageBase64) {
    ElMessage.warning({
      message: '⚠️ 匯出失敗：請完整填寫「1.0 個人資料」並在「3.0 畫布上完成手寫簽名」！',
      duration: 4000
    });
    return;
  }

  try {
    const response = await fetch('/M15_Template.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await response.arrayBuffer());
    let ws = workbook.getWorksheet('M15A上班時間調動表') || workbook.getWorksheet(2);

    ws.getCell('C4').value = m15aForm.value.name;      
    ws.getCell('I4').value = m15aForm.value.dept;      
    ws.getCell('C5').value = m15aForm.value.phone;     
    ws.getCell('I5').value = m15aForm.value.position;  
    ws.getCell('E7').value = formatSummaryDateRange(m15aForm.value.totalDateRange); 
    ws.getCell('C8').value = m15aForm.value.reason;    

    const cellMap = [
      { oD: 'C11', oT: 'E11', aD: 'H11', aT: 'I11' }, 
      { oD: 'C14', oT: 'E14', aD: 'H14', aT: 'I14' }, 
      { oD: 'D17', oT: 'E17', aD: 'H17', aT: 'I17' }  
    ];

    m15aForm.value.records.forEach((r, i) => {
      const map = cellMap[i];
      if (r.origDate) {
        ws.getCell(map.oD).value = formatExcelDate(r.origDate);
        const t = ws.getCell(map.oT);
        t.value = formatExcelTimeRange(r.origS1, r.origS2, r.origS3);
        t.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
      }
      if (r.adjDate) {
        ws.getCell(map.aD).value = formatExcelDate(r.adjDate);
        const t = ws.getCell(map.aT);
        t.value = formatExcelTimeRange(r.adjS1, r.adjS2, r.adjS3);
        t.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
      }
    });

    // ================= 把圖片貼進 B22 裡 =================
    const imageId = workbook.addImage({
      base64: f.signatureImageBase64,
      extension: 'png',
    });
    
    ws.addImage(imageId, {
      tl: { col: 1, row: 21 }, 
      ext: { width: 150, height: 60 } 
    });

    ws.getCell('B23').value = formatExcelDate(new Date()); 
    ws.getCell('B23').alignment = { vertical: 'middle', horizontal: 'left' };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `M15A_上班時間調動表_${m15aForm.value.name}.xlsx`);
    ElMessage.success('M15A 匯出成功！手寫簽名已插入。');
  } catch (err) { ElMessage.error(err.message); }
};
</script>

<style scoped>
/* 🟢 確保畫布不會被外層擋住，並且讓滑鼠變成十字 */
.signature-canvas {
  touch-action: none;
  cursor: crosshair;
  display: block;
}

.signature-canvas canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>

```