import { computed, onScopeDispose, ref, watch } from 'vue';

/** Abgeleiteter Wert (computed) und ausdrücklicher Seiteneffekt (watch) im Vergleich. */
export function useWeeklyPlan(onChange: (minutes: number) => void) {
  const minutes = ref(20);
  const weekly = computed(() => minutes.value * 3);
  watch(minutes, (value) => onChange(value));
  return { minutes, weekly };
}

/** Eine Ressource, die nach dem Ende der Komponente aufgeräumt werden muss. */
export function useTicker(intervalMs = 1000) {
  const ticks = ref(0);
  const timer = setInterval(() => {
    ticks.value++;
  }, intervalMs);
  onScopeDispose(() => clearInterval(timer));
  return { ticks };
}
