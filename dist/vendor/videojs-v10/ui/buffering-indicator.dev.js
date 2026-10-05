/*! Video.js | https://videojs.org/about-this-player */
import { t as defaults } from "../defaults-B224JbUs.js";
import { t as UIElement } from "../ui-element-CAlH76yk.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext } from "../context-HXfCy4bR.js";
import { t as createState } from "../state-CieLyHri.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { l as selectPlayback } from "../selectors-ChUSrGHY.js";
import { t as logMissingFeature } from "../log-B_YxrXjM.js";
import { t as applyStateDataAttrs } from "../state-data-attrs-Xoxy3j7K.js";

//#region ../core/dist/dev/core/ui/buffering-indicator/core.js
var BufferingIndicatorCore = class BufferingIndicatorCore {
	static defaultProps = { delay: 500 };
	state = createState({ visible: false });
	#props = { ...BufferingIndicatorCore.defaultProps };
	#timer = null;
	setProps(props) {
		this.#props = defaults(props, BufferingIndicatorCore.defaultProps);
	}
	destroy() {
		this.#clearTimer();
	}
	update(media) {
		const buffering = media.waiting && !media.paused;
		if (buffering && !this.state.current.visible && !this.#timer) this.#timer = setTimeout(() => {
			this.#timer = null;
			this.state.patch({ visible: true });
		}, this.#props.delay);
		else if (!buffering) {
			this.#clearTimer();
			this.state.patch({ visible: false });
		}
	}
	#clearTimer() {
		if (this.#timer !== null) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
	}
};

//#endregion
//#region ../core/dist/dev/core/ui/buffering-indicator/data.js
const BufferingIndicatorDataAttrs = { 
/** Present when the buffering indicator is visible (after delay). */
visible: "data-visible" };

//#endregion
//#region ../html/dist/dev/ui/buffering-indicator/element.js
var BufferingIndicatorElement = class extends UIElement {
	constructor(..._args) {
		super(..._args);
		this.delay = BufferingIndicatorCore.defaultProps.delay;
		this.#core = new BufferingIndicatorCore();
		this.#state = new PlayerController(this, playerContext, selectPlayback);
		this.#disconnect = null;
	}
	static {
		this.tagName = "media-buffering-indicator";
	}
	static {
		this.properties = { delay: { type: Number } };
	}
	#core;
	#state;
	#disconnect;
	connectedCallback() {
		super.connectedCallback();
		if (this.destroyed) return;
		this.#disconnect = new AbortController();
		this.#core.state.subscribe(() => this.requestUpdate(), { signal: this.#disconnect.signal });
		if (!this.#state.value) logMissingFeature(this.localName, this.#state.displayName);
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		this.#disconnect?.abort();
		this.#disconnect = null;
	}
	willUpdate(changed) {
		super.willUpdate(changed);
		this.#core.setProps(this);
	}
	update(changed) {
		super.update(changed);
		const media = this.#state.value;
		if (!media) return;
		this.#core.update(media);
		applyStateDataAttrs(this, this.#core.state.current, BufferingIndicatorDataAttrs);
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/buffering-indicator.js
safeDefine(BufferingIndicatorElement);

//#endregion
//# sourceMappingURL=buffering-indicator.dev.js.map