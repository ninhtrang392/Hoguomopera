import { t as ContextConsumer } from "./context-consumer-LN8LIb2c.js";
import { t as UIElement } from "./ui-element-CAlH76yk.js";
import { n as mediaContext } from "./context-HXfCy4bR.js";
import { n as addMediaExtension, t as HTMLMediaAdapter } from "./html-media-adapter-DAxikYTw.js";

//#region ../html/dist/dev/extensions/media-extension-element.js
/** Resolve the media adapter from a context media value (a media custom element or the adapter itself). */
function resolveMediaAdapter(media) {
	if (media instanceof HTMLMediaAdapter) return media;
	const adapter = media?.adapter;
	return adapter instanceof HTMLMediaAdapter ? adapter : null;
}
/**
* Abstract base for extension elements that register a media extension (e.g. Mux Data, Google Cast) with the media
* provided by the surrounding player.
*
* Place inside a player, as a sibling of the media element. The component is registered when a media adapter becomes
* available, follows the media when it changes, is removed when this element disconnects, and is destroyed with this
* element.
*/
var MediaExtensionElement = class extends UIElement {
	#component = null;
	#adapter = null;
	#removeComponent = null;
	/** The media extension instance registered with the media adapter. */
	get component() {
		return this.#component ??= this.createComponent();
	}
	constructor() {
		super();
		new ContextConsumer(this, {
			context: mediaContext,
			subscribe: true,
			callback: (value) => this.#setAdapter(resolveMediaAdapter(value.media))
		});
	}
	disconnectedCallback() {
		this.#setAdapter(null);
		super.disconnectedCallback();
	}
	destroyCallback() {
		this.#setAdapter(null);
		this.#component?.destroy?.();
		super.destroyCallback();
	}
	#setAdapter(adapter) {
		if (this.#adapter === adapter) return;
		this.#removeComponent?.();
		this.#removeComponent = null;
		this.#adapter = adapter;
		if (adapter) this.#removeComponent = addMediaExtension(adapter, this.component);
	}
};

//#endregion
export { MediaExtensionElement as t };
//# sourceMappingURL=media-extension-element-DxJp80Ww.js.map