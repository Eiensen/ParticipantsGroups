<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <slot name="header">
            <button class="modal-close" @click="$emit('close')">&times;</button>
          </slot>
        </div>

        <div class="modal-body">
          <slot></slot>
        </div>

        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 8px;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 520px) {
  .modal-content {
    padding: 16px;
    width: 80%;
    border-radius: 12px;
  }

  .modal-header {
    margin-bottom: 16px;
  }

  .modal-close {
    font-size: 28px;
    padding: 8px;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Оптимизация для сенсорных экранов */
  .modal-content {
    -webkit-overflow-scrolling: touch; /* Плавный скролл на iOS */
  }

  /* Предотвращаем масштабирование страницы на iOS при фокусе на input */
  input, textarea, select {
    font-size: 16px;
  }
}
</style>
