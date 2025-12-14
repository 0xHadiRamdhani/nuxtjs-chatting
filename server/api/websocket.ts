// Encryption disabled for now to focus on core functionality

interface WebSocketMessage {
    type: 'message' | 'system' | 'command'
    username: string
    content: string
    timestamp: string
    encrypted?: boolean
}

interface ConnectedUser {
    peer: any
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
            peer: peer,
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
                // Encryption disabled for now
                const processedMessage: WebSocketMessage = {
                    ...data,
                    content: data.content,
                    encrypted: false,
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
            if (user.peer === peer) {
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
        if (userId !== excludeUserId && user.peer) {
            try {
                user.peer.send(messageStr)
            } catch (error) {
                console.error('Error sending message to user:', error)
            }
        }
    }
}

function broadcastUserCount() {
    const userCount = connectedUsers.size

    for (const user of connectedUsers.values()) {
        if (user.peer) {
            try {
                user.peer.send(JSON.stringify({
                    type: 'system',
                    username: 'SYSTEM',
                    content: `ONLINE_USERS:${userCount}`,
                    timestamp: new Date().toISOString(),
                    encrypted: false
                }))
            } catch (error) {
                console.error('Error broadcasting user count:', error)
            }
        }
    }
}

function handleCommand(data: WebSocketMessage, peer: any) {
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

    try {
        peer.send(JSON.stringify({
            type: 'system',
            username: 'SYSTEM',
            content: response,
            timestamp: new Date().toISOString(),
            encrypted: false
        }))
    } catch (error) {
        console.error('Error sending command response:', error)
    }
}

function encryptMessage(message: string): string {
    const config = useRuntimeConfig()
    const key = config.encryptionKey as string
    return CryptoJS.AES.encrypt(message, key).toString()
}

function decryptMessage(encryptedMessage: string): string {
    const config = useRuntimeConfig()
    const key = config.encryptionKey as string
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, key)
    return bytes.toString(CryptoJS.enc.Utf8)
}