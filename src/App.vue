<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
</script>

<template>
  <h1>Web Bank</h1>
  <div id="view">
    <router-view/>
  </div>

</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 75px;
}

</style>
