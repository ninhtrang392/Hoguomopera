/*! Video.js | https://videojs.org/about-this-player */
import { t as defaults } from "../defaults-B224JbUs.js";
import { t as resolveText } from "../resolve-text-Ba3rK6xL.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext } from "../context-HXfCy4bR.js";
import { t as createState } from "../state-CieLyHri.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { m as selectTime } from "../selectors-ChUSrGHY.js";
import { t as resolveLabel } from "../resolve-label-BwvVE_rZ.js";
import { t as MediaButtonElement } from "../media-button-element-Q-Bjtru0.js";

//#region ../core/dist/dev/i18n/text/seek.js
const prefix = "seek.";
const forwardText = {
	key: `${prefix}forward`,
	text: "Seek forward {seconds} seconds"
};
const backwardText = {
	key: `${prefix}backward`,
	text: "Seek backward {seconds} seconds"
};

//#endregion
//#region ../core/dist/dev/core/ui/seek-button/core.js
var SeekButtonCore = class SeekButtonCore {
	static defaultProps = {
		seconds: 30,
		label: "",
		disabled: false
	};
	state = createState({
		seeking: false,
		direction: "forward",
		label: ""
	});
	#props = { ...SeekButtonCore.defaultProps };
	#media = null;
	constructor(props) {
		if (props) this.setProps(props);
	}
	setProps(props) {
		this.#props = defaults(props, SeekButtonCore.defaultProps);
	}
	getLabel(state) {
		const custom = resolveLabel(this.#props.label, state);
		if (custom !== void 0) return custom;
		return state.direction === "backward" ? backwardText : forwardText;
	}
	getLabelParams(state) {
		if (resolveLabel(this.#props.label, state) !== void 0) return void 0;
		return { seconds: Math.abs(this.#props.seconds) };
	}
	getAttrs(state) {
		return {
			"aria-label": this.getLabel(state),
			"aria-disabled": this.#props.disabled ? "true" : void 0
		};
	}
	setMedia(media) {
		this.#media = media;
	}
	getState() {
		const media = this.#media;
		const direction = this.#props.seconds < 0 ? "backward" : "forward";
		this.state.patch({
			seeking: media.seeking,
			direction
		});
		this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
		return this.state.current;
	}
	async seek(media) {
		if (this.#props.disabled) return;
		await media.seek(media.currentTime + this.#props.seconds);
	}
};

//#endregion
//#region ../core/dist/dev/core/ui/seek-button/data.js
const SeekButtonDataAttrs = {
	/** Present when a seek is in progress. */
	seeking: "data-seeking",
	/** Indicates the seek direction: `"forward"` or `"backward"`. */
	direction: "data-direction"
};

//#endregion
//#region ../html/dist/dev/ui/seek-button/element.js
var SeekButtonElement = class extends MediaButtonElement {
	constructor(..._args) {
		super(..._args);
		this.seconds = SeekButtonCore.defaultProps.seconds;
		this.core = new SeekButtonCore();
		this.stateAttrMap = SeekButtonDataAttrs;
		this.mediaState = new PlayerController(this, playerContext, selectTime);
		this.hotkeyAction = "seekStep";
	}
	static {
		this.tagName = "media-seek-button";
	}
	static {
		this.properties = {
			...MediaButtonElement.properties,
			seconds: { type: Number }
		};
	}
	get hotkeyValue() {
		return this.seconds;
	}
	activate(state) {
		this.core.seek(state);
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/seek-button.js
safeDefine(SeekButtonElement);

//#endregion
//# sourceMappingURL=seek-button.dev.js.map