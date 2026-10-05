/*! Video.js | https://videojs.org/about-this-player */
import { d as isUndefined } from "../predicate-D3AAes4E.js";
import { t as ContextConsumer } from "../context-consumer-LN8LIb2c.js";
import { t as createHotkey } from "../hotkey-BcJ8oZDd.js";
import { t as UIElement } from "../ui-element-CAlH76yk.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { r as playerContext, t as containerContext } from "../context-HXfCy4bR.js";
import { t as PlayerController } from "../controller-ReTpO8jJ.js";
import { t as getTimeRangeEnd } from "../predicate-B_kVyfOp.js";
import { a as selectFullscreen, c as selectPiP, h as selectVolume, l as selectPlayback, m as selectTime, n as selectBuffer, p as selectTextTrack } from "../selectors-ChUSrGHY.js";
import { t as MEDIA_INPUT_ACTION_OVERRIDES } from "../media-actions-CnYKfPll.js";

//#region ../core/dist/dev/dom/hotkey/actions.js
function isHotkeyToggleAction(action) {
	return action.startsWith("toggle");
}
const HOTKEY_ACTIONS = {
	togglePaused({ store }) {
		const playback = selectPlayback(store.state);
		if (!playback) return;
		playback.paused ? playback.play() : playback.pause();
	},
	toggleMuted({ store }) {
		selectVolume(store.state)?.toggleMuted();
	},
	toggleFullscreen({ store }) {
		const fs = selectFullscreen(store.state);
		if (!fs) return;
		fs.fullscreen ? fs.exitFullscreen() : fs.requestFullscreen();
	},
	toggleSubtitles({ store }) {
		selectTextTrack(store.state)?.toggleSubtitles();
	},
	togglePictureInPicture({ store }) {
		const pip = selectPiP(store.state);
		if (!pip) return;
		pip.pip ? pip.exitPictureInPicture() : pip.requestPictureInPicture();
	},
	seekStep: MEDIA_INPUT_ACTION_OVERRIDES.seekStep,
	volumeStep: MEDIA_INPUT_ACTION_OVERRIDES.volumeStep,
	speedUp: MEDIA_INPUT_ACTION_OVERRIDES.speedUp,
	speedDown: MEDIA_INPUT_ACTION_OVERRIDES.speedDown,
	seekToPercent({ store, value, key }) {
		const time = selectTime(store.state);
		if (!time) return;
		const buffer = selectBuffer(store.state);
		const duration = getTimeRangeEnd({
			duration: time.duration,
			seekable: buffer?.seekable ?? []
		});
		if (duration <= 0) return;
		let percent;
		if (!isUndefined(value)) percent = value;
		else if (key >= "0" && key <= "9") percent = Number(key) * 10;
		else return;
		time.seek(percent / 100 * duration);
	}
};
function resolveHotkeyAction(name) {
	const resolver = HOTKEY_ACTIONS[name];
	if (!resolver) console.warn(`[vjs-hotkey] Unknown action: "${name}"`);
	return resolver;
}

//#endregion
//#region ../html/dist/dev/ui/hotkey/element.js
var HotkeyElement = class extends UIElement {
	constructor(..._args) {
		super(..._args);
		this.keys = "";
		this.action = "";
		this.value = void 0;
		this.disabled = false;
		this.target = "player";
		this.#player = new PlayerController(this, playerContext);
		this.#container = new ContextConsumer(this, {
			context: containerContext,
			callback: () => this.requestUpdate(),
			subscribe: true
		});
		this.#cleanup = null;
	}
	static {
		this.tagName = "media-hotkey";
	}
	static {
		this.properties = {
			keys: { type: String },
			action: { type: String },
			value: { type: Number },
			disabled: { type: Boolean },
			target: { type: String }
		};
	}
	#player;
	#container;
	#cleanup;
	connectedCallback() {
		super.connectedCallback();
		this.style.display = "none";
		this.#register();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		this.#unregister();
	}
	update(changed) {
		super.update(changed);
		if (this.isConnected) {
			this.#unregister();
			this.#register();
		}
	}
	#register() {
		const store = this.#player.value;
		const container = this.#container.value?.container;
		if (!this.keys || !this.action || !store || !container) return;
		const resolver = resolveHotkeyAction(this.action);
		if (!resolver) return;
		const { value, action } = this;
		this.#cleanup = createHotkey(container, {
			keys: this.keys,
			action,
			value,
			target: this.target,
			disabled: this.disabled,
			repeatable: !isHotkeyToggleAction(action),
			onActivate: (_event, key) => {
				resolver({
					store,
					key,
					value
				});
			}
		});
	}
	#unregister() {
		this.#cleanup?.();
		this.#cleanup = null;
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/hotkey.js
safeDefine(HotkeyElement);

//#endregion
//# sourceMappingURL=hotkey.dev.js.map