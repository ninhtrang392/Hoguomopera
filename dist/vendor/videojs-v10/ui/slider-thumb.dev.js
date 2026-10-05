/*! Video.js | https://videojs.org/about-this-player */
import { t as ContextConsumer } from "../context-consumer-LN8LIb2c.js";
import { t as UIElement } from "../ui-element-CAlH76yk.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { t as applyElementProps } from "../element-props-DOAGRK9A.js";
import { t as applyStateDataAttrs } from "../state-data-attrs-Xoxy3j7K.js";
import { t as sliderContext } from "../context-Cs1QoWXq.js";

//#region ../html/dist/dev/ui/slider/thumb.js
var SliderThumbElement = class extends UIElement {
	static {
		this.tagName = "media-slider-thumb";
	}
	#ctx = new ContextConsumer(this, {
		context: sliderContext,
		subscribe: true
	});
	#disconnect = null;
	#thumbPropsApplied = false;
	connectedCallback() {
		super.connectedCallback();
		this.#disconnect = new AbortController();
		this.#thumbPropsApplied = false;
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		this.#disconnect?.abort();
		this.#disconnect = null;
		this.#thumbPropsApplied = false;
	}
	update(_changed) {
		super.update(_changed);
		const ctx = this.#ctx.value;
		if (!ctx) return;
		if (!this.#thumbPropsApplied && this.#disconnect) {
			applyElementProps(this, ctx.thumbProps, { signal: this.#disconnect.signal });
			this.#thumbPropsApplied = true;
		}
		applyElementProps(this, ctx.thumbAttrs);
		applyStateDataAttrs(this, ctx.state, ctx.stateAttrMap);
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/slider-thumb.js
safeDefine(SliderThumbElement);

//#endregion
//# sourceMappingURL=slider-thumb.dev.js.map