/*! Video.js | https://videojs.org/about-this-player */
import { t as CustomMediaElement } from "../custom-media-element-BZpNeQvS.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { t as HlsJsAdapter } from "../adapter-D9IcJ1o8.js";
import { t as MediaAttachMixin } from "../media-attach-mixin-BbypNME0.js";

//#region ../html/dist/dev/media/hlsjs-video/adapter.js
var HlsJsVideo = class extends MediaAttachMixin(CustomMediaElement("video", HlsJsAdapter)) {};

//#endregion
//#region ../html/dist/dev/define/media/hlsjs-video.js
/** Cross-browser HLS media element powered by hls.js and registered as `<hlsjs-video>`. */
var HlsJsVideoElement = class extends HlsJsVideo {
	static {
		this.tagName = "hlsjs-video";
	}
};
safeDefine(HlsJsVideoElement);

//#endregion
export { HlsJsVideoElement };
//# sourceMappingURL=hlsjs-video.dev.js.map