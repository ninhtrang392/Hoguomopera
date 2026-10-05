import { h as getGestureCoordinator } from "./volume-DZaaaTVt.js";
import { n as getHotkeyCoordinator } from "./hotkey-BcJ8oZDd.js";
import { n as isCaptionOrSubtitleTrack } from "./text-track-DMA7pa8W.js";
import { a as selectFullscreen, c as selectPiP, h as selectVolume, l as selectPlayback, m as selectTime, p as selectTextTrack, u as selectPlaybackRate } from "./selectors-ChUSrGHY.js";
import { n as getTransitionFlags } from "./transition-sjG62j00.js";

//#region ../core/dist/dev/core/ui/indicator/lifecycle.js
var IndicatorCloseController = class {
	#timer = null;
	#close;
	#getDelay;
	constructor(close, getDelay) {
		this.#close = close;
		this.#getDelay = getDelay;
	}
	arm() {
		this.clear();
		this.#timer = setTimeout(() => {
			this.#timer = null;
			this.#close();
		}, this.#getDelay());
	}
	clear() {
		if (this.#timer === null) return;
		clearTimeout(this.#timer);
		this.#timer = null;
	}
	close() {
		this.clear();
		this.#close();
	}
	destroy() {
		this.clear();
	}
};
var IndicatorVisibilityCoordinator = class {
	#handles = /* @__PURE__ */ new Set();
	register(handle) {
		this.#handles.add(handle);
		return () => this.#handles.delete(handle);
	}
	show(handle) {
		for (const nextHandle of this.#handles) if (nextHandle !== handle) nextHandle.close();
	}
};
function getIndicatorCloseDelay(props) {
	return props.closeDelay ?? 800;
}
function isIndicatorPresent(current, transition) {
	return current.open || transition.active;
}
function getRenderedIndicatorState(current, snapshot, transition) {
	const payload = current.open ? current : snapshot;
	return {
		...payload,
		open: current.open && transition.active,
		generation: current.open ? current.generation : payload.generation,
		...getTransitionFlags(transition.status)
	};
}

//#endregion
//#region ../core/dist/dev/dom/ui/input-action.js
function toInputActionEvent(event) {
	return {
		action: event.action,
		value: event.value,
		source: event.source,
		key: "key" in event.event ? event.event.key : void 0,
		repeat: "repeat" in event.event ? event.event.repeat : void 0
	};
}
function getMediaSnapshot(store) {
	if (!store) return {};
	const state = store.state;
	const time = selectTime(state);
	const textTrack = selectTextTrack(state);
	return {
		paused: selectPlayback(state)?.paused,
		volume: selectVolume(state)?.volume,
		muted: selectVolume(state)?.muted,
		playbackRate: selectPlaybackRate(state)?.playbackRate,
		fullscreen: selectFullscreen(state)?.fullscreen,
		subtitlesShowing: textTrack?.subtitlesShowing,
		subtitlesAvailable: textTrack ? (textTrack.textTrackList ?? []).some(isCaptionOrSubtitleTrack) : void 0,
		pip: selectPiP(state)?.pip,
		currentTime: time?.currentTime,
		duration: time?.duration,
		seeking: time?.seeking
	};
}
function subscribeToInputActions(container, callback) {
	const handleEvent = (event) => callback(toInputActionEvent(event));
	const gestureUnsubscribe = getGestureCoordinator(container).subscribe(handleEvent);
	const hotkeyUnsubscribe = getHotkeyCoordinator(container).subscribe(handleEvent);
	return () => {
		gestureUnsubscribe();
		hotkeyUnsubscribe();
	};
}
const indicatorVisibilityCoordinators = /* @__PURE__ */ new WeakMap();
function getIndicatorVisibilityCoordinator(container) {
	let coordinator = indicatorVisibilityCoordinators.get(container);
	if (!coordinator) {
		coordinator = new IndicatorVisibilityCoordinator();
		indicatorVisibilityCoordinators.set(container, coordinator);
	}
	return coordinator;
}

//#endregion
export { getIndicatorCloseDelay as a, IndicatorCloseController as i, getMediaSnapshot as n, getRenderedIndicatorState as o, subscribeToInputActions as r, isIndicatorPresent as s, getIndicatorVisibilityCoordinator as t };
//# sourceMappingURL=input-action-wfdpyC0m.js.map