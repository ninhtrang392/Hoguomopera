/*! Video.js | https://videojs.org/about-this-player */
import { t as defaults } from "../defaults-B224JbUs.js";
import { t as resolveText } from "../resolve-text-Ba3rK6xL.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext } from "../context-HXfCy4bR.js";
import { t as createState } from "../state-CieLyHri.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { c as selectPiP } from "../selectors-ChUSrGHY.js";
import { t as resolveLabel } from "../resolve-label-BwvVE_rZ.js";
import { t as MediaButtonElement } from "../media-button-element-Q-Bjtru0.js";

//#region ../core/dist/dev/i18n/text/pip.js
const prefix = "pip.";
const enterText = {
	key: `${prefix}enter`,
	text: "Enter picture-in-picture"
};
const exitText = {
	key: `${prefix}exit`,
	text: "Exit picture-in-picture"
};

//#endregion
//#region ../core/dist/dev/core/ui/pip-button/core.js
var PiPButtonCore = class PiPButtonCore {
	static defaultProps = {
		label: "",
		disabled: false
	};
	state = createState({
		pip: false,
		availability: "unavailable",
		disabled: true,
		hidden: true,
		label: ""
	});
	#props = { ...PiPButtonCore.defaultProps };
	#media = null;
	constructor(props) {
		if (props) this.setProps(props);
	}
	setProps(props) {
		this.#props = defaults(props, PiPButtonCore.defaultProps);
	}
	getLabel(state) {
		const label = resolveLabel(this.#props.label, state);
		if (label) return label;
		return state.pip ? exitText : enterText;
	}
	getAttrs(state) {
		return {
			"aria-label": this.getLabel(state),
			"aria-disabled": state.disabled ? "true" : void 0,
			hidden: state.hidden ? "" : void 0
		};
	}
	setMedia(media) {
		this.#media = media;
	}
	getState() {
		const media = this.#media;
		const availability = media.pipAvailability;
		const actionable = media.pip || availability === "available";
		this.state.patch({
			pip: media.pip,
			availability,
			disabled: this.#props.disabled || !actionable,
			hidden: !actionable
		});
		this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
		return this.state.current;
	}
	async toggle(media) {
		this.setMedia(media);
		if (this.getState().disabled) return;
		return media.pip ? media.exitPictureInPicture() : media.requestPictureInPicture();
	}
};

//#endregion
//#region ../core/dist/dev/core/ui/pip-button/data.js
const PiPButtonDataAttrs = {
	/** Present when picture-in-picture mode is active. */
	pip: "data-pip",
	/** Indicates picture-in-picture availability (`available`, `unavailable`, `unsupported`). */
	availability: "data-availability",
	/** Present when the button is non-interactive (mirrors `aria-disabled`). */
	disabled: "data-disabled",
	/** Present when the button is hidden because picture-in-picture is not available. */
	hidden: "data-hidden"
};

//#endregion
//#region ../html/dist/dev/ui/pip-button/element.js
var PiPButtonElement = class extends MediaButtonElement {
	constructor(..._args) {
		super(..._args);
		this.core = new PiPButtonCore();
		this.stateAttrMap = PiPButtonDataAttrs;
		this.mediaState = new PlayerController(this, playerContext, selectPiP);
		this.hotkeyAction = "togglePictureInPicture";
	}
	static {
		this.tagName = "media-pip-button";
	}
	activate(state) {
		return this.core.toggle(state);
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/pip-button.js
safeDefine(PiPButtonElement);

//#endregion
//# sourceMappingURL=pip-button.dev.js.map