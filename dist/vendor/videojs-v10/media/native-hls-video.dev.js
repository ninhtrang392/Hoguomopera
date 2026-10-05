/*! Video.js | https://videojs.org/about-this-player */
import { t as CustomMediaElement } from "../custom-media-element-BZpNeQvS.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { t as NativeHlsAdapter } from "../adapter-B39utxtC.js";
import { t as MediaAttachMixin } from "../media-attach-mixin-BbypNME0.js";

//#region ../html/dist/dev/media/native-hls-video/adapter.js
var NativeHlsVideo = class extends MediaAttachMixin(CustomMediaElement("video", NativeHlsAdapter)) {};

//#endregion
//#region ../html/dist/dev/define/media/native-hls-video.js
/** Browser-native HLS media element registered as `<native-hls-video>`. */
var NativeHlsVideoElement = class extends NativeHlsVideo {
	static {
		this.tagName = "native-hls-video";
	}
};
safeDefine(NativeHlsVideoElement);

//#endregion
export { NativeHlsVideoElement };
//# sourceMappingURL=native-hls-video.dev.js.map