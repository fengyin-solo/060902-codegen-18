<template>
  <div class="repair-wizard">
    <div class="card wizard-card">
      <div class="wizard-header">
        <div class="wizard-icon">🔧</div>
        <div class="wizard-title">
          <h3>导入修复向导</h3>
          <p class="error-message">{{ parseError.message }}</p>
        </div>
      </div>

      <div class="file-info">
        <div class="info-item">
          <span class="info-label">📄 文件名</span>
          <span class="info-value">{{ parseError.fileName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">📁 文件类型</span>
          <span class="info-value">{{ getFileTypeLabel(parseError.fileType) }}</span>
        </div>
        <div class="info-item" v-if="parseError.fileSize">
          <span class="info-label">📊 文件大小</span>
          <span class="info-value">{{ formatFileSize(parseError.fileSize) }}</span>
        </div>
      </div>

      <div class="repair-suggestions">
        <h4>💡 修复建议</h4>
        
        <div class="suggestion-group" v-if="parseError.fileType === 'android-xml'">
          <div class="suggestion-item" v-for="(tip, idx) in androidSuggestions" :key="idx">
            <div class="suggestion-icon">{{ tip.icon }}</div>
            <div class="suggestion-content">
              <h5>{{ tip.title }}</h5>
              <p>{{ tip.description }}</p>
            </div>
          </div>
        </div>

        <div class="suggestion-group" v-else-if="parseError.fileType === 'iphone-db'">
          <div class="suggestion-item" v-for="(tip, idx) in iphoneSuggestions" :key="idx">
            <div class="suggestion-icon">{{ tip.icon }}</div>
            <div class="suggestion-content">
              <h5>{{ tip.title }}</h5>
              <p>{{ tip.description }}</p>
            </div>
          </div>
        </div>

        <div class="suggestion-group" v-else-if="parseError.fileType === 'csv'">
          <div class="suggestion-item" v-for="(tip, idx) in csvSuggestions" :key="idx">
            <div class="suggestion-icon">{{ tip.icon }}</div>
            <div class="suggestion-content">
              <h5>{{ tip.title }}</h5>
              <p>{{ tip.description }}</p>
            </div>
          </div>
          <div class="format-example">
            <h5>📋 CSV 格式示例</h5>
            <pre class="code-block">address,body,date,type
13800138000,今晚一起吃饭吗？,1672531200000,1
13800138000,好的，几点？,1672531260000,2</pre>
          </div>
        </div>

        <div class="suggestion-group" v-else-if="parseError.fileType === 'txt'">
          <div class="suggestion-item" v-for="(tip, idx) in txtSuggestions" :key="idx">
            <div class="suggestion-icon">{{ tip.icon }}</div>
            <div class="suggestion-content">
              <h5>{{ tip.title }}</h5>
              <p>{{ tip.description }}</p>
            </div>
          </div>
          <div class="format-example">
            <h5>📋 文本格式示例</h5>
            <pre class="code-block">2024-01-01 12:00 13800138000 接收: 今晚一起吃饭吗？
2024-01-01 12:01 13800138000 发送: 好的，几点？</pre>
          </div>
        </div>

        <div class="suggestion-group" v-else-if="parseError.fileType === 'json'">
          <div class="suggestion-item" v-for="(tip, idx) in jsonSuggestions" :key="idx">
            <div class="suggestion-icon">{{ tip.icon }}</div>
            <div class="suggestion-content">
              <h5>{{ tip.title }}</h5>
              <p>{{ tip.description }}</p>
            </div>
          </div>
        </div>

        <div class="suggestion-group" v-else>
          <div class="suggestion-item" v-for="(tip, idx) in genericSuggestions" :key="idx">
            <div class="suggestion-icon">{{ tip.icon }}</div>
            <div class="suggestion-content">
              <h5>{{ tip.title }}</h5>
              <p>{{ tip.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="wizard-actions">
        <button class="btn btn-secondary" @click="$emit('showFormats')">
          📖 查看完整格式说明
        </button>
        <button class="btn btn-primary" @click="$emit('reselect')">
          📁 重新选择文件
        </button>
      </div>

      <div class="wizard-footer">
        <button class="link-btn" @click="showDetails = !showDetails">
          {{ showDetails ? '隐藏' : '显示' }}技术详情
        </button>
        <div v-if="showDetails" class="error-details">
          <p><strong>错误代码:</strong> {{ parseError.errorCode }}</p>
          <p><strong>文件类型标识:</strong> {{ parseError.fileType }}</p>
          <p v-if="parseError.rawError"><strong>原始错误:</strong> {{ parseError.rawError.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  parseError: {
    type: Object,
    required: true
  }
})

defineEmits(['reselect', 'showFormats'])

const showDetails = ref(false)

const androidSuggestions = computed(() => [
  {
    icon: '📱',
    title: '确认导出工具',
    description: '请确保使用「SMS Backup & Restore」应用导出的 XML 文件，这是安卓最常用的短信备份工具。'
  },
  {
    icon: '🔍',
    title: '检查 XML 结构',
    description: '打开文件确认是否以 `<?xml` 开头，并包含 `<smses>` 根节点和 `<sms>` 子节点。'
  },
  {
    icon: '📝',
    title: '验证必填属性',
    description: '每条 `<sms>` 记录应包含 `address`（号码）、`body`（内容）、`date`（时间）、`type`（类型）属性。'
  },
  {
    icon: '🔄',
    title: '重新导出',
    description: '如果文件损坏，请在手机上重新运行备份工具，确保导出过程中不要中断。'
  }
])

const iphoneSuggestions = computed(() => [
  {
    icon: '💾',
    title: '确认文件来源',
    description: '当前仅支持解析 iTunes 备份中的 sms.db 数据库文件。请确认文件路径正确。'
  },
  {
    icon: '📂',
    title: '正确获取 sms.db',
    description: 'iTunes 备份路径：`~/Library/Application Support/MobileSync/Backup/[备份ID]/3d/3d0d7e5fb2ce288813306e4d4636395e047a3d28`'
  },
  {
    icon: '📝',
    title: '尝试导出为文本',
    description: '如果数据库解析失败，建议使用第三方工具（如 iMazing、AnyTrans）将短信导出为 CSV 或文本格式。'
  },
  {
    icon: '🔓',
    title: '检查备份加密',
    description: '如果 iTunes 备份设置了密码，请先在 iTunes 中输入密码解密后再尝试。'
  }
])

const csvSuggestions = computed(() => [
  {
    icon: '📊',
    title: '检查表头列名',
    description: '第一行应为表头，需包含 `address`/`phone`/`号码`、`body`/`text`/`内容`、`date`/`time`/`时间`、`type`/`类型` 等列。'
  },
  {
    icon: '🔤',
    title: '检查文件编码',
    description: '请确保文件使用 UTF-8 编码。如果是 Excel 导出，可「另存为」时选择 CSV UTF-8 格式。'
  },
  {
    icon: '📝',
    title: '检查类型字段',
    description: '`type` 列：1 表示接收的消息，2 表示发送的消息。也支持 `sent`/`received` 或 `发送`/`接收`。'
  },
  {
    icon: '🔍',
    title: '检查数据行数',
    description: '除表头外，至少需要一行有效数据。请确认文件内容没有缺失或被意外删除。'
  }
])

const txtSuggestions = computed(() => [
  {
    icon: '🕐',
    title: '检查时间格式',
    description: '每行消息应以可识别的时间开头，如 `2024-01-01 12:00` 或 `2024/01/01 12:00:00`。'
  },
  {
    icon: '📱',
    title: '检查号码格式',
    description: '每行应包含对方的手机号码，如 `13800138000` 或带国家码的 `+8613800138000`。'
  },
  {
    icon: '↔️',
    title: '检查消息方向',
    description: '建议包含「发送」/「接收」或「Sent」/「Received」标识，以便正确区分发送和接收的消息。'
  },
  {
    icon: '📝',
    title: '检查消息内容',
    description: '时间、号码、方向之后应为消息正文，确保没有被意外截断。'
  }
])

const jsonSuggestions = computed(() => [
  {
    icon: '🔍',
    title: '检查 JSON 语法',
    description: '请确保 JSON 格式正确，没有语法错误。可使用在线 JSON 校验工具验证。'
  },
  {
    icon: '📋',
    title: '检查数据结构',
    description: '支持两种格式：`{"messages": [...]}` 或直接是消息数组 `[...]`。'
  },
  {
    icon: '📝',
    title: '检查字段名称',
    description: '每条消息需包含 `address`/`phone`、`body`/`text`/`content`、`date`/`timestamp`、`type`/`direction` 等字段。'
  }
])

const genericSuggestions = computed(() => [
  {
    icon: '📁',
    title: '确认文件格式',
    description: '当前支持的格式：.xml（安卓）、.db/.sqlite（iPhone）、.csv、.txt、.json。'
  },
  {
    icon: '🔄',
    title: '尝试转换格式',
    description: '如果文件格式不支持，建议使用原备份工具重新导出为 CSV 或 XML 格式。'
  },
  {
    icon: '📖',
    title: '查看格式说明',
    description: '点击下方「查看完整格式说明」按钮，了解每种格式的具体要求。'
  }
])

function getFileTypeLabel(type) {
  const labels = {
    'android-xml': '安卓 XML 备份',
    'iphone-db': 'iPhone 数据库',
    'csv': 'CSV 表格',
    'txt': '文本文件',
    'json': 'JSON 数据',
    'unknown': '未知格式'
  }
  return labels[type] || type
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.repair-wizard {
  max-width: 700px;
  margin: 0 auto;
}

.wizard-card {
  padding: 2rem;
}

.wizard-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.wizard-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.wizard-title h3 {
  color: var(--love-red);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.error-message {
  color: var(--text-light);
  margin: 0;
}

.file-info {
  background: var(--bg-light);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  gap: 1rem;
}

.info-label {
  color: var(--text-light);
  font-size: 0.9rem;
}

.info-value {
  color: var(--text-dark);
  font-weight: 500;
  word-break: break-all;
  text-align: right;
}

.repair-suggestions h4 {
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.suggestion-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fff8f8;
  border-radius: 12px;
  border: 1px solid #ffe0e0;
}

.suggestion-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.suggestion-content h5 {
  color: var(--text-dark);
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.suggestion-content p {
  color: var(--text-light);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.format-example {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.format-example h5 {
  color: var(--text-dark);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.code-block {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0;
  line-height: 1.6;
}

.wizard-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.wizard-footer {
  text-align: center;
  margin-top: 1rem;
}

.link-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  padding: 0.5rem;
}

.link-btn:hover {
  color: var(--love-red);
}

.error-details {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
  font-size: 0.85rem;
}

.error-details p {
  margin: 0.25rem 0;
  color: var(--text-light);
  word-break: break-all;
}

.error-details strong {
  color: var(--text-dark);
}
</style>
