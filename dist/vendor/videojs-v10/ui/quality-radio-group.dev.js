/*! Video.js | https://videojs.org/about-this-player */
import { t as defaults } from "../defaults-B224JbUs.js";
import { t as resolveText$1 } from "../resolve-text-Ba3rK6xL.js";
import { r as i18nContext, t as I18nController } from "../controller-CKtzV_P4.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext } from "../context-HXfCy4bR.js";
import { t as createState } from "../state-CieLyHri.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { d as selectQuality } from "../selectors-ChUSrGHY.js";
import { t as logMissingFeature } from "../log-B_YxrXjM.js";
import { t as applyStateDataAttrs } from "../state-data-attrs-Xoxy3j7K.js";
import { t as resolveLabel } from "../resolve-label-BwvVE_rZ.js";
import { c as qualityText, i as autoWithLabelText, r as autoText, t as RadioOptionsController } from "../controller-B0ixneRt.js";
import { t as MenuRadioGroupElement } from "../radio-group-BVp3iPOc.js";
import { translateText } from "../i18n.dev.js";

//#region ../core/dist/dev/core/ui/quality-radio-group/core.js
const QUALITY_AUTO_VALUE = "auto";
const STANDARD_RENDITION_SIZES = [
	4320,
	2160,
	1440,
	1080,
	720,
	480,
	360,
	240
];
function formatBitrate(bitrate) {
	return bitrate >= 1e6 ? `${Math.round(bitrate / 1e5) / 10} Mbps` : `${Math.round(bitrate / 1e3)} kbps`;
}
function getWidescreenSize(width) {
	const size = Math.round(width * 9 / 16);
	return STANDARD_RENDITION_SIZES.includes(size) ? size : void 0;
}
function getRenditionSize(rendition) {
	const { width, height } = rendition;
	if (width && height) {
		if (width > height && width * 9 > height * 16) return getWidescreenSize(width) ?? height;
		return Math.min(width, height);
	}
	if (height) return height;
	if (width) return getWidescreenSize(width) ?? width;
}
function hasSameSize(rendition, renditions) {
	const size = getRenditionSize(rendition);
	return Boolean(size && renditions.some((other) => other !== rendition && getRenditionSize(other) === size));
}
function formatRenditionLabel(rendition) {
	const size = getRenditionSize(rendition);
	if (size) return `${size}p`;
	if (rendition.bitrate) return formatBitrate(rendition.bitrate);
	return qualityText;
}
function formatRenditionBadge(rendition, renditions = []) {
	if (!getRenditionSize(rendition) || !rendition.bitrate || !hasSameSize(rendition, renditions)) return void 0;
	return formatBitrate(rendition.bitrate);
}
function formatRenditionTier(rendition) {
	const size = getRenditionSize(rendition);
	if (!size) return void 0;
	if (size >= 4320) return "8K";
	if (size >= 2160) return "4K";
	if (size >= 1080) return "HD";
}
function getRenditionValue(rendition, index) {
	return rendition.id || String(index);
}
function isSameRendition(a, b) {
	if (a.id !== void 0 || b.id !== void 0) return a.id === b.id;
	return a.width === b.width && a.height === b.height && a.bitrate === b.bitrate && a.frameRate === b.frameRate && a.codec === b.codec;
}
var QualityRadioGroupCore = class QualityRadioGroupCore {
	static defaultProps = {
		label: "",
		formatRendition: formatRenditionLabel,
		disabled: false
	};
	state = createState({
		options: [{
			value: QUALITY_AUTO_VALUE,
			label: autoText,
			disabled: false
		}],
		value: QUALITY_AUTO_VALUE,
		disabled: true,
		hidden: true,
		availability: "unavailable",
		label: ""
	});
	#props = { ...QualityRadioGroupCore.defaultProps };
	#media = null;
	constructor(props) {
		if (props) this.setProps(props);
	}
	setProps(props) {
		this.#props = defaults(props, QualityRadioGroupCore.defaultProps);
	}
	getLabel(state) {
		const label = resolveLabel(this.#props.label, state);
		if (label) return label;
		return qualityText;
	}
	getRenditionLabel(rendition) {
		if (this.#props.formatRendition !== QualityRadioGroupCore.defaultProps.formatRendition) return this.#props.formatRendition(rendition);
		return formatRenditionLabel(rendition);
	}
	getRenditionBadge(rendition, renditions = []) {
		if (this.#props.formatRendition !== QualityRadioGroupCore.defaultProps.formatRendition) return void 0;
		return formatRenditionBadge(rendition, renditions);
	}
	getRenditionTier(rendition) {
		if (this.#props.formatRendition !== QualityRadioGroupCore.defaultProps.formatRendition) return void 0;
		return formatRenditionTier(rendition);
	}
	getRenditionValue(rendition, index) {
		return getRenditionValue(rendition, index);
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
		const selectedIndex = media.videoRenditionList.findIndex((rendition) => rendition.selected);
		const availability = media.videoRenditionList.length > 1 ? "available" : "unavailable";
		const toOption = (rendition, index) => {
			const tier = this.getRenditionTier(rendition);
			const badge = this.getRenditionBadge(rendition, media.videoRenditionList);
			return {
				value: this.getRenditionValue(rendition, index),
				label: this.getRenditionLabel(rendition),
				disabled: false,
				...tier && { tier },
				...badge && { badge }
			};
		};
		const activeIndex = media.activeVideoRendition === null ? -1 : media.videoRenditionList.findIndex((rendition) => isSameRendition(rendition, media.activeVideoRendition));
		const active = media.activeVideoRendition && activeIndex !== -1 ? toOption(media.activeVideoRendition, activeIndex) : void 0;
		const autoOption = {
			value: QUALITY_AUTO_VALUE,
			label: selectedIndex === -1 && active ? autoWithLabelText : autoText,
			disabled: false,
			...selectedIndex === -1 && active && { labelParams: { label: resolveText$1(active.label) } }
		};
		this.state.patch({
			options: [autoOption, ...media.videoRenditionList.map(toOption)],
			value: selectedIndex === -1 ? QUALITY_AUTO_VALUE : this.getRenditionValue(media.videoRenditionList[selectedIndex], selectedIndex),
			disabled: this.#props.disabled || availability === "unavailable",
			hidden: availability === "unavailable",
			availability
		});
		this.state.patch({ label: resolveText$1(this.getLabel(this.state.current)) });
		return this.state.current;
	}
	select(media, value) {
		if (this.#props.disabled) return;
		if (value === "auto") {
			media.selectVideoRendition(value);
			return;
		}
		if (!media.videoRenditionList.some((rendition, index) => this.getRenditionValue(rendition, index) === value)) return;
		media.selectVideoRendition(value);
	}
	selectValue(media, value) {
		this.select(media, value);
	}
};

//#endregion
//#region ../core/dist/dev/core/ui/quality-radio-group/data.js
const QualityRadioGroupDataAttrs = {
	/** Current quality value. */
	value: "data-quality",
	/** Present when quality selection is disabled. */
	disabled: "data-disabled",
	/** Present when quality selection is unavailable. */
	hidden: "data-hidden",
	/** Indicates quality availability (`available` or `unavailable`). */
	availability: "data-availability"
};

//#endregion
//#region ../html/dist/dev/ui/quality-radio-group/element.js
/**
* Menu radio group that generates an Auto `<media-menu-radio-item>` plus one per video rendition, and shares the
* selected label and availability with an enclosing menu. An optional `<template>` holding one
* `<media-menu-radio-item>` customizes each generated item; its `data-part` `label`, `tier`, and `badge` descendants
* receive the rendition's text.
*/
var QualityRadioGroupElement = class extends MenuRadioGroupElement {
	constructor(..._args) {
		super(..._args);
		this.disabled = false;
		this.label = "";
		this.formatRendition = QualityRadioGroupCore.defaultProps.formatRendition;
		this.#core = new QualityRadioGroupCore();
		this.#i18n = new I18nController(this, i18nContext);
		this.#mediaState = new PlayerController(this, playerContext, selectQuality);
		this.#options = new RadioOptionsController(this, {
			renderItem: (item, label, option) => this.#setContent(item, label, option.tier, option.badge),
			setItemAttributes: (item, option) => item.setAttribute("data-rendition", option.value),
			getOptionCacheKey: (option) => `${option.tier ?? ""}:${option.badge ?? ""}`,
			onValueChange: (value) => {
				const media = this.#mediaState.value;
				if (media) this.#core.selectValue(media, value);
			}
		});
	}
	static {
		this.tagName = "media-quality-radio-group";
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
				formatRendition: this.formatRendition,
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
		if (state) applyStateDataAttrs(this, state, QualityRadioGroupDataAttrs);
	}
	#setContent(item, label, tier, badge) {
		const labelPart = item.querySelector("[data-part~=\"label\"]");
		const tierPart = item.querySelector("[data-part~=\"tier\"]");
		const badgePart = item.querySelector("[data-part~=\"badge\"]");
		if (labelPart) labelPart.textContent = label;
		if (tierPart) {
			tierPart.textContent = tier ?? "";
			tierPart.hidden = !tier;
		}
		if (badgePart) {
			badgePart.textContent = badge ?? "";
			badgePart.hidden = !badge;
		}
		if (!labelPart && !tierPart && !badgePart) item.textContent = [
			label,
			tier,
			badge
		].filter(Boolean).join(" ");
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/quality-radio-group.js
safeDefine(QualityRadioGroupElement);

//#endregion
//# sourceMappingURL=quality-radio-group.dev.js.map