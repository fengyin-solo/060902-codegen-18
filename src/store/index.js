import { reactive } from 'vue'

export const store = reactive({
  conversations: [],
  selectedConversation: null,
  loveLetters: [],
  anonymousPosts: [],
  processing: false,
  error: null,
  parseError: null,

  setConversations(convs) {
    this.conversations = convs
  },

  setLoveLetters(letters) {
    this.loveLetters = letters
  },

  setSelectedConversation(conv) {
    this.selectedConversation = conv
  },

  addAnonymousPost(post) {
    this.anonymousPosts.unshift(post)
  },

  setProcessing(val) {
    this.processing = val
  },

  setError(err) {
    this.error = err
  },

  setParseError(err) {
    this.parseError = err
    this.error = err ? err.message : null
  },

  clearAll() {
    this.conversations = []
    this.selectedConversation = null
    this.loveLetters = []
    this.error = null
    this.parseError = null
  }
})
