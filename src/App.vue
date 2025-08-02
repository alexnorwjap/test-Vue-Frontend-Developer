<script setup lang="ts">
import AccountsForm from './components/AccountsForm.vue'
</script>

<template>
  <div id="app">
    <AccountsForm />
  </div>
</template>

<style>
* {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

body {
  font-size: 16px;
  line-height: 1.6;
}

h1 {
  font-size: 24px;
  font-weight: 600;
}

h2 {
  font-size: 20px;
  font-weight: 600;
}

h3, h4, h5, h6 {
  font-size: 20px;
  font-weight: 600;
}
</style>

<style scoped>
#app {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0;
  font-size: 16px;
}
</style>
