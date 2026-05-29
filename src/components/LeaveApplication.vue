<template>
  <div class="leave-app-page">
    <el-tabs v-model="activeTab" type="border-card">
      
      <el-tab-pane label="📄 M15 假期申請" name="m15">
        <el-form :model="m15Form" label-width="130px" style="max-width: 800px; margin: 20px auto;">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" required><el-input v-model="m15Form.name" placeholder="請輸入姓名" /></el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="職位" required><el-input v-model="m15Form.position" placeholder="例如：教師" /></el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="整個休假時段 (G7)" required>
            <el-input v-model="m15Form.totalTimeRange" placeholder="例如：6月10日 09:00-17:30" />
          </el-form-item>
          
          <el-form-item label="休假類別" required>
            <div style="width: 100%;">
              <el-radio-group v-model="m15Form.leaveType" class="leave-type-group">
                <el-radio label="有薪年假 Paid Annual leave">有薪年假 Paid Annual leave</el-radio>
                <el-radio label="有薪病假 Paid Sick leave">有薪病假 Paid Sick leave</el-radio>
                <el-radio label="無薪病假 No pay Sick leave">無薪病假 No pay Sick leave</el-radio>
                <el-radio label="有薪恩恤假 Paid compassionate leave">有薪恩恤假 Paid compassionate leave</el-radio>
                <el-radio label="有薪婚假 Paid marriage leave">有薪婚假 Paid marriage leave</el-radio>
                <el-radio label="補鐘/補假 Compansention leave">補鐘/補假 Compansention leave(hours/holidays)</el-radio>
                <el-radio label="銷假 Cancel leave">銷假 Cancel leave</el-radio>
                <el-radio label="無薪假期 No pay leave">無薪假期 No pay leave</el-radio>
                <el-radio label="其他 others">其他 others</el-radio>
              </el-radio-group>
              
              <el-input 
                v-if="m15Form.leaveType === '其他 others'" 
                v-model="m15Form.otherLeaveType" 
                placeholder="請註明其他假期類型..." 
                style="margin-top: 10px;" 
              />
            </div>
          </el-form-item>

          <el-form-item label="實際休假時段明細" required>
            <div style="background: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #ebeef5; width: 100%;">
              
              <div v-for="(record, index) in m15Form.records" :key="index" style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <span style="width: 65px; font-weight: bold; color: #606266;">第 {{ index + 1 }} 筆：</span>
                <el-input v-model="record.start" placeholder="開始時間 (如 09:00)" style="width: 150px;" />
                <span>至</span>
                <el-input v-model="record.end" placeholder="結束時間 (如 12:00)" style="width: 150px;" />
                
                <span v-if="calculateDiffHours(record.start, record.end) > 0" style="color: #67C23A; font-weight: bold; margin-left: 10px; width: 80px;">
                  ⏱️ {{ calculateDiffHours(record.start, record.end) }} 小時
                </span>
                
                <el-button v-if="m15Form.records.length > 1" type="danger" plain size="small" @click="removeM15Record(index)">
                  ❌ 刪除
                </el-button>
              </div>
              
              <el-button type="success" plain size="small" @click="addM15Record" style="margin-top: 5px;">
                ➕ 新增下一筆時段
              </el-button>
              
              <div style="font-size: 12px; color: #909399; margin-top: 10px;">格式請輸入如 09:00 至 13:30，匯出時會自動依序填寫至 Excel 的第 10, 11, 12... 行。</div>
            </div>
          </el-form-item>
          
          <el-button type="primary" size="large" @click="exportM15" style="width: 100%; font-weight: bold;">📥 匯出 M15 申請表 (Excel)</el-button>
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
                <el-form-item label="日期">
                  <el-date-picker 
                    v-model="record.origDate" 
                    type="date" 
                    style="width: 100%;" 
                    placeholder="選擇日期" 
                    @change="syncAdjDate(record)"
                  />
                </el-form-item>
                <el-form-item label="時段一">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.origS1" placeholder="例如：09:00-13:30" />
                    <span v-if="calculateHours(record.origS1) > 0" style="margin-left: 10px; color: #E6A23C; font-weight: bold; width: 50px;">{{ calculateHours(record.origS1) }}H</span>
                  </div>
                </el-form-item>
                <el-form-item label="時段二">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.origS2" placeholder="選填" />
                    <span v-if="calculateHours(record.origS2) > 0" style="margin-left: 10px; color: #E6A23C; font-weight: bold; width: 50px;">{{ calculateHours(record.origS2) }}H</span>
                  </div>
                </el-form-item>
                <el-form-item label="時段三">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.origS3" placeholder="選填" />
                    <span v-if="calculateHours(record.origS3) > 0" style="margin-left: 10px; color: #E6A23C; font-weight: bold; width: 50px;">{{ calculateHours(record.origS3) }}H</span>
                  </div>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <div style="font-weight: bold; margin-bottom: 10px;">🔄 調動後上班時間</div>
                <el-form-item label="日期"><el-date-picker v-model="record.adjDate" type="date" style="width: 100%;" placeholder="選擇日期" /></el-form-item>
                <el-form-item label="時段一">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.adjS1" placeholder="例如：09:00-13:30" />
                    <span v-if="calculateHours(record.adjS1) > 0" style="margin-left: 10px; color: #67C23A; font-weight: bold; width: 50px;">{{ calculateHours(record.adjS1) }}H</span>
                  </div>
                </el-form-item>
                <el-form-item label="時段二">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.adjS2" placeholder="選填" />
                    <span v-if="calculateHours(record.adjS2) > 0" style="margin-left: 10px; color: #67C23A; font-weight: bold; width: 50px;">{{ calculateHours(record.adjS2) }}H</span>
                  </div>
                </el-form-item>
                <el-form-item label="時段三">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.adjS3" placeholder="選填" />
                    <span v-if="calculateHours(record.adjS3) > 0" style="margin-left: 10px; color: #67C23A; font-weight: bold; width: 50px;">{{ calculateHours(record.adjS3) }}H</span>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #dcdfe6; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #606266; border-left: 4px solid #67C23A; padding-left: 10px;">3.0 員工手寫簽署驗證</h4>
            
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #606266;"><span style="color: #F56C6C; margin-right: 4px;">*</span>請在下方框內簽名 (同時自動填寫 B22 / L22)</span>
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
                <el-form-item label="簽署日期 (B23/L23)">
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

const activeTab = ref('m15');

// ================= 表單資料 =================
const m15Form = ref({ 
  name: '', 
  position: '', 
  totalTimeRange: '', // 整個休假的時段 (G7)
  leaveType: '有薪年假 Paid Annual leave', 
  otherLeaveType: '',
  records: [ 
    // 預設先給 1 筆明細欄位
    { start: '', end: '' }
  ]
});

// 🟢 M15 新增/刪除時段的功能函式
const addM15Record = () => {
  m15Form.value.records.push({ start: '', end: '' });
};

const removeM15Record = (index) => {
  m15Form.value.records.splice(index, 1);
};

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
    penColor: "rgb(0, 0, 0)", 
    backgroundColor: "rgba(0,0,0,0)", 
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
  if (record.origDate) record.adjDate = record.origDate;
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

// 計算兩個時間點的差值 (如 "09:00" 到 "13:30" => 4.5)
const calculateDiffHours = (start, end) => {
  if (!start || !end) return 0;
  const parseTime = (t) => {
    const parts = t.replace(/\s+/g, '').split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
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

// ================= 🟢 M15 匯出邏輯 =================
const exportM15 = async () => {
  if (!m15Form.value.name || !m15Form.value.position || !m15Form.value.totalTimeRange) {
    ElMessage.warning('請完整填寫姓名、職位與整個休假時段！');
    return;
  }
  
  if (m15Form.value.leaveType === '其他 others' && !m15Form.value.otherLeaveType.trim()) {
    ElMessage.warning('請註明其他假期類型！');
    return;
  }

  try {
    const response = await fetch('/M15_Template.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await response.arrayBuffer());
    const ws = workbook.getWorksheet(1); 
    
    const finalLeaveType = m15Form.value.leaveType === '其他 others' 
      ? `其他: ${m15Form.value.otherLeaveType}` 
      : m15Form.value.leaveType;
      
    // === 寫入左半部 (正本) ===
    ws.getCell('E4').value = m15Form.value.name;       
    ws.getCell('H5').value = m15Form.value.position;   
    ws.getCell('G7').value = m15Form.value.totalTimeRange; 
    ws.getCell('C9').value = `[假期類別]\n${finalLeaveType}`; 

    // === 寫入右半部 (副本) ===
    ws.getCell('O4').value = m15Form.value.name;       
    ws.getCell('R5').value = m15Form.value.position;   
    ws.getCell('Q7').value = m15Form.value.totalTimeRange; 
    ws.getCell('M9').value = `[假期類別]\n${finalLeaveType}`; 

    // === 🟢 寫入「無限擴充」的明細時段 ===
    m15Form.value.records.forEach((r, idx) => {
      const rowNum = 10 + idx; // 自動變成 10, 11, 12, 13...
      if (r.start && r.end) {
        const hrs = calculateDiffHours(r.start, r.end);
        
        // 正本 (G, H, I 欄)
        ws.getCell(`G${rowNum}`).value = r.start;
        ws.getCell(`H${rowNum}`).value = r.end;
        ws.getCell(`I${rowNum}`).value = hrs > 0 ? `${hrs}H` : '';

        // 副本 (Q, R, S 欄)
        ws.getCell(`Q${rowNum}`).value = r.start;
        ws.getCell(`R${rowNum}`).value = r.end;
        ws.getCell(`S${rowNum}`).value = hrs > 0 ? `${hrs}H` : '';
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `M15_假期申請表_${m15Form.value.name}.xlsx`);
    ElMessage.success('M15 假期申請表匯出成功！');
  } catch (err) { ElMessage.error(err.message); }
};

// ================= M15A 匯出 =================
const exportM15A = async () => {
  if (signaturePad.value) {
    m15aForm.value.signatureImageBase64 = signaturePad.value.save("image/png");
  }

  const f = m15aForm.value;
  
  if (!f.name || !f.dept || !f.phone || !f.position || !f.reason || !f.totalDateRange || f.totalDateRange.length !== 2 || !f.signatureImageBase64) {
    ElMessage.warning({
      message: '⚠️ 匯出失敗：請完整填寫個人資料並完成手寫簽名！',
      duration: 4000
    });
    return;
  }

  try {
    const response = await fetch('/M15_Template.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await response.arrayBuffer());
    let ws = workbook.getWorksheet('M15A上班時間調動表') || workbook.getWorksheet(2);

    ws.getCell('C4').value = f.name;      
    ws.getCell('I4').value = f.dept;      
    ws.getCell('C5').value = f.phone;     
    ws.getCell('I5').value = f.position;  
    ws.getCell('E7').value = formatSummaryDateRange(f.totalDateRange); 
    ws.getCell('C8').value = f.reason;    

    ws.getCell('M4').value = f.name;      
    ws.getCell('S4').value = f.dept;      
    ws.getCell('M5').value = f.phone;     
    ws.getCell('S5').value = f.position;  
    ws.getCell('O7').value = formatSummaryDateRange(f.totalDateRange); 
    ws.getCell('M8').value = f.reason;    

    const cellMap = [
      { oD: 'C11', oT: 'E11', aD: 'H11', aT: 'I11', rOD: 'M11', rOT: 'O11', rAD: 'R11', rAT: 'S11' }, 
      { oD: 'C14', oT: 'E14', aD: 'H14', aT: 'I14', rOD: 'M14', rOT: 'O14', rAD: 'R14', rAT: 'S14' }, 
      { oD: 'C17', oT: 'E17', aD: 'H17', aT: 'I17', rOD: 'M17', rOT: 'O17', rAD: 'R17', rAT: 'S17' }  
    ];

    f.records.forEach((r, i) => {
      const map = cellMap[i];
      if (r.origDate) {
        const formattedOrigDate = formatExcelDate(r.origDate);
        ws.getCell(map.oD).value = formattedOrigDate;
        ws.getCell(map.rOD).value = formattedOrigDate; 
        
        const timeRangeStr = formatExcelTimeRange(r.origS1, r.origS2, r.origS3);
        ws.getCell(map.oT).value = timeRangeStr;
        ws.getCell(map.oT).alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
        ws.getCell(map.rOT).value = timeRangeStr;      
        ws.getCell(map.rOT).alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
      }
      if (r.adjDate) {
        const formattedAdjDate = formatExcelDate(r.adjDate);
        ws.getCell(map.aD).value = formattedAdjDate;
        ws.getCell(map.rAD).value = formattedAdjDate; 
        
        const timeRangeStr = formatExcelTimeRange(r.adjS1, r.adjS2, r.adjS3);
        ws.getCell(map.aT).value = timeRangeStr;
        ws.getCell(map.aT).alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
        ws.getCell(map.rAT).value = timeRangeStr;     
        ws.getCell(map.rAT).alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
      }
    });

    if (f.signatureImageBase64) {
      const rawBase64 = f.signatureImageBase64.includes(',') 
        ? f.signatureImageBase64.split(',')[1] 
        : f.signatureImageBase64;

      const imageId = workbook.addImage({
        base64: rawBase64,
        extension: 'png',
      });
      
      ws.addImage(imageId, { tl: { col: 1, row: 21 }, ext: { width: 150, height: 60 } });
      ws.addImage(imageId, { tl: { col: 11, row: 21 }, ext: { width: 150, height: 60 } });
    }

    const todayDateStr = formatExcelDate(new Date());
    ws.getCell('B23').value = todayDateStr; 
    ws.getCell('B23').alignment = { vertical: 'middle', horizontal: 'left' };
    ws.getCell('L23').value = todayDateStr; 
    ws.getCell('L23').alignment = { vertical: 'middle', horizontal: 'left' };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `M15A_上班時間調動表_${f.name}.xlsx`);
    ElMessage.success('M15A 匯出成功！');
  } catch (err) { 
    console.error("匯出錯誤詳細資訊:", err);
    ElMessage.error('匯出失敗：' + err.message); 
  }
};
</script>

<style scoped>
.signature-canvas {
  touch-action: none;
  cursor: crosshair;
  display: block;
}
.signature-canvas canvas {
  width: 100% !important;
  height: 100% !important;
}

.leave-type-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-top: 5px;
}
</style>