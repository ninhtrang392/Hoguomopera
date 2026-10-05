/*! Video.js | https://videojs.org/about-this-player */
import { t as defaults } from "../defaults-B224JbUs.js";
import { t as resolveText } from "../resolve-text-Ba3rK6xL.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext } from "../context-HXfCy4bR.js";
import { t as createState } from "../state-CieLyHri.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { h as selectVolume } from "../selectors-ChUSrGHY.js";
import { t as resolveLabel } from "../resolve-label-BwvVE_rZ.js";
import { a as unmuteText, t as muteText } from "../buttons-B8Ei5CJ5.js";
import { t as MediaButtonElement } from "../media-button-element-Q-Bjtru0.js";

//#region ../core/dist/dev/core/ui/mute-button/core.js
var MuteButtonCore = class MuteButtonCore {
	static defaultProps = {
		label: "",
		disabled: false
	};
	state = createState({
		muted: false,
		volumeLevel: "off",
		availability: "unavailable",
		hidden: true,
		label: ""
	});
	#props = { ...MuteButtonCore.defaultProps };
	#media = null;
	constructor(props) {
		if (props) this.setProps(props);
	}
	setProps(props) {
		this.#props = defaults(props, MuteButtonCore.defaultProps);
	}
	getLabel(state) {
		const label = resolveLabel(this.#props.label, state);
		if (label) return label;
		return state.muted ? unmuteText : muteText;
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
		const availability = media.mutedAvailability;
		this.state.patch({
			muted: media.muted || media.volume === 0,
			volumeLevel: getVolumeLevel(media),
			availability,
			hidden: availability !== "available"
		});
		this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
		return this.state.current;
	}
	toggle(media) {
		if (this.#props.disabled || media.mutedAvailability !== "available") return;
		media.toggleMuted();
	}
};
function getVolumeLevel(media) {
	if (media.muted || media.volume === 0) return "off";
	if (media.volume < .5) return "low";
	if (media.volume < .75) return "medium";
	return "high";
}

//#endregion
//#region ../core/dist/dev/core/ui/mute-button/data.js
const MuteButtonDataAttrs = {
	/** Present when the media is muted. */
	muted: "data-muted",
	/** Indicates the volume level. */
	volumeLevel: "data-volume-level",
	/** Indicates mute availability (`available`, `unavailable`, `unsupported`). */
	availability: "data-availability",
	/** Present when the button is hidden because the media has no mute to toggle. */
	hidden: "data-hidden"
};

//#endregion
//#region ../html/dist/dev/ui/mute-button/element.js
var MuteButtonElement = class extends MediaButtonElement {
	constructor(..._args) {
		super(..._args);
		this.core = new MuteButtonCore();
		this.stateAttrMap = MuteButtonDataAttrs;
		this.mediaState = new PlayerController(this, playerContext, selectVolume);
		this.hotkeyAction = "toggleMuted";
	}
	static {
		this.tagName = "media-mute-button";
	}
	activate(state) {
		this.core.toggle(state);
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/mute-button.js
safeDefine(MuteButtonElement);

//#endregion
//# sourceMappingURL=mute-button.dev.js.map