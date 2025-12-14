# Implementasi Efek Visual dan Animasi

## 1. Matrix Rain Effect

### Canvas Implementation
```vue
<script setup>
// Matrix effect variables
const matrixCanvas = ref(null)
const matrixCtx = ref(null)
const matrixAnimation = ref(null)
const matrixFontSize = 14
const matrixColumns = ref(0)
const matrixDrops = ref([])
const matrixCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()_+-=[]{}|;:,.<>?'

// Initialize matrix effect
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

// Start matrix animation
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

// Stop matrix animation
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

// Handle matrix resize
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
</script>
```

## 2. CRT Scanline Effect

### CSS Implementation
```vue
<style>
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

/* CRT Screen Effect */
.crt-screen {
  position: relative;
  overflow: hidden;
}

.crt-screen::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    transparent 50%,
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 2px;
  z-index: 1;
  pointer-events: none;
}

.crt-screen::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 70%,
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 2;
  pointer-events: none;
}
</style>
```

## 3. Text Blinking and Flickering Effects

### CSS Animations
```vue
<style>
/* Blink animation */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.text-blink {
  animation: blink 1s infinite;
}

/* Flicker animation */
@keyframes flicker {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

.text-flicker {
  animation: flicker 0.1s infinite;
}

/* Glitch effect */
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.text-glitch {
  animation: glitch 0.3s infinite;
}

/* Typewriter effect */
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

.typewriter {
  overflow: hidden;
  white-space: nowrap;
  animation: typewriter 2s steps(40, end);
}

/* Glow effect */
.text-glow {
  text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00;
}

/* Pulse effect */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.text-pulse {
  animation: pulse 2s infinite;
}
</style>
```

## 4. ASCII Art Header

### Dynamic ASCII Generation
```vue
<script setup>
// ASCII art generator
function generateASCIIArt(text) {
  const asciiPatterns = {
    'TERMINAL': `
  _______                     _       _    _           _   
 |__   __|                   | |     | |  | |         | |  
    | | ___  __ _ _ __   __ _| | ____| |  | | __ _ ___| |_ 
    | |/ _ \\/ _\` | '_ \\ / _\\` | |/ / _\\` |  | |/ _\\` / __| __|
    | |  __/ (_| | | | | (_| |   < (_| |  | | (_| \\__ \\ |_ 
    |_|\\___|\\__,_|_| |_|\\__,_|_|\\_\\__,_|  |_|\\__,_|___/\\__|
    `,
    'CHAT': `
  ____  _   _ ____  _   _ 
 / ___|| | | |  _ \\| | | |
 \\___ \\| |_| | |_) | |_| |
  ___) |  _  |  __/|  _  |
 |____/|_| |_|_|   |_| |_|
    `,
    'HACK': `
  _   _ _____ _____ ____  
 | | | |_   _|_   _|  _ \\ 
 | |_| | | |   | | | |_) |
 |  _  | | |   | | |  __/ 
 |_| |_| |_|   |_| |_|    
    `
  }
  
  return asciiPatterns[text] || text
}

// Dynamic subtitle generator
function getRandomSubtitle() {
  const subtitles = [
    'REAL-TIME ENCRYPTED CHAT v1.0',
    'SECURE COMMUNICATION PROTOCOL',
    'ZERO TRACKING POLICY ACTIVE',
    'END-TO-END ENCRYPTION ENABLED',
    'SYSTEM READY FOR TRANSMISSION'
  ]
  
  return subtitles[Math.floor(Math.random() * subtitles.length)]
}
</script>
```

## 5. Hacking Animation Effect

### Easter Egg Animation
```vue
<script setup>
function activateHackMode() {
  // Create hacking overlay
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
</script>

<style>
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
</style>
```

## 6. Kernel Panic 404 Page

### Error Page Design
```vue
<template>
  <div class="kernel-panic">
    <div class="panic-container">
      <pre class="panic-header">
================================================================================
                              KERNEL PANIC
================================================================================

      </pre>
      <div class="panic-content">
        <div class="error-line">ERROR: Page not found - {{ error.statusCode }}</div>
        <div class="error-line">URL: {{ error.url }}</div>
        <div class="error-line">Timestamp: {{ new Date().toISOString() }}</div>
        <div class="error-line">Process: nuxt-app</div>
        <div class="error-line">PID: {{ Math.floor(Math.random() * 10000) }}</div>
        <div class="error-line">UID: {{ Math.floor(Math.random() * 1000) }}</div>
        
        <div class="error-section">Call Trace:</div>
        <div class="stack-trace" v-for="(line, index) in stackTrace" :key="index">
          [{{ index.toString().padStart(2, '0') }}] {{ line }}
        </div>
        
        <div class="error-section">Registers:</div>
        <div class="registers">
          RIP: 0x{{ Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0') }}
          RSP: 0x{{ Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0') }}
          RAX: 0x{{ Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0') }}
          RBX: 0x{{ Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0') }}
        </div>
        
        <div class="reboot-prompt">
          System halted. Press CTRL+ALT+DEL to reboot or 
          <NuxtLink to="/" class="reboot-link">click here to return home</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const stackTrace = [
  'panic+0x123/0x456',
  'page_fault_handler+0x789/0xabc',
  'do_page_fault+0xdef/0x1234',
  'error_code+0x567/0x890',
  'nuxt_router+0xabcd/0xef01',
  'vue_component+0x2345/0x6789'
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

.panic-container {
  max-width: 800px;
  margin: 0 auto;
}

.panic-header {
  color: #ff0000;
  text-align: center;
  font-size: 14px;
  margin-bottom: 20px;
}

.error-line {
  margin-bottom: 5px;
  color: #ff0000;
}

.error-section {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #ff6600;
  font-weight: bold;
}

.stack-trace {
  color: #ff6600;
  margin-left: 20px;
  margin-bottom: 3px;
  font-size: 12px;
}

.registers {
  color: #ffaa00;
  margin-left: 20px;
  margin-bottom: 5px;
  font-size: 12px;
}

.reboot-prompt {
  margin-top: 30px;
  color: #ffff00;
  text-align: center;
}

.reboot-link {
  color: #00ff00;
  text-decoration: underline;
}

.reboot-link:hover {
  color: #00ff88;
}
</style>
```

## 7. Performance Optimizations

### Animation Performance
```vue
<script setup>
// Use requestAnimationFrame for smooth animations
function optimizedMatrixAnimation() {
  let lastTime = 0
  const fps = 30
  const interval = 1000 / fps
  
  function animate(currentTime) {
    if (currentTime - lastTime >= interval) {
      // Update matrix animation
      updateMatrix()
      lastTime = currentTime
    }
    
    matrixAnimation.value = requestAnimationFrame(animate)
  }
  
  matrixAnimation.value = requestAnimationFrame(animate)
}

// Throttle resize events
function throttledResize() {
  let timeout
  return function() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      handleMatrixResize()
    }, 250)
  }
}

// Use CSS transforms for better performance
function useHardwareAcceleration() {
  const elements = document.querySelectorAll('.matrix-character')
  elements.forEach(el => {
    el.style.transform = 'translateZ(0)' // Enable hardware acceleration
  })
}
</script>
```

## Usage Instructions

1. **Matrix Effect**: Toggle with `/matrix` command
2. **CRT Effect**: Always active, can be toggled with CSS
3. **Blink Effects**: Use `text-blink` class on any element
4. **Hack Animation**: Trigger with `/hack` command
5. **Kernel Panic**: Automatic on 404 errors

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers with WebGL support