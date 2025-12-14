# Desain Komponen Utama Aplikasi Terminal Chat

## Struktur app.vue

### Template Structure
```vue
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
    | |/ _ \/ _` | '_ \ / _` | |/ / _` |  | |/ _` / __| __|
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
```

### Script Setup
```vue
<script setup>
// WebSocket and State Management
const { $config } = useNuxtApp()
const ws = ref(null)
const isConnected = ref(false)
const connectionStatus = ref('DISCONNECTED')
const onlineUsers = ref(0)
const currentTime = ref('')

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

// Encryption
const encryptionKey = 'terminal-chat-2024'

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
  // Implementation details
}

function disconnectWebSocket() {
  // Implementation details
}

function sendMessage() {
  // Implementation details
}

function receiveMessage(data) {
  // Implementation details
}

// Encryption Functions
function encryptMessage(message) {
  // Implementation details
}

function decryptMessage(encryptedMessage) {
  // Implementation details
}

// Matrix Effect Functions
function initializeMatrixEffect() {
  // Implementation details
}

function stopMatrixEffect() {
  // Implementation details
}

// Utility Functions
function updateTime() {
  currentTime.value = new Date().toLocaleTimeString()
}

function navigateHistory(direction) {
  // Implementation details
}

function executeCommand(command) {
  // Easter egg commands implementation
}

// Command History Management
function addToHistory(command) {
  commandHistory.value.unshift(command)
  if (commandHistory.value.length > 100) {
    commandHistory.value.pop()
  }
  historyIndex.value = -1
}
</script>
```

### Style Section
```vue
<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #000;
  color: #00ff00;
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
  overflow: hidden;
}

/* Terminal Container */
.terminal-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Matrix Background */
.matrix-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.1;
}

/* CRT Overlay */
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

.timestamp {
  color: #008800;
}

.username {
  color: #00ff00;
  font-weight: bold;
}

.content {
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
```

## Komponen Error 404 (Kernel Panic)

### File: app/error.vue
```vue
<template>
  <div class="kernel-panic">
    <pre class="panic-header">
================================================================================
                              KERNEL PANIC
================================================================================

    </pre>
    <div class="panic-content">
      <div class="error-line">ERROR: Page not found - {{ error.statusCode }}</div>
      <div class="error-line">URL: {{ error.url }}</div>
      <div class="error-line">Timestamp: {{ new Date().toISOString() }}</div>
      <div class="error-line">Stack trace:</div>
      <div class="stack-trace" v-for="(line, index) in stackTrace" :key="index">
        {{ line }}
      </div>
      <div class="reboot-prompt">
        System halted. Press CTRL+ALT+DEL to reboot or 
        <NuxtLink to="/" class="reboot-link">click here to return home</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const stackTrace = [
  '0x00000001  nuxt_app() + 0x123',
  '0x00000002  vue_router() + 0x456',
  '0x00000003  page_not_found() + 0x789',
  '0x00000004  kernel_panic() + 0xabc'
]
</script>

<style>
.kernel-panic {
  background: #000;
  color: #ff0000;
  font-family: monospace;
  padding: 20px;
  height: 100vh;
  overflow: auto;
}

.panic-header {
  color: #ff0000;
  text-align: center;
  font-size: 16px;
}

.error-line {
  margin-bottom: 10px;
}

.stack-trace {
  color: #ff6600;
  margin-left: 20px;
  margin-bottom: 5px;
}

.reboot-prompt {
  margin-top: 30px;
  color: #ffff00;
}

.reboot-link {
  color: #00ff00;
  text-decoration: underline;
}
</style>
```

## File CSS Global (assets/css/main.css)

```css
/* Global Terminal Styles */
:root {
  --terminal-green: #00ff00;
  --terminal-dark: #000000;
  --terminal-dim: #004400;
  --terminal-bright: #00ff88;
  --terminal-red: #ff0000;
  --terminal-yellow: #ffff00;
}

/* Base styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
  background-color: var(--terminal-dark);
  color: var(--terminal-green);
  overflow: hidden;
}

/* Utility classes */
.text-blink {
  animation: blink-animation 1s infinite;
}

@keyframes blink-animation {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.text-glow {
  text-shadow: 0 0 5px var(--terminal-green);
}

.text-flicker {
  animation: flicker-animation 0.1s infinite;
}

@keyframes flicker-animation {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--terminal-dark);
}

::-webkit-scrollbar-thumb {
  background: var(--terminal-green);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--terminal-bright);
}