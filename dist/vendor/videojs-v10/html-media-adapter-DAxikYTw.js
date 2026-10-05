import { n as EMPTY_TEXT_TRACKS, r as EMPTY_TIME_RANGES, t as EMPTY_REMOTE } from "./constants-CsSwyIX6.js";
import { n as MediaStreamTypes } from "./types-mVdBnzS4.js";

//#region ../media/dist/dev/dom/utils/media-extensions.js
const componentRegistry = /* @__PURE__ */ new WeakMap();
function getMediaExtensions(adapter) {
	let map = componentRegistry.get(adapter);
	if (!map) componentRegistry.set(adapter, map = /* @__PURE__ */ new Map());
	return map;
}
function addMediaExtension(adapter, component) {
	const components = getMediaExtensions(adapter);
	const ctor = component.constructor;
	const previous = components.get(ctor);
	if (previous && previous !== component) previous.detach?.();
	components.set(ctor, component);
	component.setAdapter?.(adapter);
	if (adapter.target) component.attach?.(adapter.target);
	return () => {
		if (components.get(ctor) === component) {
			component.detach?.();
			components.delete(ctor);
		}
	};
}
function getMediaProp(adapter, prop) {
	return getMediaOwner(adapter, prop)?.[prop];
}
function setMediaProp(adapter, prop, value) {
	const own = getMediaOwner(adapter, prop);
	if (own) own[prop] = value;
}
/**
* Find the object that owns a media property: the first component `override` exposing it, otherwise the attached
* target.
*/
function getMediaOwner(adapter, prop) {
	for (const component of getMediaExtensions(adapter).values()) {
		const override = component.targetOverride;
		if (override?.[prop] !== void 0) return override;
	}
	return adapter.target;
}

//#endregion
//#region ../media/dist/dev/dom/html-media-adapter/html-media-adapter.js
var HTMLMediaAdapter = class extends EventTarget {
	#target = null;
	#eventTypes = /* @__PURE__ */ new Set();
	#streamType = MediaStreamTypes.UNKNOWN;
	get target() {
		return this.#target;
	}
	attach(target) {
		if (!target || this.#target === target) return;
		this.#target = target;
		for (const type of this.#eventTypes) target.addEventListener(type, this.#forwardEvent);
		for (const component of getMediaExtensions(this).values()) component.attach?.(target);
	}
	detach() {
		if (!this.#target) return;
		for (const component of getMediaExtensions(this).values()) component.detach?.();
		for (const type of this.#eventTypes) this.#target.removeEventListener(type, this.#forwardEvent);
		this.#target = null;
	}
	destroy() {
		this.detach();
		this.#eventTypes.clear();
		getMediaExtensions(this).clear();
	}
	querySelectorAll(selectors) {
		return this.target?.querySelectorAll(selectors) ?? [];
	}
	querySelector(selectors) {
		return this.target?.querySelector(selectors) ?? null;
	}
	addEventListener(type, listener, options) {
		if (!this.#eventTypes.has(type)) {
			this.#eventTypes.add(type);
			this.target?.addEventListener(type, this.#forwardEvent);
		}
		super.addEventListener(type, listener, options);
	}
	removeEventListener(type, listener, options) {
		super.removeEventListener(type, listener, options);
	}
	#forwardEvent = (event) => {
		this.dispatchEvent(new event.constructor(event.type, event));
	};
	/**
	* Current stream type (`'on-demand'`, `'live'`, or `'unknown'`). Defaults to `'unknown'`; detecting hosts update it
	* automatically, and consumers can set it to override detection.
	*/
	get streamType() {
		return getMediaProp(this, "streamType") ?? this.#streamType;
	}
	set streamType(value) {
		if (this.streamType === value) return;
		this.#streamType = value;
		setMediaProp(this, "streamType", value);
		this.dispatchEvent(new Event("streamtypechange"));
	}
	get liveEdgeStart() {
		return getMediaProp(this, "liveEdgeStart") ?? NaN;
	}
	get targetLiveWindow() {
		return getMediaProp(this, "targetLiveWindow") ?? NaN;
	}
	get contentData() {
		return getMediaProp(this, "contentData");
	}
	get title() {
		return getMediaProp(this, "title") ?? "";
	}
	set title(value) {
		setMediaProp(this, "title", value);
	}
	get controls() {
		return getMediaProp(this, "controls") ?? false;
	}
	set controls(value) {
		setMediaProp(this, "controls", value);
	}
	get paused() {
		return getMediaProp(this, "paused") ?? true;
	}
	get ended() {
		return getMediaProp(this, "ended") ?? false;
	}
	get loop() {
		return getMediaProp(this, "loop") ?? false;
	}
	set loop(value) {
		setMediaProp(this, "loop", value);
	}
	play() {
		return getMediaOwner(this, "play")?.play?.() ?? Promise.reject(new DOMException("No media is attached.", "NotSupportedError"));
	}
	pause() {
		getMediaOwner(this, "pause")?.pause?.();
	}
	get autoplay() {
		return getMediaProp(this, "autoplay") ?? false;
	}
	set autoplay(value) {
		setMediaProp(this, "autoplay", value);
	}
	get currentTime() {
		return getMediaProp(this, "currentTime") ?? 0;
	}
	set currentTime(value) {
		setMediaProp(this, "currentTime", value);
	}
	get duration() {
		return getMediaProp(this, "duration") ?? NaN;
	}
	get seeking() {
		return getMediaProp(this, "seeking") ?? false;
	}
	get src() {
		return getMediaProp(this, "src") ?? "";
	}
	set src(value) {
		setMediaProp(this, "src", value);
	}
	get currentSrc() {
		return getMediaProp(this, "currentSrc") ?? "";
	}
	get readyState() {
		return getMediaProp(this, "readyState") ?? 0;
	}
	get preload() {
		return getMediaProp(this, "preload") ?? "metadata";
	}
	set preload(value) {
		setMediaProp(this, "preload", value);
	}
	get crossOrigin() {
		return getMediaProp(this, "crossOrigin") ?? null;
	}
	set crossOrigin(value) {
		setMediaProp(this, "crossOrigin", value);
	}
	load() {
		return getMediaOwner(this, "load")?.load?.();
	}
	canPlayType(type) {
		return getMediaOwner(this, "canPlayType")?.canPlayType?.(type) ?? "";
	}
	get volume() {
		return getMediaProp(this, "volume") ?? 1;
	}
	set volume(value) {
		setMediaProp(this, "volume", value);
	}
	get muted() {
		return getMediaProp(this, "muted") ?? false;
	}
	set muted(value) {
		setMediaProp(this, "muted", value);
	}
	get defaultMuted() {
		return getMediaProp(this, "defaultMuted") ?? false;
	}
	set defaultMuted(value) {
		setMediaProp(this, "defaultMuted", value);
	}
	get playbackRate() {
		return getMediaProp(this, "playbackRate") ?? 1;
	}
	set playbackRate(value) {
		setMediaProp(this, "playbackRate", value);
	}
	get defaultPlaybackRate() {
		return getMediaProp(this, "defaultPlaybackRate") ?? 1;
	}
	set defaultPlaybackRate(value) {
		setMediaProp(this, "defaultPlaybackRate", value);
	}
	get buffered() {
		return getMediaProp(this, "buffered") ?? EMPTY_TIME_RANGES;
	}
	get seekable() {
		return getMediaProp(this, "seekable") ?? EMPTY_TIME_RANGES;
	}
	get played() {
		return getMediaProp(this, "played") ?? EMPTY_TIME_RANGES;
	}
	get error() {
		return getMediaProp(this, "error") ?? null;
	}
	get textTracks() {
		return getMediaProp(this, "textTracks") ?? EMPTY_TEXT_TRACKS;
	}
	addTextTrack(kind, label, language) {
		return getMediaOwner(this, "addTextTrack")?.addTextTrack?.(kind, label, language);
	}
	get remote() {
		return getMediaProp(this, "remote") ?? EMPTY_REMOTE;
	}
	get disableRemotePlayback() {
		return getMediaProp(this, "disableRemotePlayback") ?? false;
	}
	set disableRemotePlayback(value) {
		setMediaProp(this, "disableRemotePlayback", value);
	}
};

//#endregion
export { setMediaProp as i, addMediaExtension as n, getMediaProp as r, HTMLMediaAdapter as t };
//# sourceMappingURL=html-media-adapter-DAxikYTw.js.map