export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

// The upper half of an ellipse rises from the lower edge, then fills the frame.
export function revealFrame(progress) {
  const p = clamp(progress);
  const grow = p * p * (3 - 2 * p);
  return {
    clip: `ellipse(${50 + 32 * grow}% ${8 + 137 * grow}% at 50% 100%)`,
    scale: 1.16 - .16 * grow,
    copyOpacity: 1 - clamp((p - .3) / .45),
    copyY: -70 * grow,
    captionOpacity: clamp((p - .65) / .25)
  };
}

export function galleryFrame(distance, width, count) {
  const travel = Math.max(0, width * (count - 1));
  const offset = clamp(distance, 0, travel);
  const index = count > 0 ? clamp(Math.round(offset / Math.max(1, width)), 0, count - 1) : 0;
  return { offset, index, progress: count > 0 ? (offset / Math.max(1,width) + 1) / count : 1 };
}
