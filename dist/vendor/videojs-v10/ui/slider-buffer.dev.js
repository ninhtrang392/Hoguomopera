/*! Video.js | https://videojs.org/about-this-player */
import { t as ContextConsumer } from "../context-consumer-LN8LIb2c.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { t as ContextPartElement } from "../context-part-element-CDW9coJu.js";
import { t as sliderContext } from "../context-Cs1QoWXq.js";

//#region ../html/dist/dev/ui/slider/buffer.js
var SliderBufferElement = class extends ContextPartElement {
	constructor(..._args) {
		super(..._args);
		this.consumer = new ContextConsumer(this, {
			context: sliderContext,
			subscribe: true
		});
	}
	static {
		this.tagName = "media-slider-buffer";
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/slider-buffer.js
safeDefine(SliderBufferElement);

//#endregion
//# sourceMappingURL=slider-buffer.dev.js.map