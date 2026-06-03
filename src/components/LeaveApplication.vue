<template>
  <div class="leave-app-page">
    <el-tabs v-model="activeTab" type="border-card">
      
      <el-tab-pane label="📄 M15 假期申請" name="m15" lazy>
        <el-form label-width="130px" style="max-width: 950px; margin: 20px auto;">
          
          <div style="background: #fff; padding: 20px; border: 1px solid #dcdfe6; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #606266; border-left: 4px solid #409EFF; padding-left: 10px;">1.0 個人資料與總時段 (必填)</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="姓名" required><el-input v-model="personalInfo.name" placeholder="請輸入姓名" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="部門" required>
                  <el-select v-model="personalInfo.dept" placeholder="請選擇部門" style="width: 100%;">
                    <el-option label="資訊科技/AI輔助部" value="資訊科技/AI輔助部" />
                    <el-option label="行政事務部" value="行政事務部" />
                    <el-option label="教學事務部" value="教學事務部" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="電話" required><el-input v-model="personalInfo.phone" placeholder="填寫聯絡電話" /></el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="職位" required><el-input v-model="personalInfo.position" placeholder="例如：教師" /></el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="整個休假時段 (G7)" required>
                  <el-date-picker
                    v-model="m15Form.totalDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="開始日期"
                    end-placeholder="結束日期"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #dcdfe6; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #606266; border-left: 4px solid #E6A23C; padding-left: 10px;">2.0 假期申請明細</h4>
            
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

            <el-form-item label="實際休假明細" required>
              <div style="background: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #ebeef5; width: 100%;">
                <div v-for="(record, index) in m15Form.records" :key="index" style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                  <span style="width: 65px; font-weight: bold; color: #606266;">第 {{ index + 1 }} 筆：</span>
                  
                  <template v-if="m15Form.leaveType === '補鐘/補假 Compansention leave'">
                    <el-input v-model="record.manualStart" placeholder="開始 (如 3/24 14:00)" style="width: 180px;" />
                    <span>至</span>
                    <el-input v-model="record.manualEnd" placeholder="結束 (如 16:30)" style="width: 150px;" />
                    <el-input v-model="record.manualHours" placeholder="時數 (如 2.5)" style="width: 120px; margin-left: 10px;" />
                  </template>
                  
                  <template v-else>
                    <el-date-picker
                      v-model="record.dateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="開始日期"
                      end-placeholder="結束日期"
                      style="width: 280px;"
                      :disabled-date="disabledM15Date"
                    />
                    <span v-if="calculateLeaveHours(record.dateRange) > 0" style="color: #67C23A; font-weight: bold; margin-left: 10px; min-width: 100px;">
                      ⏱️ {{ calculateLeaveHours(record.dateRange) }} 小時
                    </span>
                  </template>
                  
                  <el-button v-if="m15Form.records.length > 1" type="danger" plain size="small" @click="removeM15Record(index)">
                    ❌ 刪除
                  </el-button>
                </div>
                
                <el-button type="success" plain size="small" @click="addM15Record" style="margin-top: 5px;">
                  ➕ 新增下一筆時段
                </el-button>
                
                <div style="font-size: 12px; color: #909399; margin-top: 10px; line-height: 1.6;">
                  💡 <b>一般假期：</b>系統會自動扣除週六與週日，並按每日 7.2 小時計算。<br>
                  💡 <b>補鐘/補假：</b>請手動輸入具體的「幾點到幾點」與純數字的「總時數 (例如 2.5)」。<br>
                  ⚠️ <b>注意：</b>實際休假明細的日期不可超出上方「整個休假時段」的範圍。
                </div>

                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #dcdfe6; display: flex; justify-content: flex-end; align-items: center; gap: 25px;">
                  <span style="font-size: 15px; color: #606266;">
                    📅 總計休假天數 (E8)：<strong style="color: #409EFF; font-size: 18px;">{{ m15TotalDays }}</strong> 天
                  </span>
                  <span style="font-size: 15px; color: #606266;">
                    ⏱️ 總計時數 (G8)：<strong style="color: #67C23A; font-size: 18px;">{{ m15TotalHoursText }}</strong>
                  </span>
                </div>

              </div>
            </el-form-item>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #dcdfe6; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #606266; border-left: 4px solid #67C23A; padding-left: 10px;">3.0 員工手寫簽署驗證</h4>
            
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #606266;"><span style="color: #F56C6C; margin-right: 4px;">*</span>請在下方框內簽名 (簽名顯示於 B24，日期填入 B27)</span>
              <el-button type="danger" plain size="small" @click="clearSignatureM15">清除重簽</el-button>
            </div>
            
            <div style="border: 2px dashed #dcdfe6; border-radius: 8px; background-color: #fafafa; margin-bottom: 20px; height: 200px; overflow: hidden; position: relative;">
              <Vue3Signature 
                v-if="activeTab === 'm15'"
                ref="signaturePadM15" 
                :sigOption="state.option" 
                :w="'100%'" 
                :h="'200px'" 
                @end="saveSignatureM15"
                class="signature-canvas"
                style="width: 100%; height: 100%;"
              />
            </div>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="簽署日期 (B27/L27)">
                  <el-input :value="getTodayStr()" disabled style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          
          <el-button type="primary" size="large" @click="exportM15" style="width: 100%; font-weight: bold;">📥 匯出 M15 申請表 (Excel)</el-button>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="🔄 M15A 時間調動" name="m15a" lazy>
        <el-form label-width="110px" style="max-width: 950px; margin: 20px auto;">
          
          <div style="background: #fff; padding: 20px; border: 1px solid #dcdfe6; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #606266; border-left: 4px solid #409EFF; padding-left: 10px;">1.0 個人與調動資料 (必填)</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="姓名 (C4)" required><el-input v-model="personalInfo.name" placeholder="請輸入姓名" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="部門 (I4)" required>
                  <el-select v-model="personalInfo.dept" placeholder="請選擇部門" style="width: 100%;">
                    <el-option label="資訊科技/AI輔助部" value="資訊科技/AI輔助部" />
                    <el-option label="行政事務部" value="行政事務部" />
                    <el-option label="教學事務部" value="教學事務部" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="電話 (C5)" required><el-input v-model="personalInfo.phone" placeholder="填寫聯絡電話" /></el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="職位 (I5)" required><el-input v-model="personalInfo.position" placeholder="例如：教師" /></el-form-item>
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
                    :disabled-date="disabledM15aDate"
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
                
                <el-form-item label="日期">
                  <el-date-picker 
                    v-model="record.adjDate" 
                    type="date" 
                    style="width: 100%;" 
                    placeholder="選擇日期" 
                    :disabled-date="disabledM15aDate"
                  />
                </el-form-item>
                
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
              <span style="font-weight: bold; color: #606266;"><span style="color: #F56C6C; margin-right: 4px;">*</span>請在下方框內簽名 (簽名顯示於 B24，日期填入 B24 / L24)</span>
              <el-button type="danger" plain size="small" @click="clearSignature">清除重簽</el-button>
            </div>
            
            <div style="border: 2px dashed #dcdfe6; border-radius: 8px; background-color: #fafafa; margin-bottom: 20px; height: 200px; overflow: hidden; position: relative;">
              <Vue3Signature 
                v-if="activeTab === 'm15a'"
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
                <el-form-item label="簽署日期 (B24/L24)">
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
import { ref, reactive, onMounted, watch, computed } from 'vue';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ElMessage } from 'element-plus';
import Vue3Signature from "vue3-signature"; 

const activeTab = ref('m15');

// ================= 共用個人資料 =================
const personalInfo = ref({
  name: '',
  dept: '資訊科技/AI輔助部',
  phone: '',
  position: '教師'
});

// ================= 表單資料 =================
const m15Form = ref({ 
  totalDateRange: [], 
  leaveType: '有薪年假 Paid Annual leave', 
  otherLeaveType: '',
  signatureImageBase64: '', 
  records: [ 
    { dateRange: [], manualStart: '', manualEnd: '', manualHours: '' } 
  ]
});

const addM15Record = () => {
  m15Form.value.records.push({ dateRange: [], manualStart: '', manualEnd: '', manualHours: '' });
};

const removeM15Record = (index) => {
  m15Form.value.records.splice(index, 1);
};

const m15aForm = ref({
  totalDateRange: [], 
  reason: '',
  signatureImageBase64: '', 
  records: [
    { origDate: '', origS1: '', origS2: '', origS3: '', adjDate: '', adjS1: '', adjS2: '', adjS3: '' }, 
    { origDate: '', origS1: '', origS2: '', origS3: '', adjDate: '', adjS1: '', adjS2: '', adjS3: '' }, 
    { origDate: '', origS1: '', origS2: '', origS3: '', adjDate: '', adjS1: '', adjS2: '', adjS3: '' }  
  ]
});

// ================= 日期選擇限制邏輯 =================
const disabledM15Date = (time) => {
  if (!m15Form.value.totalDateRange || m15Form.value.totalDateRange.length !== 2) return false; 
  const start = new Date(m15Form.value.totalDateRange[0]).setHours(0, 0, 0, 0);
  const end = new Date(m15Form.value.totalDateRange[1]).setHours(23, 59, 59, 999);
  return time.getTime() < start || time.getTime() > end;
};

const disabledM15aDate = (time) => {
  if (!m15aForm.value.totalDateRange || m15aForm.value.totalDateRange.length !== 2) return false; 
  const start = new Date(m15aForm.value.totalDateRange[0]).setHours(0, 0, 0, 0);
  const end = new Date(m15aForm.value.totalDateRange[1]).setHours(23, 59, 59, 999);
  return time.getTime() < start || time.getTime() > end;
};

// ================= 畫布簽名邏輯 =================
const signaturePad = ref(null);      // M15A 
const signaturePadM15 = ref(null);   // M15 

// 透明背景
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

const saveSignatureM15 = () => {
  if (signaturePadM15.value) {
    m15Form.value.signatureImageBase64 = signaturePadM15.value.save("image/png");
  }
};
const clearSignatureM15 = () => {
  if (signaturePadM15.value) {
    signaturePadM15.value.clear();
    m15Form.value.signatureImageBase64 = '';
  }
};

// ================= 讀取與儲存本地紀錄 =================
onMounted(() => {
  const savedInfo = localStorage.getItem('leaveAppPersonalInfo');
  if (savedInfo) {
    const info = JSON.parse(savedInfo);
    personalInfo.value.name = info.name || '';
    personalInfo.value.dept = info.dept || '資訊科技/AI輔助部';
    personalInfo.value.phone = info.phone || '';
    personalInfo.value.position = info.position || '教師';
  }
});

watch(personalInfo, (newVal) => {
  localStorage.setItem('leaveAppPersonalInfo', JSON.stringify(newVal));
}, { deep: true });

// ================= 智能時數與天數計算 =================
const calculateLeaveHours = (range) => {
  if (!range || range.length !== 2) return 0;
  let start = new Date(range[0]);
  let end = new Date(range[1]);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) return 0;
  let count = 0;
  let current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return parseFloat((count * 7.2).toFixed(2));
};

const m15TotalHours = computed(() => {
  let total = 0;
  m15Form.value.records.forEach((r) => {
    if (m15Form.value.leaveType === '補鐘/補假 Compansention leave') {
      total += parseFloat(r.manualHours) || 0;
    } else {
      if (r.dateRange && r.dateRange.length === 2) {
        total += calculateLeaveHours(r.dateRange);
      }
    }
  });
  return total;
});

const m15TotalDays = computed(() => {
  return parseFloat((m15TotalHours.value / 7.2).toFixed(2));
});

const m15TotalHoursText = computed(() => {
  const hrs = m15TotalHours.value;
  if (hrs === 0) return '0 小時 0 分鐘';
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  return `${h} 小時 ${m} 分鐘`;
});

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
    if (parts.length === 2) return parseInt(parts[0]) + parseInt(parts[1]) / 60;
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

// ================= 🟢 [終極防禦] 安全寫入助手 =================
const safeSetCell = (ws, cellRef, value) => {
  try {
    if (!cellRef) return; // 增強保護：防止傳入空字串導致報錯
    let cell = ws.getCell(cellRef);
    if (cell.isMerged && cell.master) {
      cell = cell.master;
    }
    cell.value = value;
  } catch (e) {
    console.warn(`Set cell error at ${cellRef}:`, e);
  }
};

// ================= 🟢 M15 匯出邏輯 (假期申請表) =================
const exportM15 = async () => {
  if (signaturePadM15.value) {
    m15Form.value.signatureImageBase64 = signaturePadM15.value.save("image/png");
  }

  const p = personalInfo.value;
  if (!p.name || !p.position || !p.dept || !p.phone || !m15Form.value.totalDateRange || m15Form.value.totalDateRange.length !== 2) {
    ElMessage.warning('請完整填寫 1.0 的個人資料與總休假時段！');
    return;
  }

  if (!m15Form.value.signatureImageBase64) {
    ElMessage.warning('⚠️ 匯出失敗：請完成手寫簽名！');
    return;
  }

  try {
    const response = await fetch('/M15A_假期申請表.xlsx');
    if (!response.ok) throw new Error('讀取失敗：找不到 M15A_假期申請表.xlsx，請確認檔名！');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await response.arrayBuffer());
    
    const ws = workbook.getWorksheet('M15假期申請表') || workbook.worksheets[0]; 
    if (!ws) throw new Error('無法讀取工作表 M15假期申請表！');
    
    const finalLeaveType = m15Form.value.leaveType === '其他 others' 
      ? `其他: ${m15Form.value.otherLeaveType}` 
      : m15Form.value.leaveType;
      
    const formattedTotal = `${formatExcelDate(m15Form.value.totalDateRange[0])} 至 ${formatExcelDate(m15Form.value.totalDateRange[1])}`;

    // 安全寫入
    safeSetCell(ws, 'E4', p.name);       
    safeSetCell(ws, 'H4', p.dept);       
    safeSetCell(ws, 'E5', p.phone);      
    safeSetCell(ws, 'H5', p.position);   
    safeSetCell(ws, 'G7', formattedTotal); 
    safeSetCell(ws, 'C9', `[假期類別]\n${finalLeaveType}`); 

    safeSetCell(ws, 'O4', p.name);       
    safeSetCell(ws, 'R4', p.dept);       
    safeSetCell(ws, 'O5', p.phone);      
    safeSetCell(ws, 'R5', p.position);   
    safeSetCell(ws, 'Q7', formattedTotal); 
    safeSetCell(ws, 'M9', `[假期類別]\n${finalLeaveType}`); 

    if (m15TotalHours.value > 0) {
      const h = Math.floor(m15TotalHours.value);
      const m = Math.round((m15TotalHours.value - h) * 60);
      const excelTimeStr = `共 ${h} 小時hrs ${m} 分鐘mins`;

      safeSetCell(ws, 'E8', m15TotalDays.value); 
      safeSetCell(ws, 'G8', excelTimeStr);       
      safeSetCell(ws, 'O8', m15TotalDays.value); 
      safeSetCell(ws, 'Q8', excelTimeStr);       
    }

    m15Form.value.records.forEach((r, idx) => {
      const rowNum = 10 + idx; 
      if (m15Form.value.leaveType === '補鐘/補假 Compansention leave') {
        if (r.manualStart || r.manualEnd) {
          const manualHrs = parseFloat(r.manualHours) || 0;
          safeSetCell(ws, `G${rowNum}`, r.manualStart);
          safeSetCell(ws, `H${rowNum}`, r.manualEnd);
          safeSetCell(ws, `I${rowNum}`, manualHrs > 0 ? `${manualHrs}H` : '');
          safeSetCell(ws, `Q${rowNum}`, r.manualStart);
          safeSetCell(ws, `R${rowNum}`, r.manualEnd);
          safeSetCell(ws, `S${rowNum}`, manualHrs > 0 ? `${manualHrs}H` : '');
        }
      } else {
        if (r.dateRange && r.dateRange.length === 2) {
          const hrs = calculateLeaveHours(r.dateRange);
          safeSetCell(ws, `G${rowNum}`, formatExcelDate(r.dateRange[0]));
          safeSetCell(ws, `H${rowNum}`, formatExcelDate(r.dateRange[1]));
          safeSetCell(ws, `I${rowNum}`, hrs > 0 ? `${hrs}H` : '');
          safeSetCell(ws, `Q${rowNum}`, formatExcelDate(r.dateRange[0]));
          safeSetCell(ws, `R${rowNum}`, formatExcelDate(r.dateRange[1]));
          safeSetCell(ws, `S${rowNum}`, hrs > 0 ? `${hrs}H` : '');
        }
      }
    });

    if (m15Form.value.signatureImageBase64) {
      const rawBase64 = m15Form.value.signatureImageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
      const imageId1 = workbook.addImage({ base64: rawBase64, extension: 'png' });
      const imageId2 = workbook.addImage({ base64: rawBase64, extension: 'png' });
      ws.addImage(imageId1, { tl: { col: 1, row: 23 }, ext: { width: 140, height: 45 } }); // Excel B24
      ws.addImage(imageId2, { tl: { col: 11, row: 23 }, ext: { width: 140, height: 45 } }); // Excel L24
    }

    const todayDateStr = formatExcelDate(new Date());
    safeSetCell(ws, 'B27', todayDateStr); 
    safeSetCell(ws, 'L27', todayDateStr); 

    const buffer = await workbook.xlsx.writeBuffer();
    const blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    saveAs(new Blob([buffer], { type: blobType }), `M15_假期申請表_${p.name}.xlsx`);
    ElMessage.success('M15 假期申請表匯出成功！');
  } catch (err) { 
    console.error(err);
    ElMessage.error(err.message); 
  }
};

// ================= 🟢 M15A 匯出邏輯 (上班時間調動表) =================
const exportM15A = async () => {
  if (signaturePad.value) {
    m15aForm.value.signatureImageBase64 = signaturePad.value.save("image/png");
  }

  const f = m15aForm.value;
  const p = personalInfo.value;
  
  if (!p.name || !p.dept || !p.phone || !p.position || !f.reason || !f.totalDateRange || f.totalDateRange.length !== 2) {
    ElMessage.warning('⚠️ 匯出失敗：請完整填寫個人資料！');
    return;
  }

  if (!f.signatureImageBase64) {
    ElMessage.warning('⚠️ 匯出失敗：請完成手寫簽名！');
    return;
  }

  try {
    const response = await fetch('/M15A上班時間調動表.xlsx');
    if (!response.ok) throw new Error('讀取失敗：找不到 M15A上班時間調動表.xlsx，請確認檔名！');
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await response.arrayBuffer());
    
    let ws = workbook.getWorksheet('M15A上班時間調動表') || workbook.worksheets[0];
    if (!ws) throw new Error('無法讀取工作表 M15A上班時間調動表！');

    // 🟢 左半邊 (原件) 寫入
    safeSetCell(ws, 'C4', p.name);      
    safeSetCell(ws, 'I4', p.dept);      
    safeSetCell(ws, 'E5', p.phone);     
    safeSetCell(ws, 'I5', p.position);  
    safeSetCell(ws, 'E7', formatSummaryDateRange(f.totalDateRange)); 
    safeSetCell(ws, 'C8', f.reason);    

    // 🟢 右半邊 (副本) 寫入 - 【已修正：原本的 safeSetCell(ws, '', p.name) 會引發錯誤】
    safeSetCell(ws, 'M4', p.name);      // <--- 修正此處的空字串座標為 M4
    safeSetCell(ws, 'S4', p.dept);      
    safeSetCell(ws, 'M5', p.phone);     
    safeSetCell(ws, 'S5', p.position);  
    safeSetCell(ws, 'O7', formatSummaryDateRange(f.totalDateRange)); 
    safeSetCell(ws, 'M8', f.reason);    

    const cellMap = [
      { oD: 'C11', oT: 'E11', aD: 'H11', aT: 'I11', rOD: 'M11', rOT: 'O11', rAD: 'R11', rAT: 'S11' }, 
      { oD: 'C14', oT: 'E14', aD: 'H14', aT: 'I14', rOD: 'M14', rOT: 'O14', rAD: 'R14', rAT: 'S14' }, 
      { oD: 'C17', oT: 'E17', aD: 'H17', aT: 'I17', rOD: 'M17', rOT: 'O17', rAD: 'R17', rAT: 'S17' }  
    ];

    f.records.forEach((r, i) => {
      const map = cellMap[i];
      if (r.origDate) {
        safeSetCell(ws, map.oD, formatExcelDate(r.origDate));
        safeSetCell(ws, map.rOD, formatExcelDate(r.origDate)); 
        const timeRangeStr = formatExcelTimeRange(r.origS1, r.origS2, r.origS3);
        safeSetCell(ws, map.oT, timeRangeStr);
        safeSetCell(ws, map.rOT, timeRangeStr);      
      }
      if (r.adjDate) {
        safeSetCell(ws, map.aD, formatExcelDate(r.adjDate));
        safeSetCell(ws, map.rAD, formatExcelDate(r.adjDate)); 
        const timeRangeStr = formatExcelTimeRange(r.adjS1, r.adjS2, r.adjS3);
        safeSetCell(ws, map.aT, timeRangeStr);
        safeSetCell(ws, map.rAT, timeRangeStr);     
      }
    });

    // 🟢 M15A 簽名插入：B22-C22 (left), L22-M22 (right)
    if (f.signatureImageBase64) {
      const rawBase64 = f.signatureImageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
      const imageId1 = workbook.addImage({ base64: rawBase64, extension: 'png' });
      const imageId2 = workbook.addImage({ base64: rawBase64, extension: 'png' });

      ws.addImage(imageId1, { tl: { col: 1, row: 21 }, br: { col: 3, row: 22 } });  // B22:C22
      ws.addImage(imageId2, { tl: { col: 11, row: 21 }, br: { col: 13, row: 22 } }); // L22:M22
    }

    const todayDateStr = formatExcelDate(new Date());
    safeSetCell(ws, 'B23', todayDateStr);
    safeSetCell(ws, 'L23', todayDateStr);

    const buffer = await workbook.xlsx.writeBuffer();
    const blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    saveAs(new Blob([buffer], { type: blobType }), `M15A_上班時間調動表_${p.name}.xlsx`);
    ElMessage.success('M15A 時間調動表匯出成功！');
  } catch (err) { 
    console.error(err);
    ElMessage.error(err.message); 
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
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 5px;
}
</style>