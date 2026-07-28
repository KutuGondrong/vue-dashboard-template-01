import { ref, watch } from 'vue';

/**
 * Increments whenever `animated` flips false → true or `replayToken` changes
 * so animated elements remount and replay CSS / SVG transitions.
 */
export function useChartAnimationKey(
  animated: () => boolean,
  replayToken?: () => number | string | undefined,
) {
  const animationKey = ref(animated() ? 1 : 0);
  const prevAnimated = ref(animated());
  const prevReplayToken = ref(replayToken?.());

  watch(
    () => [animated(), replayToken?.()] as const,
    ([nextAnimated, nextReplayToken]) => {
      const animatedTurnedOn = nextAnimated && !prevAnimated.value;
      const replayTokenChanged =
        nextAnimated &&
        nextReplayToken !== undefined &&
        prevReplayToken.value !== undefined &&
        nextReplayToken !== prevReplayToken.value;

      if (animatedTurnedOn || replayTokenChanged) {
        animationKey.value += 1;
      }

      prevAnimated.value = nextAnimated;
      prevReplayToken.value = nextReplayToken;
    },
  );

  return animationKey;
}
