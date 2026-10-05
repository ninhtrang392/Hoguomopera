//#region ../media/dist/dev/core/types.js
const MediaReadyState = {
	HAVE_NOTHING: 0,
	HAVE_METADATA: 1,
	HAVE_CURRENT_DATA: 2,
	HAVE_FUTURE_DATA: 3,
	HAVE_ENOUGH_DATA: 4
};
/**
* Canonical values for {@link MediaStreamType}.
*
* - `ON_DEMAND` — a finite-duration asset (VOD). Scrubbing is generally supported across the full timeline.
* - `LIVE` — a live or DVR stream. The seekable window may slide as new segments are published, and `duration` is
*   typically `Infinity`.
* - `UNKNOWN` — the stream type has not been determined yet (no source, or metadata has not loaded).
*/
const MediaStreamTypes = {
	ON_DEMAND: "on-demand",
	LIVE: "live",
	UNKNOWN: "unknown"
};

//#endregion
export { MediaStreamTypes as n, MediaReadyState as t };
//# sourceMappingURL=types-mVdBnzS4.js.map