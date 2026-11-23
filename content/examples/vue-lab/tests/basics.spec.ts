import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia, storeToRefs } from 'pinia';
import { computed, effectScope, nextTick, reactive, ref, toRef, watch } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import Counter from '../src/lessons/basics/Counter.vue';
import SharedCounter from '../src/lessons/basics/SharedCounter.vue';
import { useTicker, useWeeklyPlan } from '../src/lessons/basics/weeklyPlan';
import { routes } from '../src/router';
import { useTasksStore } from '../src/stores/tasks';

describe('script setup und Instanzen (js-m1-l8)', () => {
  it('jede Instanz hat ihren eigenen Zustand', async () => {
    const a = mount(Counter, { props: { label: 'A' } });
    const b = mount(Counter, { props: { label: 'B' } });
    await a.get('button').trigger('click');
    await a.get('button').trigger('click');
    expect(a.text()).toContain('A: 2');
    expect(b.text()).toContain('B: 0');
    a.unmount();
    b.unmount();
  });

  it('die Interpolation zeigt HTML als Text', () => {
    const wrapper = mount(Counter, { props: { label: '<b>fett</b>' } });
    expect(wrapper.find('b').exists()).toBe(false);
    expect(wrapper.text()).toContain('<b>fett</b>');
    wrapper.unmount();
  });

  it('ein Zustand im normalen script-Block wird von allen Instanzen geteilt', async () => {
    const a = mount(SharedCounter);
    const b = mount(SharedCounter);
    await a.get('button').trigger('click');
    expect(a.text()).toContain('Geteilt: 1');
    expect(b.text()).toContain('Geteilt: 1');
    a.unmount();
    b.unmount();
  });
});

describe('Reaktivität, computed, watch und Aufräumen (js-m1-l9)', () => {
  it('computed ist träge, merkt sich den Wert und rechnet nur nach einer Änderung neu', async () => {
    const getter = vi.fn((value: number) => value * 3);
    const minutes = ref(20);
    const weekly = computed(() => getter(minutes.value));
    expect(getter).not.toHaveBeenCalled();
    expect(weekly.value).toBe(60);
    expect(weekly.value).toBe(60);
    expect(getter).toHaveBeenCalledTimes(1);
    minutes.value = 25;
    expect(weekly.value).toBe(75);
    expect(getter).toHaveBeenCalledTimes(2);
  });

  it('watch läuft standardmäßig gebündelt vor dem nächsten Rendern, mit flush "sync" sofort', async () => {
    const lazy = vi.fn();
    const eager = vi.fn();
    const minutes = ref(20);
    const scope = effectScope();
    scope.run(() => {
      watch(minutes, lazy);
      watch(minutes, eager, { flush: 'sync' });
    });
    minutes.value = 21;
    minutes.value = 22;
    expect(eager).toHaveBeenCalledTimes(2);
    expect(lazy).not.toHaveBeenCalled();
    await nextTick();
    expect(lazy).toHaveBeenCalledTimes(1);
    expect(lazy.mock.calls[0]?.[0]).toBe(22);
    scope.stop();
  });

  it('useWeeklyPlan trennt abgeleiteten Wert und Seiteneffekt', async () => {
    const seen: number[] = [];
    const scope = effectScope();
    const plan = scope.run(() => useWeeklyPlan((value) => seen.push(value)))!;
    expect(plan.weekly.value).toBe(60);
    plan.minutes.value = 25;
    await nextTick();
    expect(plan.weekly.value).toBe(75);
    expect(seen).toEqual([25]);
    scope.stop();
  });

  it('Destrukturieren eines reactive-Objekts kopiert nur den Wert; toRef behält die Verbindung', () => {
    const state = reactive({ minutes: 20 });
    const { minutes } = state;
    const linked = toRef(state, 'minutes');
    state.minutes = 25;
    expect(minutes).toBe(20);
    expect(linked.value).toBe(25);
  });

  it('der Timer wird mit dem Scope beendet', () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const { ticks } = scope.run(() => useTicker(100))!;
    vi.advanceTimersByTime(350);
    expect(ticks.value).toBe(3);
    scope.stop();
    vi.advanceTimersByTime(1000);
    expect(ticks.value).toBe(3);
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});

describe('Router (js-m1-l12)', () => {
  const make = () => createRouter({ history: createMemoryHistory(), routes });

  it('benannte Routen führen zu den Pfaden', async () => {
    const router = make();
    expect(router.resolve({ name: 'tasks' }).path).toBe('/');
    expect(router.resolve({ name: 'about' }).path).toBe('/about');
  });

  it('die About-Route lädt ihre Komponente erst bei Bedarf', async () => {
    const router = make();
    const about = () => router.getRoutes().find((route) => route.name === 'about');
    expect(typeof about()?.components?.default).toBe('function');
    await router.push('/about');
    expect(router.currentRoute.value.name).toBe('about');
    expect(typeof about()?.components?.default).toBe('object');
  });

  it('unbekannte Pfade werden auf die Startseite umgeleitet', async () => {
    const router = make();
    await router.push('/gibt-es-nicht/unterseite');
    expect(router.currentRoute.value.name).toBe('tasks');
    expect(router.currentRoute.value.fullPath).toBe('/');
  });

  it('bei der Weiterleitung bleiben Query und Hash erhalten', async () => {
    const router = make();
    await router.push('/xyz?a=1#b');
    expect(router.currentRoute.value.name).toBe('tasks');
    expect(router.currentRoute.value.fullPath).toBe('/?a=1#b');
  });
});

describe('Pinia (js-m1-l13)', () => {
  it('storeToRefs bleibt aktuell, ein einfaches Destrukturieren des Zählers nicht', () => {
    setActivePinia(createPinia());
    const store = useTasksStore();
    const { remaining } = storeToRefs(store);
    const { remaining: snapshot } = store;
    store.add('Eins');
    store.add('Zwei');
    expect(remaining.value).toBe(2);
    expect(snapshot).toBe(0);
  });

  it('replace mit ungültigen Daten wirft und lässt die alte Liste unverändert', () => {
    setActivePinia(createPinia());
    const store = useTasksStore();
    store.add('Alt');
    expect(() => store.replace([{ id: 1, title: 'x', done: 'nein' }])).toThrow();
    expect(store.tasks.map((task) => task.title)).toEqual(['Alt']);
  });

  it('zwei Aufrufe liefern denselben Store', () => {
    setActivePinia(createPinia());
    expect(useTasksStore()).toBe(useTasksStore());
  });
});
