/*! Video.js | https://videojs.org/about-this-player */
import { t as defaults } from "../defaults-B224JbUs.js";
import { t as resolveText$1 } from "../resolve-text-Ba3rK6xL.js";
import { r as i18nContext, t as I18nController } from "../controller-CKtzV_P4.js";
import { n as isCaptionOrSubtitleTrack } from "../text-track-DMA7pa8W.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext } from "../context-HXfCy4bR.js";
import { t as createState } from "../state-CieLyHri.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { p as selectTextTrack } from "../selectors-ChUSrGHY.js";
import { t as logMissingFeature } from "../log-B_YxrXjM.js";
import { t as applyStateDataAttrs } from "../state-data-attrs-Xoxy3j7K.js";
import { t as resolveLabel } from "../resolve-label-BwvVE_rZ.js";
import { a as captionsText, l as subtitlesText, o as offText, t as RadioOptionsController } from "../controller-B0ixneRt.js";
import { t as MenuRadioGroupElement } from "../radio-group-BVp3iPOc.js";
import { translateText } from "../i18n.dev.js";

//#region ../core/dist/dev/core/ui/captions-radio-group/core.js
function formatTrackLabel(track) {
	if (track.label) return track.label;
	if (track.language) return track.language;
	return track.kind === "captions" ? captionsText : subtitlesText;
}
function sortCaptionTracks(a, b) {
	return a.kind > b.kind ? 1 : a.kind < b.kind ? -1 : 0;
}
function getCaptionTracks(textTrackList) {
	return textTrackList.filter(isCaptionOrSubtitleTrack).sort(sortCaptionTracks);
}
var CaptionsRadioGroupCore = class CaptionsRadioGroupCore {
	static defaultProps = {
		label: "",
		formatTrack: formatTrackLabel,
		disabled: false
	};
	state = createState({
		options: [{
			value: "off",
			label: offText,
			disabled: false
		}],
		value: "off",
		subtitlesShowing: false,
		disabled: true,
		hidden: true,
		availability: "unavailable",
		label: ""
	});
	#props = { ...CaptionsRadioGroupCore.defaultProps };
	#media = null;
	constructor(props) {
		if (props) this.setProps(props);
	}
	setProps(props) {
		this.#props = defaults(props, CaptionsRadioGroupCore.defaultProps);
	}
	getLabel(state) {
		const label = resolveLabel(this.#props.label, state);
		if (label) return label;
		return captionsText;
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
		const captionTracks = getCaptionTracks(media.textTrackList);
		const showingIndex = captionTracks.findIndex((track) => track.mode === "showing");
		const options = [{
			value: "off",
			label: offText,
			disabled: false
		}, ...captionTracks.map((track, index) => ({
			value: track.id || String(index),
			label: this.getTrackLabel(track),
			disabled: false
		}))];
		const availability = captionTracks.length > 0 ? "available" : "unavailable";
		this.state.patch({
			options,
			value: showingIndex === -1 ? "off" : captionTracks[showingIndex].id || String(showingIndex),
			subtitlesShowing: media.subtitlesShowing,
			disabled: this.#props.disabled || captionTracks.length === 0,
			hidden: availability === "unavailable",
			availability
		});
		this.state.patch({ label: resolveText$1(this.getLabel(this.state.current)) });
		return this.state.current;
	}
	select(media, value) {
		if (this.#props.disabled) return;
		const captionTracks = getCaptionTracks(media.textTrackList);
		if (!captionTracks.length) return;
		if (value === "off") {
			media.selectSubtitlesTrack("off");
			return;
		}
		if (!captionTracks.some((track, index) => (track.id || String(index)) === value)) return;
		media.selectSubtitlesTrack(value);
	}
	selectValue(media, value) {
		this.select(media, value);
	}
};

//#endregion
//#region ../core/dist/dev/core/ui/captions-radio-group/data.js
const CaptionsRadioGroupDataAttrs = {
	/** Present when captions are enabled. */
	subtitlesShowing: "data-active",
	/** Present when track selection is disabled. */
	disabled: "data-disabled",
	/** Present when track selection is unavailable. */
	hidden: "data-hidden",
	/** Indicates captions availability (`available` or `unavailable`). */
	availability: "data-availability"
};

//#endregion
//#region ../html/dist/dev/ui/captions-radio-group/element.js
/**
* Menu radio group that generates an Off `<media-menu-radio-item>` plus one per captions and subtitles track, and
* shares the selected label and availability with an enclosing menu. An optional `<template>` holding one
* `<media-menu-radio-item>` customizes each generated item.
*/
var CaptionsRadioGroupElement = class extends MenuRadioGroupElement {
	constructor(..._args) {
		super(..._args);
		this.disabled = false;
		this.label = "";
		this.formatTrack = CaptionsRadioGroupCore.defaultProps.formatTrack;
		this.#core = new CaptionsRadioGroupCore();
		this.#i18n = new I18nController(this, i18nContext);
		this.#mediaState = new PlayerController(this, playerContext, selectTextTrack);
		this.#options = new RadioOptionsController(this, {
			setItemAttributes: (item, option) => item.setAttribute("data-track", option.value),
			onValueChange: (value) => {
				const media = this.#mediaState.value;
				if (media) this.#core.selectValue(media, value);
			}
		});
	}
	static {
		this.tagName = "media-captions-radio-group";
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
		if (state) applyStateDataAttrs(this, state, CaptionsRadioGroupDataAttrs);
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/captions-radio-group.js
safeDefine(CaptionsRadioGroupElement);

//#endregion
//# sourceMappingURL=captions-radio-group.dev.js.map