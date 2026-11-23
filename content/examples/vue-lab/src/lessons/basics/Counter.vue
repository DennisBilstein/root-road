<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ label: string }>();
// Dieser Code läuft für jede Instanz neu: Jeder Zähler hat seinen eigenen Zustand.
const count = ref(0);
</script>

<template>
  <p>
    <span>{{ label }}: {{ count }}</span>
    <button type="button" @click="count++">+1</button>
  </p>
</template>
