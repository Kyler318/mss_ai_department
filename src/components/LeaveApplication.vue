<template>
  <div class="leave-app-page">
    <el-tabs type="border-card">
      
      <el-tab-pane label="📄 M15 假期申請">
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

      <el-tab-pane label="🔄 M15A 時間調動">
        <el-form :model="m15aForm" label-width="110px" style="max-width: 950px; margin: 20px auto;">
          
          <div style="background: #fff; padding: 20px; border: 1px solid #dcdfe6; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #606266; border-left: 4px solid #409EFF; padding-left: 10px;">個人與調動資料</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="姓名" required><el-input v-model="m15aForm.name" placeholder="請輸入姓名" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="部門" required>
                  <el-select v-model="m15aForm.dept" placeholder="請選擇部門" style="width: 100%;">
                    <el-option label="資訊科技/AI輔助部" value="資訊科技/AI輔助部" />
                    <el-option label="行政事務部" value="行政事務部" />
                    <el-option label="教學事務部" value="教學事務部" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="電話" required><el-input v-model="m15aForm.phone" placeholder="填寫聯絡電話" /></el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="職位" required><el-input v-model="m15aForm.position" placeholder="例如：教師" /></el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="調動日期" required>
                  <el-date-picker
                    v-model="m15aForm.totalDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="開始日期"
                    end-placeholder="結束日期"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="調動原因" required>
              <el-input v-model="m15aForm.reason" placeholder="請輸入原因..." />
            </el-form-item>
          </div>

          <div v-for="(record, index) in m15aForm.records" :key="index" style="background: #fdfdfd; padding: 20px; border: 1px solid #ebeef5; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #409EFF;">📅 調動項目 {{ index + 1 }}</h4>
            <el-row :gutter="30">
              <el-col :span="12" style="border-right: 1px dashed #dcdfe6;">
                <div style="font-weight: bold; margin-bottom: 10px;">🕒 原定上班時間</div>
                <el-form-item label="日期"><el-date-picker v-model="record.origDate" type="date" style="width: 100%;" placeholder="選擇日期" /></el-form-item>
                
                <el-form-item label="時段一">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.origS1" placeholder="例如：09:00-13:30" />
                    <span v-if="calculateHours(record.origS1) > 0" style="margin-left: 10px; color: #E6A23C; font-weight: bold; width: 50px;">{{ calculateHours(record.origS1) }}H</span>
                  </div>
                </el-form-item>
                <el-form-item label="時段二">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.origS2" placeholder="選填，例如：14:30-16:30" />
                    <span v-if="calculateHours(record.origS2) > 0" style="margin-left: 10px; color: #E6A23C; font-weight: bold; width: 50px;">{{ calculateHours(record.origS2) }}H</span>
                  </div>
                </el-form-item>
                <el-form-item label="時段三">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.origS3" placeholder="選填，例如：18:00-21:00" />
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
                    <el-input v-model="record.adjS2" placeholder="選填，例如：14:30-16:30" />
                    <span v-if="calculateHours(record.adjS2) > 0" style="margin-left: 10px; color: #67C23A; font-weight: bold; width: 50px;">{{ calculateHours(record.adjS2) }}H</span>
                  </div>
                </el-form-item>
                <el-form-item label="時段三">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input v-model="record.adjS3" placeholder="選填，例如：18:00-21:00" />
                    <span v-if="calculateHours(record.adjS3) > 0" style="margin-left: 10px; color: #67C23A; font-weight: bold; width: 50px;">{{ calculateHours(record.adjS3) }}H</span>
                  </div>
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
import { ref } from 'vue';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ElMessage } from 'element-plus';

// ================= 表單資料 =================
const m15Form = ref({ name: '', position: '', dateRange: [], leaveType: '年假', reason: '' });

const m15aForm = ref({
  name: '',
  dept: '資訊科技/AI輔助部',
  phone: '',
  position: '教師',
  totalDateRange: [], 
  reason: '',
  records: [
    { origDate: '', origS1: '', origS2: '', origS3: '', adjDate: '', adjS1: '', adjS2: '', adjS3: '' }, 
    { origDate: '', origS1: '', origS2: '', origS3: '', adjDate: '', adjS1: '', adjS2: '', adjS3: '' }, 
    { origDate: '', origS1: '', origS2: '', origS3: '', adjDate: '', adjS1: '', adjS2: '', adjS3: '' }  
  ]
});

// ================= 日期與字串計算工具 =================
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

// ================= 匯出 M15 =================
const exportM15 = async () => {
  // M15 匯出防呆檢查
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

// ================= 匯出 M15A =================
const exportM15A = async () => {
  // 🚨 M15A 必填攔截防呆檢查 🚨
  const f = m15aForm.value;
  if (!f.name || !f.dept || !f.phone || !f.position || !f.reason || !f.totalDateRange || f.totalDateRange.length !== 2) {
    ElMessage.warning({
      message: '⚠️ 匯出失敗：請完整填寫「個人與調動資料」的所有必填欄位！',
      duration: 4000
    });
    return; // 終止程式執行，不匯出檔案
  }

  try {
    const response = await fetch('/M15_Template.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await response.arrayBuffer());
    let ws = workbook.getWorksheet('M15A上班時間調動表') || workbook.getWorksheet(2);

    //個人與總日期資料
    ws.getCell('C4').value = m15aForm.value.name;      
    ws.getCell('I4').value = m15aForm.value.dept;      
    ws.getCell('C5').value = m15aForm.value.phone;     
    ws.getCell('I5').value = m15aForm.value.position;  
    ws.getCell('E7').value = formatSummaryDateRange(m15aForm.value.totalDateRange); 
    ws.getCell('C8').value = m15aForm.value.reason;    

    // 2.0 三天調動明細座標
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

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `M15A_上班時間調動表_${m15aForm.value.name}.xlsx`);
    ElMessage.success('M15A 匯出成功！');
  } catch (err) { ElMessage.error(err.message); }
};
</script>