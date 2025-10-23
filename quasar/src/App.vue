<template>
  <div class="background">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// Preload images when app starts
onMounted(() => {
  const imagesToPreload = [
    '/assets/task_img.png'
  ]
  
  imagesToPreload.forEach(src => {
    const img = new Image()
    img.src = src
  })
})
</script>

<style>
/* .background {
    background-color: #f0f0f0;
} */
</style>
