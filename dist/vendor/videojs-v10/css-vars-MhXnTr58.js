//#region ../core/dist/dev/core/ui/slider/vars.js
/** CSS custom property names for slider visual state. */
const SliderCSSVars = {
	/** Fill level percentage (0–100). */
	fill: "--media-slider-fill",
	/** Pointer position percentage (0–100). */
	pointer: "--media-slider-pointer",
	/** Buffer level percentage (0–100). */
	buffer: "--media-slider-buffer"
};

//#endregion
//#region ../core/dist/dev/dom/ui/slider/css-vars.js
function getSliderCSSVars(state) {
	return {
		[SliderCSSVars.fill]: `${state.fillPercent.toFixed(3)}%`,
		[SliderCSSVars.pointer]: `${state.pointerPercent.toFixed(3)}%`
	};
}
function getTimeSliderCSSVars(state) {
	return {
		...getSliderCSSVars(state),
		[SliderCSSVars.buffer]: `${state.bufferPercent.toFixed(3)}%`
	};
}
/** Compute structural positioning styles for a slider preview element. */
function getSliderPreviewStyle(width, overflow) {
	const halfWidth = width / 2;
	return {
		position: "absolute",
		left: overflow === "visible" ? `calc(var(${SliderCSSVars.pointer}) - ${halfWidth}px)` : `min(max(0px, calc(var(${SliderCSSVars.pointer}) - ${halfWidth}px)), calc(100% - ${width}px))`,
		width: "max-content",
		pointerEvents: "none"
	};
}

//#endregion
export { getSliderPreviewStyle as n, getTimeSliderCSSVars as r, getSliderCSSVars as t };
//# sourceMappingURL=css-vars-MhXnTr58.js.map