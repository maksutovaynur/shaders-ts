<script setup lang="ts">
import AppMenu from './components/AppMenu.vue';
import GameCanvas from './components/GameCanvas.vue';
</script>

<template>
  <div class="app-container">
    <AppMenu class="app-menu" />
    <GameCanvas class="game-canvas" />
  </div>
</template>

<style scoped lang="sass">
.app-container
  position: fixed
  left: 0
  top: 0
  right: 0
  bottom: 0
  background-color: black
  display: flex
  flex-direction: column
  --menu-content-ratio: 0.05

.app-menu
  position: absolute
  left: 0
  top: 0
  right: 0
  bottom: calc((1 - var(--menu-content-ratio))*100%)

.game-canvas
  position: absolute
  left: 0
  right: 0
  bottom: 0
  top: calc(var(--menu-content-ratio)*100%)
</style>
