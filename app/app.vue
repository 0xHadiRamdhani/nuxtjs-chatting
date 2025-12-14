<template>
  <div class="terminal-container">
    <!-- Matrix Rain Background -->
    <canvas id="matrix-rain" class="matrix-background"></canvas>
    
    <!-- CRT Scanline Overlay -->
    <div class="crt-overlay"></div>
    
    <!-- Main Terminal Interface -->
    <div class="terminal-interface">
      <!-- ASCII Header -->
      <div class="ascii-header">
        <pre>
  _______                     _       _    _           _   
 |__   __|                   | |     | |  | |         | |  
    | | ___  __ _ _ __   __ _| | ____| |  | | __ _ ___| |_ 
    | |/ _ \/ _\` | '_ \ / _\` | |/ / _\` |  | |/ _\` / __| __|
    | |  __/ (_| | | | | (_| |   < (_| |  | | (_| \__ \ |_ 
    |_|\___|\__,_|_| |_|\__,_|_|\_\__,_|  |_|\__,_|___/\__|
        </pre>
        <div class="subtitle">REAL-TIME ENCRYPTED CHAT v1.0</div>
      </div>
      
      <!-- Connection Status -->
      <div class="status-bar">
        <span class="status-indicator" :class="{ connected: isConnected }">
          ●
        </span>
        <span>{{ connectionStatus }}</span>
        <span class="user-count">Users: {{ onlineUsers }}</span>
        <span class="timestamp">{{ currentTime }}</span>
      </div>
      
      <!-- Chat Messages Area -->
      <div class="chat-area" ref="chatArea">
        <div v-for="(message, index) in messages" :key="index" class="message">
          <span class="timestamp">[{{ message.timestamp }}]</span>
          <span class="username">{{ message.username }}:</span>
          <span class="content" v-html="message.content"></span>
        </div>
      </div>
      
      <!-- Input Area -->
      <div class="input-area">
        <span class="prompt">{{ username }}@terminal:~$ </span>
        <input
          ref="messageInput"
          v-model="currentMessage"
          @keyup.enter="sendMessage"
          @keyup.up="navigateHistory(-1)"
          @keyup.down="navigateHistory(1)"
          class="message-input"
          placeholder="Type your message..."
          :disabled="!isConnected"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// Encryption disabled for now to focus on core functionality

// WebSocket and State Management
const config = useRuntimeConfig()
const ws = ref(null)
const isConnected = ref(false)
const connectionStatus = ref('DISCONNECTED')
const onlineUsers = ref(0)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5

// User and Message State
const username = ref('user_' + Math.random().toString(36).substr(2, 8))
const currentMessage = ref('')
const messages = ref([])
const commandHistory = ref([])
const historyIndex = ref(-1)

// Matrix Effect
const matrixCanvas = ref(null)
const matrixCtx = ref(null)
const matrixAnimation = ref(null)
const matrixFontSize = 14
const matrixColumns = ref(0)
const matrixDrops = ref([])
const matrixCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()_+-=[]{}|;:,.<>?'

// Time management
const currentTime = ref('')

// Lifecycle
onMounted(() => {
  initializeMatrixEffect()
  connectWebSocket()
  updateTime()
  setInterval(updateTime, 1000)
})

onUnmounted(() => {
  disconnectWebSocket()
  stopMatrixEffect()
})

// WebSocket Functions
function connectWebSocket() {
  if (ws.value?.readyState === WebSocket.OPEN) {
    return
  }
  
  const wsUrl = config.public.websocketUrl
  ws.value = new WebSocket(wsUrl)
  
  ws.value.onopen = () => {
    console.log('WebSocket connected')
    isConnected.value = true
    connectionStatus.value = 'CONNECTED'
    reconnectAttempts.value = 0
    
    // Send initial message
    ws.value.send(JSON.stringify({
      type: 'system',
      username: username.value,
      content: 'User connected',
      timestamp: new Date().toISOString(),
      encrypted: false
    }))
  }
  
  ws.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      if (data.type === 'system') {
        handleSystemMessage(data)
      } else {
        handleChatMessage(data)
      }
    } catch (error) {
      console.error('Error processing message:', error)
    }
  }
  
  ws.value.onclose = () => {
    console.log('WebSocket disconnected')
    isConnected.value = false
    connectionStatus.value = 'DISCONNECTED'
    
    // Attempt reconnection
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++
      setTimeout(() => {
        console.log(`Reconnection attempt ${reconnectAttempts.value}`)
        connectWebSocket()
      }, 2000 * reconnectAttempts.value)
    }
  }
  
  ws.value.onerror = (error) => {
    console.error('WebSocket error:', error)
    connectionStatus.value = 'ERROR'
  }
}

function disconnectWebSocket() {
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
}

function sendMessage() {
  if (!isConnected.value || !currentMessage.value.trim()) {
    return
  }
  
  // Check for commands
  if (currentMessage.value.startsWith('/')) {
    ws.value.send(JSON.stringify({
      type: 'command',
      username: username.value,
      content: currentMessage.value,
      timestamp: new Date().toISOString(),
      encrypted: false
    }))
  } else {
    // Send regular message
    const encryptedContent = encryptMessage(currentMessage.value)
    ws.value.send(JSON.stringify({
      type: 'message',
      username: username.value,
      content: encryptedContent,
      timestamp: new Date().toISOString(),
      encrypted: true
    }))
  }
  
  // Add to command history
  addToHistory(currentMessage.value)
  
  // Clear input
  currentMessage.value = ''
}

function handleSystemMessage(data) {
  if (data.content.startsWith('ONLINE_USERS:')) {
    onlineUsers.value = parseInt(data.content.split(':')[1])
  } else if (data.content === 'CLEAR_SCREEN') {
    messages.value = []
  } else if (data.content === 'MATRIX_MODE:TOGGLE') {
    toggleMatrixEffect()
  } else if (data.content === 'HACK_MODE:ACTIVATE') {
    activateHackMode()
  } else {
    // Add system message to chat
    messages.value.push({
      ...data,
      content: data.content,
      timestamp: formatTimestamp(data.timestamp)
    })
  }
}

function handleChatMessage(data) {
  let decryptedContent = data.content
  
  if (data.encrypted) {
    decryptedContent = decryptMessage(data.content)
  }
  
  messages.value.push({
    ...data,
    content: decryptedContent,
    timestamp: formatTimestamp(data.timestamp)
  })
  
  // Scroll to bottom
  nextTick(() => {
    const chatArea = document.querySelector('.chat-area')
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight
    }
  })
}

// Encryption Functions
function encryptMessage(message) {
  // Encryption disabled for now
  return message
}

function decryptMessage(encryptedMessage) {
  // Encryption disabled for now
  return encryptedMessage
}

// Matrix Effect Functions
function initializeMatrixEffect() {
  if (process.client) {
    matrixCanvas.value = document.getElementById('matrix-rain')
    if (!matrixCanvas.value) return
    
    matrixCtx.value = matrixCanvas.value.getContext('2d')
    
    // Set canvas size
    matrixCanvas.value.width = window.innerWidth
    matrixCanvas.value.height = window.innerHeight
    
    // Calculate columns
    matrixColumns.value = Math.floor(matrixCanvas.value.width / matrixFontSize)
    
    // Initialize drops
    matrixDrops.value = []
    for (let i = 0; i < matrixColumns.value; i++) {
      matrixDrops.value[i] = Math.random() * -100
    }
    
    // Start animation
    startMatrixAnimation()
    
    // Handle resize
    window.addEventListener('resize', handleMatrixResize)
  }
}

function startMatrixAnimation() {
  function drawMatrix() {
    if (!matrixCtx.value || !matrixCanvas.value) return
    
    // Semi-transparent black background for trail effect
    matrixCtx.value.fillStyle = 'rgba(0, 0, 0, 0.05)'
    matrixCtx.value.fillRect(0, 0, matrixCanvas.value.width, matrixCanvas.value.height)
    
    // Set text properties
    matrixCtx.value.font = `${matrixFontSize}px monospace`
    
    // Draw characters
    for (let i = 0; i < matrixDrops.value.length; i++) {
      const char = matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)]
      const x = i * matrixFontSize
      const y = matrixDrops.value[i] * matrixFontSize
      
      // Random color intensity
      const intensity = Math.random()
      const color = intensity > 0.8 ? '#00ff00' : intensity > 0.6 ? '#00cc00' : '#008800'
      
      matrixCtx.value.fillStyle = color
      matrixCtx.value.fillText(char, x, y)
      
      // Reset drop when it reaches bottom
      if (y > matrixCanvas.value.height && Math.random() > 0.975) {
        matrixDrops.value[i] = 0
      }
      
      // Move drop down
      matrixDrops.value[i]++
    }
    
    matrixAnimation.value = requestAnimationFrame(drawMatrix)
  }
  
  drawMatrix()
}

function stopMatrixEffect() {
  if (matrixAnimation.value) {
    cancelAnimationFrame(matrixAnimation.value)
    matrixAnimation.value = null
  }
  
  if (matrixCanvas.value) {
    matrixCanvas.value.style.display = 'none'
  }
  
  window.removeEventListener('resize', handleMatrixResize)
}

function handleMatrixResize() {
  if (!matrixCanvas.value) return
  
  matrixCanvas.value.width = window.innerWidth
  matrixCanvas.value.height = window.innerHeight
  
  // Recalculate columns
  const newColumns = Math.floor(matrixCanvas.value.width / matrixFontSize)
  
  // Adjust drops array
  if (newColumns > matrixDrops.value.length) {
    for (let i = matrixDrops.value.length; i < newColumns; i++) {
      matrixDrops.value[i] = Math.random() * -100
    }
  } else if (newColumns < matrixDrops.value.length) {
    matrixDrops.value = matrixDrops.value.slice(0, newColumns)
  }
  
  matrixColumns.value = newColumns
}

function toggleMatrixEffect() {
  const canvas = document.getElementById('matrix-rain')
  if (canvas) {
    if (canvas.style.display === 'none') {
      canvas.style.display = 'block'
      initializeMatrixEffect()
    } else {
      canvas.style.display = 'none'
      stopMatrixEffect()
    }
  }
}

function activateHackMode() {
  // Create hacking animation
  const hackOverlay = document.createElement('div')
  hackOverlay.className = 'hack-overlay'
  hackOverlay.innerHTML = `
    <div class="hack-container">
      <div class="hack-header">INITIALIZING HACK SEQUENCE...</div>
      <div class="hack-progress">
        <div class="hack-step" data-step="1">SCANNING TARGET SYSTEM</div>
        <div class="hack-step" data-step="2">BYPASSING FIREWALL</div>
        <div class="hack-step" data-step="3">ACCESSING MAINFRAME</div>
        <div class="hack-step" data-step="4">DOWNLOADING DATA</div>
        <div class="hack-step" data-step="5">COVERING TRACKS</div>
        <div class="hack-step" data-step="6">HACK COMPLETE!</div>
      </div>
      <div class="hack-matrix">${generateRandomMatrix()}</div>
    </div>
  `
  
  document.body.appendChild(hackOverlay)
  
  // Animate steps
  const steps = hackOverlay.querySelectorAll('.hack-step')
  steps.forEach((step, index) => {
    setTimeout(() => {
      step.classList.add('active')
    }, index * 800)
  })
  
  // Remove after animation
  setTimeout(() => {
    if (document.body.contains(hackOverlay)) {
      document.body.removeChild(hackOverlay)
    }
  }, 6000)
}

function generateRandomMatrix() {
  let matrix = ''
  for (let i = 0; i < 100; i++) {
    matrix += Math.random().toString(36).substring(2, 15) + ' '
  }
  return matrix
}

// Utility Functions
function updateTime() {
  currentTime.value = new Date().toLocaleTimeString()
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

function addToHistory(command) {
  commandHistory.value.unshift(command)
  if (commandHistory.value.length > 100) {
    commandHistory.value.pop()
  }
  historyIndex.value = -1
}

function navigateHistory(direction) {
  if (commandHistory.value.length === 0) return
  
  historyIndex.value += direction
  
  if (historyIndex.value < 0) {
    historyIndex.value = -1
    currentMessage.value = ''
    return
  }
  
  if (historyIndex.value >= commandHistory.value.length) {
    historyIndex.value = commandHistory.value.length - 1
  }
  
  currentMessage.value = commandHistory.value[historyIndex.value]
}
</script>

<style scoped>
/* Matrix Rain Background */
.matrix-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.1;
}

/* CRT Scanline Overlay */
.crt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 0, 0.03) 2px,
    rgba(0, 255, 0, 0.03) 4px
  );
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* Terminal Container */
.terminal-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Terminal Interface */
.terminal-interface {
  position: relative;
  z-index: 3;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: rgba(0, 0, 0, 0.9);
}

/* ASCII Header */
.ascii-header {
  text-align: center;
  margin-bottom: 20px;
}

.ascii-header pre {
  font-size: 10px;
  line-height: 1.2;
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

.subtitle {
  font-size: 12px;
  color: #00ff00;
  text-align: center;
  margin-top: 10px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  margin-bottom: 10px;
  font-size: 12px;
}

.status-indicator {
  color: #ff0000;
}

.status-indicator.connected {
  color: #00ff00;
}

.user-count {
  margin-left: auto;
  margin-right: 20px;
}

.timestamp {
  font-family: monospace;
}

/* Chat Area */
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ff00;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.4;
}

.message {
  margin-bottom: 5px;
  word-wrap: break-word;
}

.message .timestamp {
  color: #008800;
}

.message .username {
  color: #00ff00;
  font-weight: bold;
}

.message .content {
  color: #00ff00;
}

/* Input Area */
.input-area {
  display: flex;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #00ff00;
}

.prompt {
  color: #00ff00;
  margin-right: 10px;
  white-space: nowrap;
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #00ff00;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.message-input::placeholder {
  color: #004400;
}

.message-input:disabled {
  color: #444444;
}

/* Hack Overlay */
.hack-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
}

.hack-container {
  background: #000;
  border: 2px solid #00ff00;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 0 20px #00ff00;
}

.hack-header {
  color: #00ff00;
  font-size: 18px;
  text-align: center;
  margin-bottom: 20px;
  animation: blink 0.5s infinite;
}

.hack-step {
  color: #008800;
  margin: 10px 0;
  padding: 5px;
  transition: all 0.3s ease;
}

.hack-step.active {
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
  border-left: 3px solid #00ff00;
  padding-left: 10px;
}

.hack-matrix {
  margin-top: 20px;
  font-size: 10px;
  color: #004400;
  word-break: break-all;
  max-height: 100px;
  overflow: hidden;
}

/* Scrollbar Styling */
.chat-area::-webkit-scrollbar {
  width: 8px;
}

.chat-area::-webkit-scrollbar-track {
  background: #000;
}

.chat-area::-webkit-scrollbar-thumb {
  background: #00ff00;
  border-radius: 4px;
}

.chat-area::-webkit-scrollbar-thumb:hover {
  background: #00cc00;
}

/* Responsive Design */
@media (max-width: 768px) {
  .terminal-interface {
    padding: 10px;
  }
  
  .ascii-header pre {
    font-size: 8px;
  }
  
  .status-bar {
    font-size: 10px;
  }
  
  .chat-area {
    font-size: 12px;
  }
}
</style>
