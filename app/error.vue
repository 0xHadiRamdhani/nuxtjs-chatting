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

<style scoped>
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