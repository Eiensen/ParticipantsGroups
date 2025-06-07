<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "./store/useStore";
import HomeView from "./views/HomeView.vue";

const store = useStore();
const { state } = store;
const error = computed(() => state.value.error);
</script>

<template>
  <div class="app">
    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error.message }}
    </div>

    <div class="container">
      <!-- Header section -->
      <header class="header">
        <h1>Управление участниками и группами</h1>
      </header>

      <!-- Main content -->
      <HomeView />
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.header h1 {
  margin: 0;
  font-size: 1.5em;
  color: #2c3e50;
}

.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #ff4444;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
