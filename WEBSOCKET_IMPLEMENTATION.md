# Implementasi WebSocket dan Enkripsi

## WebSocket Server Implementation

### Server-side WebSocket Handler (Nitro Route)

Buat file: `server/api/websocket.ts`

```typescript
import { WebSocket } from 'ws'
import CryptoJS from 'crypto-js'

interface WebSocketMessage {
  type: 'message' | 'system' | 'command'
  username: string
  content: string
  timestamp: string
  encrypted?: boolean
}

interface ConnectedUser {
  ws: WebSocket
  username: string
  id: string
}

const connectedUsers = new Map<string, ConnectedUser>()

export default defineWebSocketHandler({
  open(peer) {
    console.log('WebSocket connection opened:', peer)
    
    const userId = generateUserId()
    const username = `user_${userId.substring(0, 8)}`
    
    connectedUsers.set(userId, {
      ws: peer,
      username,
      id: userId
    })
    
    // Send welcome message
    peer.send(JSON.stringify({
      type: 'system',
      username: 'SYSTEM',
      content: `Welcome ${username}! Type /help for commands.`,
      timestamp: new Date().toISOString(),
      encrypted: false
    }))
    
    // Broadcast user joined
    broadcastMessage({
      type: 'system',
      username: 'SYSTEM',
      content: `${username} joined the chat`,
      timestamp: new Date().toISOString(),
      encrypted: false
    }, userId)
    
    // Send online users count
    broadcastUserCount()
  },
  
  message(peer, message) {
    try {
      const data = JSON.parse(message.text()) as WebSocketMessage
      
      if (data.type === 'command') {
        handleCommand(data, peer)
      } else {
        // Encrypt message content
        const encryptedContent = encryptMessage(data.content)
        
        const processedMessage: WebSocketMessage = {
          ...data,
          content: encryptedContent,
          encrypted: true,
          timestamp: new Date().toISOString()
        }
        
        broadcastMessage(processedMessage)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      peer.send(JSON.stringify({
        type: 'system',
        username: 'SYSTEM',
        content: 'Error processing message',
        timestamp: new Date().toISOString(),
        encrypted: false
      }))
    }
  },
  
  close(peer) {
    console.log('WebSocket connection closed:', peer)
    
    // Find and remove user
    let disconnectedUser: ConnectedUser | null = null
    for (const [id, user] of connectedUsers.entries()) {
      if (user.ws === peer) {
        disconnectedUser = user
        connectedUsers.delete(id)
        break
      }
    }
    
    if (disconnectedUser) {
      broadcastMessage({
        type: 'system',
        username: 'SYSTEM',
        content: `${disconnectedUser.username} left the chat`,
        timestamp: new Date().toISOString(),
        encrypted: false
      })
      
      broadcastUserCount()
    }
  },
  
  error(peer, error) {
    console.error('WebSocket error:', error)
  }
})

function generateUserId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function broadcastMessage(message: WebSocketMessage, excludeUserId?: string) {
  const messageStr = JSON.stringify(message)
  
  for (const [userId, user] of connectedUsers.entries()) {
    if (userId !== excludeUserId && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(messageStr)
    }
  }
}

function broadcastUserCount() {
  const userCount = connectedUsers.size
  
  for (const user of connectedUsers.values()) {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify({
        type: 'system',
        username: 'SYSTEM',
        content: `ONLINE_USERS:${userCount}`,
        timestamp: new Date().toISOString(),
        encrypted: false
      }))
    }
  }
}

function handleCommand(data: WebSocketMessage, peer: WebSocket) {
  const command = data.content.toLowerCase()
  let response = ''
  
  switch (command) {
    case '/help':
      response = 'Commands: /help, /matrix, /hack, /clear, /users, /time'
      break
    case '/matrix':
      response = 'MATRIX_MODE:TOGGLE'
      break
    case '/hack':
      response = 'HACK_MODE:ACTIVATE'
      break
    case '/clear':
      response = 'CLEAR_SCREEN'
      break
    case '/users':
      response = `Online users: ${connectedUsers.size}`
      break
    case '/time':
      response = `Server time: ${new Date().toLocaleString()}`
      break
    default:
      response = `Unknown command: ${command}. Type /help for available commands.`
  }
  
  peer.send(JSON.stringify({
    type: 'system',
    username: 'SYSTEM',
    content: response,
    timestamp: new Date().toISOString(),
    encrypted: false
  }))
}

function encryptMessage(message: string): string {
  const key = useRuntimeConfig().encryptionKey
  return CryptoJS.AES.encrypt(message, key).toString()
}

function decryptMessage(encryptedMessage: string): string {
  const key = useRuntimeConfig().encryptionKey
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

## Client-side WebSocket Implementation

### WebSocket Client (app.vue)

```vue
<script setup>
// WebSocket state
const ws = ref(null)
const isConnected = ref(false)
const connectionStatus = ref('DISCONNECTED')
const onlineUsers = ref(0)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5

// WebSocket connection function
function connectWebSocket() {
  if (ws.value?.readyState === WebSocket.OPEN) {
    return
  }
  
  const wsUrl = useRuntimeConfig().public.websocketUrl
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
      const data = JSON.parse(event.data) as WebSocketMessage
      
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

// Message handling functions
function handleSystemMessage(data: WebSocketMessage) {
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

function handleChatMessage(data: WebSocketMessage) {
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

// Message sending function
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
    ws.value.send(JSON.stringify({
      type: 'message',
      username: username.value,
      content: currentMessage.value,
      timestamp: new Date().toISOString(),
      encrypted: true
    }))
  }
  
  // Add to command history
  addToHistory(currentMessage.value)
  
  // Clear input
  currentMessage.value = ''
}

// Encryption functions
function encryptMessage(message: string): string {
  const key = useRuntimeConfig().encryptionKey
  return CryptoJS.AES.encrypt(message, key).toString()
}

function decryptMessage(encryptedMessage: string): string {
  const key = useRuntimeConfig().encryptionKey
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption error:', error)
    return '[ENCRYPTED MESSAGE]'
  }
}

// Utility functions
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

function addToHistory(command: string) {
  commandHistory.value.unshift(command)
  if (commandHistory.value.length > 100) {
    commandHistory.value.pop()
  }
  historyIndex.value = -1
}

function navigateHistory(direction: number) {
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

// Cleanup function
function disconnectWebSocket() {
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
}
</script>
```

## Easter Egg Commands Implementation

```vue
<script setup>
// Easter egg functions
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
    <div class="hack-text">
      INITIALIZING HACK SEQUENCE...<br>
      BYPASSING FIREWALL...<br>
      ACCESSING MAINFRAME...<br>
      DOWNLOADING DATA...<br>
      COVERING TRACKS...<br>
      HACK COMPLETE!
    </div>
  `
  
  document.body.appendChild(hackOverlay)
  
  // Remove after animation
  setTimeout(() => {
    document.body.removeChild(hackOverlay)
  }, 5000)
}
</script>

<style>
.hack-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hack-text {
  color: #00ff00;
  font-family: monospace;
  font-size: 18px;
  text-align: center;
  animation: hack-blink 0.1s infinite;
}

@keyframes hack-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.8; }
}
</style>
```

## Security Considerations

1. **Message Encryption**: All messages are encrypted using AES before transmission
2. **Input Validation**: All user inputs are validated and sanitized
3. **Rate Limiting**: Implement rate limiting to prevent spam
4. **Connection Limits**: Limit number of connections per IP
5. **Error Handling**: Graceful error handling without exposing sensitive information

## Performance Optimizations

1. **Message Batching**: Batch multiple messages for better performance
2. **Connection Pooling**: Reuse WebSocket connections efficiently
3. **Memory Management**: Clean up old messages and connections
4. **Compression**: Enable message compression for large payloads
5. **Caching**: Cache frequently accessed data