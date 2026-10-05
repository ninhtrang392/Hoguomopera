/*! Video.js | https://videojs.org/about-this-player */
import { t as ContextConsumer } from "../context-consumer-LN8LIb2c.js";
import { t as applyStyles } from "../style-DIF53bma.js";
import { i as observeResize } from "../observe-elements-CRk-iY4n.js";
import { t as UIElement } from "../ui-element-CAlH76yk.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { n as getSliderPreviewStyle } from "../css-vars-MhXnTr58.js";
import { t as applyStateDataAttrs } from "../state-data-attrs-Xoxy3j7K.js";
import { t as sliderContext } from "../context-Cs1QoWXq.js";

//#region ../html/dist/dev/ui/slider/preview.js
var SliderPreviewElement = class extends UIElement {
	constructor(..._args) {
		super(..._args);
		this.overflow = "clamp";
		this.#ctx = new ContextConsumer(this, {
			context: sliderContext,
			subscribe: true
		});
		this.#stopObservingResize = null;
		this.#width = 0;
	}
	static {
		this.tagName = "media-slider-preview";
	}
	static {
		this.properties = { overflow: { type: String } };
	}
	#ctx;
	#stopObservingResize;
	#width;
	connectedCallback() {
		super.connectedCallback();
		this.#stopObservingResize = observeResize(this, ([entry]) => {
			this.#width = entry.contentRect.width;
			this.#applyPosition();
		});
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		this.#stopObservingResize?.();
		this.#stopObservingResize = null;
	}
	#applyPosition() {
		applyStyles(this, getSliderPreviewStyle(this.#width, this.overflow));
	}
	update(_changed) {
		super.update(_changed);
		const ctx = this.#ctx.value;
		if (ctx) applyStateDataAttrs(this, ctx.state, ctx.stateAttrMap);
		this.#applyPosition();
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/slider-preview.js
safeDefine(SliderPreviewElement);

//#endregion
//# sourceMappingURL=slider-preview.dev.js.map