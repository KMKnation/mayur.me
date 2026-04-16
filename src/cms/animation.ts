import { AnimationSettings } from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toFiniteNumber = (value: number, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  return value;
};

export const clampAnimationSettings = (
  settings: AnimationSettings
): AnimationSettings => ({
  heroEnabled: Boolean(settings.heroEnabled),
  heroSpeed: clamp(toFiniteNumber(settings.heroSpeed, 1.7), 0.2, 4),
  heroGlowIntensity: clamp(
    toFiniteNumber(settings.heroGlowIntensity, 0.6),
    0,
    1.6
  ),
  cursorRepulsionRadius: clamp(
    toFiniteNumber(settings.cursorRepulsionRadius, 180),
    80,
    420
  ),
  cursorRepulsionStrength: clamp(
    toFiniteNumber(settings.cursorRepulsionStrength, 96),
    20,
    220
  ),
  workCardFloatSpeed: clamp(
    toFiniteNumber(settings.workCardFloatSpeed, 8),
    2,
    20
  ),
  workCardDepth: clamp(toFiniteNumber(settings.workCardDepth, 45), 10, 120),
  techBallFloatSpeed: clamp(
    toFiniteNumber(settings.techBallFloatSpeed, 8),
    2,
    20
  ),
  techBallIntensity: clamp(toFiniteNumber(settings.techBallIntensity, 12), 4, 36),
});

export const parseMaybeNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
};
