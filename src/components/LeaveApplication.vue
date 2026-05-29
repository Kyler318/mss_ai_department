<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ElMessage } from 'element-plus';
import Vue3Signature from "vue3-signature"; 

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
  // 🟢 1. 匯出前「強制」再抓取一次畫布內容 (避免使用者畫完沒放開滑鼠就按匯出)
  if (signaturePad.value) {
    m15aForm.value.signatureImageBase64 = signaturePad.value.save("image/png");
  }

  const f = m15aForm.value;
  
  if (!f.name || !f.dept || !f.phone || !f.position || !f.reason || !f.totalDateRange || f.totalDateRange.length !== 2) {
    ElMessage.warning({
      message: '⚠️ 匯出失敗：請完整填寫「1.0 個人資料」！',
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

    // ================= 🟢 3.0 把圖片貼進 B22 裡 (修復 ExcelJS 的格式問題) =================
    if (f.signatureImageBase64) {
      // ⚠️ 關鍵修復：把 'data:image/png;base64,' 這段垃圾文字切掉，只留真正的圖片編碼
      const rawBase64 = f.signatureImageBase64.includes(',') 
        ? f.signatureImageBase64.split(',')[1] 
        : f.signatureImageBase64;

      const imageId = workbook.addImage({
        base64: rawBase64,
        extension: 'png',
      });
      
      ws.addImage(imageId, {
        tl: { col: 1, row: 21 }, 
        ext: { width: 150, height: 60 } 
      });
    }

    ws.getCell('B23').value = formatExcelDate(new Date()); 
    ws.getCell('B23').alignment = { vertical: 'middle', horizontal: 'left' };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `M15A_上班時間調動表_${m15aForm.value.name}.xlsx`);
    ElMessage.success('M15A 匯出成功！手寫簽名已插入。');
  } catch (err) { 
    console.error("匯出錯誤詳細資訊:", err);
    ElMessage.error('匯出失敗：' + err.message); 
  }
};
</script>