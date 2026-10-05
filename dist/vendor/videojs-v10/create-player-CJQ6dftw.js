import { o as isNull } from "./predicate-D3AAes4E.js";
import { t as ContextProvider } from "./context-provider-2u40YNUB.js";
import { S as setPlayerConfigValue, _ as audioTrackFeature, a as remotePlaybackFeature, b as combinePlayerFeatureConfigs, c as playbackFeature, d as liveFeature, f as fullscreenFeature, g as bufferFeature, i as sourceFeature, l as pipFeature, m as controlsFeature, n as timeFeature, o as qualityFeature, p as errorFeature, r as textTrackFeature, s as playbackRateFeature, t as volumeFeature, u as metadataFeature } from "./volume-DZaaaTVt.js";
import { n as kebabCase, t as camelCase } from "./casing-Cu0fL85w.js";
import { t as UIElement } from "./ui-element-CAlH76yk.js";
import { n as mediaContext, r as playerContext, t as containerContext } from "./context-HXfCy4bR.js";
import { n as createPlayerController, r as createStore } from "./controller-ReTpO8jJ.js";

//#region ../store/dist/dev/core/combine.js
/**
* Combines multiple slices into a single slice.
*
* @param slices - The slices to combine.
* @returns A new slice that represents the combination of the input slices.
*/
function combine(...slices) {
	const derivedDefinitions = slices.map((slice) => slice.derived ?? {});
	warnDuplicates("derived", derivedDefinitions);
	return {
		state: (ctx) => {
			const states = slices.map((slice) => slice.state(ctx));
			warnDuplicates("state", states);
			warnOverlaps(states, derivedDefinitions);
			return Object.assign({}, ...states);
		},
		preserve: Array.from(new Set(slices.flatMap((slice) => slice.preserve ?? []))),
		derived: Object.assign({}, ...derivedDefinitions),
		attach: (ctx) => {
			for (const slice of slices) try {
				slice.attach?.(ctx);
			} catch (err) {
				ctx.reportError(err);
			}
		}
	};
}
function warnDuplicates(namespace, objects) {
	const seen = /* @__PURE__ */ new Set();
	for (const object of objects) for (const key of Reflect.ownKeys(object)) {
		if (seen.has(key)) console.warn(`[vjs-store] combine(): duplicate ${namespace} key "${String(key)}" — later slice overwrites earlier one`);
		seen.add(key);
	}
}
function warnOverlaps(states, derivedDefinitions) {
	const stateKeys = new Set(states.flatMap((state) => Reflect.ownKeys(state)));
	for (const key of new Set(derivedDefinitions.flatMap((derived) => Reflect.ownKeys(derived)))) if (stateKeys.has(key)) console.warn(`[vjs-store] combine(): state and derived key "${String(key)}" overlap — derived state overwrites source state`);
}

//#endregion
//#region ../core/dist/dev/dom/store/features/presets.js
const videoFeatures = [
	playbackFeature,
	playbackRateFeature,
	qualityFeature,
	audioTrackFeature,
	volumeFeature,
	timeFeature,
	sourceFeature,
	bufferFeature,
	fullscreenFeature,
	pipFeature,
	remotePlaybackFeature,
	controlsFeature,
	textTrackFeature,
	errorFeature,
	metadataFeature
];
const audioFeatures = [
	playbackFeature,
	playbackRateFeature,
	volumeFeature,
	timeFeature,
	sourceFeature,
	bufferFeature,
	errorFeature,
	metadataFeature
];
const backgroundFeatures = [];
/**
* Features for a live video player. Mirrors {@link videoFeatures} but drops {@link playbackRateFeature} (not meaningful
* for live) along with {@link qualityFeature} and {@link audioTrackFeature}, and adds {@link liveFeature} so store
* consumers can read `liveEdgeStart` and `targetLiveWindow`.
*/
const liveVideoFeatures = [
	playbackFeature,
	volumeFeature,
	timeFeature,
	sourceFeature,
	bufferFeature,
	fullscreenFeature,
	pipFeature,
	remotePlaybackFeature,
	controlsFeature,
	textTrackFeature,
	errorFeature,
	liveFeature,
	metadataFeature
];
/**
* Features for a live audio player. Mirrors {@link audioFeatures} but drops {@link playbackRateFeature} (not meaningful
* for live) and adds {@link liveFeature} so store consumers can read `liveEdgeStart` and `targetLiveWindow`.
*/
const liveAudioFeatures = [
	playbackFeature,
	volumeFeature,
	timeFeature,
	sourceFeature,
	bufferFeature,
	errorFeature,
	liveFeature,
	metadataFeature
];

//#endregion
//#region ../html/dist/dev/player/element.js
function resolveInputs(config) {
	return Object.entries(config).map(([key, entry]) => {
		const declared = entry.html?.attribute;
		const attribute = declared ?? kebabCase(key);
		if (declared && declared !== kebabCase(declared)) console.warn(`[vjs-html] config html.attribute "${declared}" is not kebab-case and will never match`);
		return {
			property: camelCase(attribute),
			attribute,
			entry
		};
	});
}
function createPlayerElement(options) {
	const inputs = resolveInputs(options.config);
	class ConfiguredPlayerElement extends UIElement {
		static {
			this.properties = {
				...UIElement.properties,
				...Object.fromEntries(inputs.map(({ property, attribute }) => [property, {
					type: String,
					attribute
				}]))
			};
		}
		#store = options.factory();
		#configuredStore = null;
		#detach = null;
		#connected = false;
		#media = null;
		#nativeMedia = null;
		#container = null;
		#mediaRegistrations = [];
		#containerRegistrations = [];
		#observer = new MutationObserver(() => this.#syncNativeMedia());
		#registerMedia = (media) => {
			const registration = { value: media };
			this.#mediaRegistrations.push(registration);
			this.#syncMedia();
			return () => {
				const index = this.#mediaRegistrations.indexOf(registration);
				if (index < 0) return;
				this.#mediaRegistrations.splice(index, 1);
				this.#syncNativeMedia();
				this.#syncMedia();
			};
		};
		#registerContainer = (container) => {
			const registration = { value: container };
			this.#containerRegistrations.push(registration);
			this.#syncContainer();
			return () => {
				const index = this.#containerRegistrations.indexOf(registration);
				if (index < 0) return;
				this.#containerRegistrations.splice(index, 1);
				this.#syncContainer();
			};
		};
		#playerProvider = new ContextProvider(this, {
			context: options.playerContext,
			initialValue: this.store
		});
		#mediaProvider = new ContextProvider(this, {
			context: options.mediaContext,
			initialValue: {
				media: this.#media,
				registerMedia: this.#registerMedia
			}
		});
		#containerProvider = new ContextProvider(this, {
			context: options.containerContext,
			initialValue: {
				container: this.#container,
				registerContainer: this.#registerContainer
			}
		});
		get store() {
			if (isNull(this.#store)) this.#store = options.factory();
			return this.#store;
		}
		connectedCallback() {
			this.#connected = true;
			super.connectedCallback();
			this.#syncInitialConfig();
			this.#playerProvider.setValue(this.store);
			this.#publishMedia();
			this.#publishContainer();
			this.#observer.observe(this, {
				childList: true,
				subtree: true
			});
			queueMicrotask(() => {
				if (this.#connected) this.#syncNativeMedia();
			});
			this.#tryAttach();
		}
		disconnectedCallback() {
			this.#connected = false;
			this.#observer.disconnect();
			this.#detachStore();
			super.disconnectedCallback();
		}
		destroyCallback() {
			this.#observer.disconnect();
			this.#detachStore();
			this.#store?.destroy();
			this.#store = null;
			super.destroyCallback();
		}
		willUpdate(changed) {
			super.willUpdate(changed);
			for (const { property, entry } of inputs) {
				if (!changed.has(property)) continue;
				const configProperty = property;
				setPlayerConfigValue(this.store, entry, this[configProperty]);
			}
		}
		#syncMedia() {
			const media = this.#mediaRegistrations.at(-1)?.value ?? null ?? this.#nativeMedia;
			if (this.#media === media) return;
			this.#media = media;
			this.#publishMedia();
			this.#tryAttach();
		}
		#syncContainer() {
			const container = this.#containerRegistrations.at(-1)?.value ?? null;
			if (this.#container === container) return;
			this.#container = container;
			this.#publishContainer();
			this.#tryAttach();
		}
		#syncNativeMedia() {
			const media = this.querySelector("video, audio");
			if (this.#nativeMedia === media) return;
			this.#nativeMedia = media;
			this.#syncMedia();
		}
		#publishMedia() {
			this.#mediaProvider.setValue({
				media: this.#media,
				registerMedia: this.#registerMedia
			});
		}
		#publishContainer() {
			this.#containerProvider.setValue({
				container: this.#container,
				registerContainer: this.#registerContainer
			});
		}
		#tryAttach() {
			const store = this.#store;
			if (!this.#connected || !store) return;
			if (!this.#media) {
				this.#detachStore();
				return;
			}
			const target = {
				media: this.#media,
				container: this.#container
			};
			const hasMediaChanged = store.target?.media !== target.media;
			const hasContainerChanged = store.target?.container !== target.container;
			if (hasMediaChanged || hasContainerChanged) {
				this.#detachStore();
				this.#detach = store.attach(target);
			}
		}
		#detachStore() {
			this.#detach?.();
			this.#detach = null;
		}
		#syncInitialConfig() {
			const store = this.store;
			if (this.#configuredStore === store) return;
			for (const { property, entry } of inputs) {
				const configProperty = property;
				setPlayerConfigValue(store, entry, this[configProperty]);
			}
			this.#configuredStore = store;
		}
	}
	return ConfiguredPlayerElement;
}

//#endregion
//#region ../html/dist/dev/player/create-player.js
function createPlayer(config) {
	const slice = combine(...config.features);
	const featureConfig = combinePlayerFeatureConfigs(config.features);
	return {
		PlayerElement: createPlayerElement({
			playerContext,
			mediaContext,
			containerContext,
			factory: () => createStore()(slice),
			config: featureConfig
		}),
		PlayerController: createPlayerController(playerContext),
		playerContext
	};
}

//#endregion
export { liveVideoFeatures as a, liveAudioFeatures as i, audioFeatures as n, videoFeatures as o, backgroundFeatures as r, createPlayer as t };
//# sourceMappingURL=create-player-CJQ6dftw.js.map