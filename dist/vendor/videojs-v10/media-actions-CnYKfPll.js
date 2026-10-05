import { y as getMediaInputActionValue } from "./volume-DZaaaTVt.js";
import { h as selectVolume, m as selectTime, u as selectPlaybackRate } from "./selectors-ChUSrGHY.js";

//#region ../core/dist/dev/dom/media-actions.js
const MEDIA_INPUT_ACTION_OVERRIDES = {
	seekStep({ store, value, key }) {
		const step = getMediaInputActionValue("seekStep", key, value);
		const time = selectTime(store.state);
		if (!time) return;
		time.seek(time.currentTime + step);
	},
	volumeStep({ store, value, key }) {
		const step = getMediaInputActionValue("volumeStep", key, value);
		const vol = selectVolume(store.state);
		if (!vol) return;
		vol.setVolume(vol.volume + step);
	},
	speedUp({ store }) {
		const rate = selectPlaybackRate(store.state);
		if (!rate) return;
		const { playbackRates, playbackRate } = rate;
		const idx = playbackRates.indexOf(playbackRate);
		const next = idx < 0 || idx >= playbackRates.length - 1 ? 0 : idx + 1;
		rate.setPlaybackRate(playbackRates[next]);
	},
	speedDown({ store }) {
		const rate = selectPlaybackRate(store.state);
		if (!rate) return;
		const { playbackRates, playbackRate } = rate;
		const idx = playbackRates.indexOf(playbackRate);
		const next = idx <= 0 ? playbackRates.length - 1 : idx - 1;
		rate.setPlaybackRate(playbackRates[next]);
	}
};

//#endregion
export { MEDIA_INPUT_ACTION_OVERRIDES as t };
//# sourceMappingURL=media-actions-CnYKfPll.js.map