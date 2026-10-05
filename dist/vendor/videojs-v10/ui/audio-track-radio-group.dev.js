/*! Video.js | https://videojs.org/about-this-player */
import { t as defaults } from "../defaults-B224JbUs.js";
import { t as resolveText$1 } from "../resolve-text-Ba3rK6xL.js";
import { r as i18nContext, t as I18nController } from "../controller-CKtzV_P4.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext } from "../context-HXfCy4bR.js";
import { t as createState } from "../state-CieLyHri.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { t as selectAudioTrack } from "../selectors-ChUSrGHY.js";
import { t as logMissingFeature } from "../log-B_YxrXjM.js";
import { t as applyStateDataAttrs } from "../state-data-attrs-Xoxy3j7K.js";
import { t as resolveLabel } from "../resolve-label-BwvVE_rZ.js";
import { n as audioText, t as RadioOptionsController } from "../controller-B0ixneRt.js";
import { t as MenuRadioGroupElement } from "../radio-group-BVp3iPOc.js";
import { translateText } from "../i18n.dev.js";

//#region ../core/dist/dev/core/ui/audio-track-radio-group/core.js
function formatTrackLabel(track) {
	if (track.label) return track.label;
	if (track.language) return track.language;
	if (track.kind) return track.kind;
	return audioText;
}
function getTrackValue(track, index) {
	return track.id || String(index);
}
var AudioTrackRadioGroupCore = class AudioTrackRadioGroupCore {
	static defaultProps = {
		label: "",
		formatTrack: formatTrackLabel,
		disabled: false
	};
	state = createState({
		options: [],
		value: "",
		disabled: true,
		hidden: true,
		availability: "unavailable",
		label: ""
	});
	#props = { ...AudioTrackRadioGroupCore.defaultProps };
	#media = null;
	constructor(props) {
		if (props) this.setProps(props);
	}
	setProps(props) {
		this.#props = defaults(props, AudioTrackRadioGroupCore.defaultProps);
	}
	getLabel(state) {
		const label = resolveLabel(this.#props.label, state);
		if (label) return label;
		return audioText;
	}
	getTrackLabel(track) {
		return this.#props.formatTrack(track);
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
		const enabledIndex = media.audioTrackList.findIndex((track) => track.enabled);
		const options = media.audioTrackList.map((track, index) => ({
			value: getTrackValue(track, index),
			label: this.getTrackLabel(track),
			disabled: false
		}));
		const availability = options.length > 1 ? "available" : "unavailable";
		this.state.patch({
			options,
			value: enabledIndex === -1 ? "" : getTrackValue(media.audioTrackList[enabledIndex], enabledIndex),
			disabled: this.#props.disabled || availability === "unavailable",
			hidden: availability === "unavailable",
			availability
		});
		this.state.patch({ label: resolveText$1(this.getLabel(this.state.current)) });
		return this.state.current;
	}
	select(media, value) {
		if (this.#props.disabled) return;
		if (!media.audioTrackList.some((track, index) => getTrackValue(track, index) === value)) return;
		media.selectAudioTrack(value);
	}
	selectValue(media, value) {
		this.select(media, value);
	}
};

//#endregion
//#region ../core/dist/dev/core/ui/audio-track-radio-group/data.js
const AudioTrackRadioGroupDataAttrs = {
	/** Current audio track value. */
	value: "data-audio-track",
	/** Present when audio track selection is disabled. */
	disabled: "data-disabled",
	/** Present when audio track selection is unavailable. */
	hidden: "data-hidden",
	/** Indicates audio track availability (`available` or `unavailable`). */
	availability: "data-availability"
};

//#endregion
//#region ../html/dist/dev/ui/audio-track-radio-group/element.js
/**
* Menu radio group that generates a `<media-menu-radio-item>` per available audio track and shares the selected label
* and availability with an enclosing menu. An optional `<template>` holding one `<media-menu-radio-item>` customizes
* each generated item.
*/
var AudioTrackRadioGroupElement = class extends MenuRadioGroupElement {
	constructor(..._args) {
		super(..._args);
		this.disabled = false;
		this.label = "";
		this.formatTrack = AudioTrackRadioGroupCore.defaultProps.formatTrack;
		this.#core = new AudioTrackRadioGroupCore();
		this.#i18n = new I18nController(this, i18nContext);
		this.#mediaState = new PlayerController(this, playerContext, selectAudioTrack);
		this.#options = new RadioOptionsController(this, {
			setItemAttributes: (item, option) => item.setAttribute("data-track", option.value),
			onValueChange: (value) => {
				const media = this.#mediaState.value;
				if (media) this.#core.selectValue(media, value);
			}
		});
	}
	static {
		this.tagName = "media-audio-track-radio-group";
	}
	static {
		this.properties = {
			...MenuRadioGroupElement.properties,
			disabled: { type: Boolean },
			label: { type: String }
		};
	}
	#core;
	#i18n;
	#mediaState;
	#options;
	connectedCallback() {
		super.connectedCallback();
		if (this.destroyed) return;
		if (!this.#mediaState.value && this.#mediaState.displayName) logMissingFeature(this.localName, this.#mediaState.displayName);
	}
	update(changed) {
		const media = this.#mediaState.value;
		let state = null;
		if (media) {
			this.#core.setProps({
				formatTrack: this.formatTrack,
				disabled: this.disabled,
				label: this.label
			});
			this.#core.setMedia(media);
			state = this.#core.getState();
			this.applyDefaultAriaLabel(translateText(this.#core.getLabel(state), this.#i18n.value));
			this.#options.sync(state, this.#i18n.value, this.#i18n.locale);
			this.publishMenuOptionState(state.disabled, state.hidden, state.availability);
		} else this.publishMenuOptionState(true, true, "unsupported");
		super.update(changed);
		if (state) applyStateDataAttrs(this, state, AudioTrackRadioGroupDataAttrs);
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/audio-track-radio-group.js
safeDefine(AudioTrackRadioGroupElement);

//#endregion
//# sourceMappingURL=audio-track-radio-group.dev.js.map