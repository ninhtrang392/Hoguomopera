/*! Video.js | https://videojs.org/about-this-player */
import { t as UIElement } from "../ui-element-CAlH76yk.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext } from "../context-HXfCy4bR.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { r as selectControls, s as selectMetadata } from "../selectors-ChUSrGHY.js";
import { t as logMissingFeature } from "../log-B_YxrXjM.js";
import { t as applyStateDataAttrs } from "../state-data-attrs-Xoxy3j7K.js";

//#region ../core/dist/dev/core/ui/title/core.js
var TitleCore = class {
	getState(media, controls) {
		const { title } = media;
		return {
			title,
			hidden: title.length === 0,
			visible: controls?.controlsVisible ?? false
		};
	}
};

//#endregion
//#region ../core/dist/dev/core/ui/title/data.js
const TitleDataAttrs = {
	/** Present when the element is hidden because no title is available. */
	hidden: "data-hidden",
	/** Present while the player controls are visible. */
	visible: "data-visible"
};

//#endregion
//#region ../html/dist/dev/ui/title/element.js
/**
* Displays the resolved content title.
*
* The element owns its text content. Set the title through the player's `content-title` attribute.
*/
var TitleElement = class extends UIElement {
	static {
		this.tagName = "media-title";
	}
	#core = new TitleCore();
	#metadataState = new PlayerController(this, playerContext, selectMetadata);
	#controlsState = new PlayerController(this, playerContext, selectControls);
	connectedCallback() {
		super.connectedCallback();
		if (!this.#metadataState.value) logMissingFeature(this.localName, this.#metadataState.displayName);
	}
	update(changed) {
		super.update(changed);
		const metadata = this.#metadataState.value;
		if (!metadata) return;
		const state = this.#core.getState(metadata, this.#controlsState.value);
		if (this.textContent !== state.title) this.textContent = state.title;
		this.hidden = state.hidden;
		applyStateDataAttrs(this, state, TitleDataAttrs);
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/title.js
safeDefine(TitleElement);

//#endregion
//# sourceMappingURL=title.dev.js.map