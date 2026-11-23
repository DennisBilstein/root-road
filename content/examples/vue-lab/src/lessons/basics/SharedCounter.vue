<script lang="ts">
import { ref } from 'vue';

// Fallstrick: Ein normaler <script>-Block läuft einmal pro Modul, nicht pro Instanz.
// Alle SharedCounter teilen sich deshalb diesen ref.
const shared = ref(0);
</script>

<script setup lang="ts">
function increment(): void {
  shared.value++;
}
</script>

<template>
  <button type="button" @click="increment">Geteilt: {{ shared }}</button>
</template>
