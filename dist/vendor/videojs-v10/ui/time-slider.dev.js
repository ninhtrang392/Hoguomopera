/*! Video.js | https://videojs.org/about-this-player */
import { t as defaults } from "../defaults-B224JbUs.js";
import { t as ContextProvider } from "../context-provider-2u40YNUB.js";
import { r as i18nContext, t as I18nController } from "../controller-CKtzV_P4.js";
import { t as applyStyles } from "../style-DIF53bma.js";
import { t as UIElement } from "../ui-element-CAlH76yk.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext } from "../context-HXfCy4bR.js";
import { n as SliderCore, r as createSlider, t as SliderDataAttrs } from "../data-CWxWw-ho.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { r as hasTimeRange, t as getTimeRangeEnd } from "../predicate-B_kVyfOp.js";
import { l as selectPlayback, m as selectTime, n as selectBuffer, r as selectControls } from "../selectors-ChUSrGHY.js";
import { r as toPercent } from "../number-9EelIfuy.js";
import { r as getTimeSliderCSSVars } from "../css-vars-MhXnTr58.js";
import { t as applyElementProps } from "../element-props-DOAGRK9A.js";
import { t as logMissingFeature } from "../log-B_YxrXjM.js";
import { t as applyStateDataAttrs } from "../state-data-attrs-Xoxy3j7K.js";
import { n as formatTimeAsPhrase, t as formatTime } from "../format-DT-8EuSS.js";
import { a as positionText, p as unknownText } from "../time-e6HJCQ4C.js";
import { t as sliderContext } from "../context-Cs1QoWXq.js";
import { translateText } from "../i18n.dev.js";

//#region ../core/dist/dev/i18n/text/slider.js
const seekText = {
	key: `slider.seek`,
	text: "Seek"
};

//#endregion
//#region ../core/dist/dev/core/ui/time-slider/core.js
/** Time-domain slider: maps media time/buffer state to slider state. */
var TimeSliderCore = class TimeSliderCore extends SliderCore {
	static defaultProps = {
		...SliderCore.defaultProps,
		label: "",
		changeThrottle: 100,
		pauseOnDrag: false
	};
	#props = { ...TimeSliderCore.defaultProps };
	#media = null;
	#formatLocale;
	#wasPlayingBeforeDrag = false;
	constructor(props) {
		super();
		if (props) this.setProps(props);
	}
	setProps(props) {
		this.#props = defaults(props, TimeSliderCore.defaultProps);
		super.setProps({
			...props,
			min: 0
		});
	}
	setMedia(media) {
		this.#media = media;
	}
	/** @internal Platform adapters set the active i18n locale for `aria-valuetext` time formatting. */
	setFormatLocale(locale) {
		this.#formatLocale = locale;
	}
	getState() {
		const media = this.#media;
		const { currentTime, seeking, buffered } = media;
		const duration = getTimeRangeEnd(media);
		super.setProps({
			...this.#props,
			disabled: this.#props.disabled || !hasTimeRange(media),
			min: 0,
			max: duration
		});
		const base = super.getSliderState(currentTime);
		const bufferedEnd = buffered.length > 0 ? buffered[buffered.length - 1][1] : 0;
		const bufferPercent = toPercent(bufferedEnd, 0, duration);
		return {
			...base,
			currentTime,
			duration,
			seeking,
			bufferPercent
		};
	}
	getLabel(state) {
		return super.getLabel(state) || seekText;
	}
	#announceValue(state) {
		return state.dragging ? this.rawValueFromPercent(state.pointerPercent) : state.value;
	}
	#formatTimeAsPhrase(seconds) {
		return this.#formatLocale === void 0 ? formatTimeAsPhrase(seconds) : formatTimeAsPhrase(seconds, { locale: this.#formatLocale });
	}
	getValueText(state) {
		if (state.duration <= 0) return unknownText;
		return Number.isFinite(state.duration) ? positionText : this.getValueTextParams(state).current;
	}
	getValueTextParams(state) {
		const current = this.#formatTimeAsPhrase(this.#announceValue(state));
		if (!Number.isFinite(state.duration)) return { current };
		return {
			current,
			duration: this.#formatTimeAsPhrase(state.duration)
		};
	}
	/**
	* Pause playback when a drag begins if `pauseOnDrag` is enabled, remembering whether media was playing so `endDrag`
	* can resume it.
	*/
	startDrag(playback) {
		this.#wasPlayingBeforeDrag = false;
		if (this.#props.pauseOnDrag && playback && !playback.paused) {
			this.#wasPlayingBeforeDrag = true;
			playback.pause();
		}
	}
	/**
	* Resume playback if `startDrag` paused it. Resume depends only on the intent captured at drag start, so it survives
	* `pauseOnDrag` being toggled mid-drag. Safe to call on teardown — a no-op unless a drag paused playback.
	*/
	endDrag(playback) {
		if (this.#wasPlayingBeforeDrag) playback?.play().catch(() => {});
		this.#wasPlayingBeforeDrag = false;
	}
	getAttrs(state) {
		const base = super.getAttrs(state);
		const announceValue = this.#announceValue(state);
		return {
			...base,
			"aria-valuenow": announceValue,
			"aria-valuetext": this.getValueText(state)
		};
	}
};

//#endregion
//#region ../core/dist/dev/core/ui/time-slider/data.js
const TimeSliderDataAttrs = {
	...SliderDataAttrs,
	/** Present when a seek operation is in progress. */
	seeking: "data-seeking"
};

//#endregion
//#region ../html/dist/dev/ui/time-slider/element.js
/**
* @fires drag-start - Fired when a pointer drag starts.
* @fires drag-end - Fired when a pointer drag ends.
*/
var TimeSliderElement = class extends UIElement {
	constructor(..._args) {
		super(..._args);
		this.label = "";
		this.changeThrottle = TimeSliderCore.defaultProps.changeThrottle;
		this.step = TimeSliderCore.defaultProps.step;
		this.largeStep = TimeSliderCore.defaultProps.largeStep;
		this.orientation = TimeSliderCore.defaultProps.orientation;
		this.disabled = TimeSliderCore.defaultProps.disabled;
		this.thumbAlignment = TimeSliderCore.defaultProps.thumbAlignment;
		this.pauseOnDrag = TimeSliderCore.defaultProps.pauseOnDrag;
		this.#core = new TimeSliderCore();
		this.#controlsState = new PlayerController(this, playerContext, selectControls);
		this.#provider = new ContextProvider(this, { context: sliderContext });
		this.#timeState = new PlayerController(this, playerContext, selectTime);
		this.#bufferState = new PlayerController(this, playerContext, selectBuffer);
		this.#playbackState = new PlayerController(this, playerContext, selectPlayback);
		this.#i18n = new I18nController(this, i18nContext);
		this.#slider = null;
		this.#disconnect = null;
		this.#releaseControlsLock = null;
	}
	static {
		this.tagName = "media-time-slider";
	}
	static {
		this.properties = {
			label: { type: String },
			changeThrottle: {
				type: Number,
				attribute: "change-throttle"
			},
			step: { type: Number },
			largeStep: {
				type: Number,
				attribute: "large-step"
			},
			orientation: { type: String },
			disabled: { type: Boolean },
			thumbAlignment: {
				type: String,
				attribute: "thumb-alignment"
			},
			pauseOnDrag: {
				type: Boolean,
				attribute: "pause-on-drag"
			}
		};
	}
	#core;
	#controlsState;
	#provider;
	#timeState;
	#bufferState;
	#playbackState;
	#i18n;
	#slider;
	#disconnect;
	#releaseControlsLock;
	connectedCallback() {
		super.connectedCallback();
		if (this.destroyed) return;
		this.#disconnect = new AbortController();
		const signal = this.#disconnect.signal;
		this.#slider = createSlider({
			getElement: () => this,
			getThumbElement: () => this.querySelector("media-slider-thumb"),
			getOrientation: () => this.orientation,
			isDisabled: () => {
				const time = this.#timeState.value;
				const buffer = this.#bufferState.value;
				return this.disabled || !time || !hasTimeRange({
					...time,
					...buffer ?? {
						buffered: [],
						seekable: []
					}
				});
			},
			getPercent: () => {
				const media = this.#timeState.value;
				if (!media) return 0;
				return this.#core.percentFromValue(media.currentTime);
			},
			getStepPercent: () => this.#core.getStepPercent(),
			getLargeStepPercent: () => this.#core.getLargeStepPercent(),
			onValueCommit: (percent) => {
				const media = this.#timeState.value;
				if (media) media.seek(this.#core.rawValueFromPercent(percent));
			},
			changeThrottle: this.changeThrottle,
			onPressStart: () => {
				this.#releaseControlsLock ??= this.#controlsState.value?.requestControlsLock() ?? null;
			},
			onPressEnd: () => this.#releaseControlsVisibilityLock(),
			onDragStart: () => {
				this.#core.startDrag(this.#playbackState.value);
				this.dispatchEvent(new CustomEvent("drag-start", { bubbles: true }));
			},
			onDragEnd: () => {
				this.#core.endDrag(this.#playbackState.value);
				this.dispatchEvent(new CustomEvent("drag-end", { bubbles: true }));
			},
			adjustPercent: (raw, thumbSize, trackSize) => this.#core.adjustPercentForAlignment(raw, thumbSize, trackSize),
			onResize: () => this.requestUpdate()
		});
		applyElementProps(this, this.#slider.rootProps, { signal });
		applyStyles(this, this.#slider.rootStyle);
		this.#slider.input.subscribe(() => this.requestUpdate(), { signal });
		if (!this.#timeState.value) logMissingFeature(this.localName, this.#timeState.displayName);
	}
	disconnectedCallback() {
		this.#releaseControlsVisibilityLock();
		this.#resumeIfDragPaused();
		super.disconnectedCallback();
		this.#disconnect?.abort();
		this.#disconnect = null;
	}
	destroyCallback() {
		this.#releaseControlsVisibilityLock();
		this.#resumeIfDragPaused();
		this.#slider?.destroy();
		super.destroyCallback();
	}
	#resumeIfDragPaused() {
		this.#core.endDrag(this.#playbackState.value);
	}
	#releaseControlsVisibilityLock() {
		this.#releaseControlsLock?.();
		this.#releaseControlsLock = null;
	}
	willUpdate(_changed) {
		super.willUpdate(_changed);
		this.#core.setProps({
			label: this.label,
			changeThrottle: this.changeThrottle,
			step: this.step,
			largeStep: this.largeStep,
			orientation: this.orientation,
			disabled: this.disabled,
			thumbAlignment: this.thumbAlignment,
			pauseOnDrag: this.pauseOnDrag
		});
		this.#core.setFormatLocale(this.#i18n.locale);
	}
	update(_changed) {
		super.update(_changed);
		if (!this.#slider) return;
		const time = this.#timeState.value;
		const buffer = this.#bufferState.value;
		if (!time) return;
		this.#core.setInput(this.#slider.input.current);
		const media = {
			...time,
			...buffer ?? {
				buffered: [],
				seekable: []
			}
		};
		this.#core.setMedia(media);
		const state = this.#core.getState();
		const cssVars = getTimeSliderCSSVars(this.#slider.adjustForAlignment(state));
		const thumbAttrs = this.#core.getAttrs(state);
		applyStyles(this, cssVars);
		applyStateDataAttrs(this, state, TimeSliderDataAttrs);
		this.#provider.setValue({
			state,
			stateAttrMap: TimeSliderDataAttrs,
			pointerValue: this.#core.rawValueFromPercent(state.pointerPercent),
			thumbAttrs: {
				...thumbAttrs,
				"aria-label": translateText(thumbAttrs["aria-label"], this.#i18n.value),
				"aria-valuetext": translateText(thumbAttrs["aria-valuetext"], this.#i18n.value, this.#core.getValueTextParams(state))
			},
			thumbProps: this.#slider.thumbProps,
			formatValue: (value) => formatTime(value, state.duration, { locale: this.#i18n.locale })
		});
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/time-slider.js
safeDefine(TimeSliderElement);

//#endregion
//# sourceMappingURL=time-slider.dev.js.map