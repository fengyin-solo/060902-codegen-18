import { parseAndroidXML } from './androidParser'
import { parseIPhoneBackup } from './iphoneParser'
import { parseCSV } from './csvParser'
import { generateDemoData } from './demoData'

export class ParseError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ParseError'
    this.fileType = options.fileType || 'unknown'
    this.fileName = options.fileName || ''
    this.fileSize = options.fileSize || 0
    this.errorCode = options.errorCode || 'parse_failed'
    this.rawError = options.rawError || null
  }
}

export function detectFileType(fileName) {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.xml')) return 'android-xml'
  if (lower.endsWith('.db') || lower.endsWith('.sqlite')) return 'iphone-db'
  if (lower.endsWith('.csv')) return 'csv'
  if (lower.endsWith('.txt')) return 'txt'
  if (lower.endsWith('.json')) return 'json'
  return 'unknown'
}

export async function parseSmsFile(file) {
  const fileName = file.name
  const fileType = detectFileType(fileName)
  const errorOptions = {
    fileType,
    fileName: file.name,
    fileSize: file.size
  }
  
  try {
    if (fileType === 'android-xml') {
      return await parseAndroidXML(file)
    } else if (fileType === 'iphone-db') {
      return await parseIPhoneBackup(file)
    } else if (fileType === 'csv' || fileType === 'txt') {
      return await parseCSV(file)
    } else if (fileType === 'json') {
      return await parseJSON(file)
    }
    
    throw new ParseError('不支持的文件格式，请上传 .xml, .csv, .txt, .db 或 .json 文件', {
      ...errorOptions,
      errorCode: 'unsupported_format'
    })
  } catch (e) {
    if (e instanceof ParseError) {
      throw e
    }
    throw new ParseError(e.message, {
      ...errorOptions,
      errorCode: 'parse_failed',
      rawError: e
    })
  }
}

export async function parseJSON(file) {
  const text = await readFileAsText(file)
  const data = JSON.parse(text)
  return normalizeData(data)
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function normalizeData(data) {
  if (data.messages && Array.isArray(data.messages)) {
    return groupConversations(data.messages.map(msg => normalizeMessage(msg)))
  }
  if (Array.isArray(data)) {
    return groupConversations(data.map(msg => normalizeMessage(msg)))
  }
  throw new Error('无法解析的数据格式')
}

function normalizeMessage(msg) {
  return {
    id: msg.id || msg._id || Math.random().toString(36).substr(2, 9),
    address: msg.address || msg.sender || msg.phone || '',
    body: msg.body || msg.text || msg.content || '',
    date: msg.date || msg.timestamp || msg.time || Date.now(),
    type: msg.type || msg.direction || (msg.isSent ? 2 : 1),
    isSent: msg.type === 2 || msg.direction === 'sent' || msg.isSent === true,
    isReceived: msg.type === 1 || msg.direction === 'received' || msg.isSent === false,
    read: msg.read !== undefined ? msg.read : true,
    threadId: msg.threadId || msg.thread_id || msg.address || 'default'
  }
}

export function groupConversations(messages) {
  const convMap = new Map()
  
  messages.sort((a, b) => a.date - b.date)
  
  messages.forEach((msg, index) => {
    const key = msg.address || msg.threadId || 'unknown'
    if (!convMap.has(key)) {
      convMap.set(key, {
        id: key,
        address: key,
        name: guessName(key),
        messages: [],
        startTime: msg.date,
        endTime: msg.date
      })
    }
    const conv = convMap.get(key)
    conv.messages.push({
      ...msg,
      index,
      replyTo: index > 0 ? index - 1 : null
    })
    conv.endTime = msg.date
  })
  
  const conversations = []
  convMap.forEach(conv => {
    conv.messageCount = conv.messages.length
    conv.duration = conv.endTime - conv.startTime
    conversations.push(conv)
  })
  
  conversations.sort((a, b) => b.messageCount - a.messageCount)
  
  return conversations
}

function guessName(address) {
  if (!address) return '未知联系人'
  const phone = address.replace(/\D/g, '')
  if (phone.length >= 7) {
    return `联系人 ${phone.substr(-4)}`
  }
  return address
}

export { generateDemoData }
