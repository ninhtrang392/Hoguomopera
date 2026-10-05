import { t as CustomMediaElement } from "./custom-media-element-BZpNeQvS.js";
import { t as safeDefine } from "./safe-define-THEasJ9B.js";
import { t as MediaAttachMixin } from "./media-attach-mixin-BbypNME0.js";
import { t as MuxVideoAdapter } from "./adapter-taNnlR1l.js";
import { t as MuxVideoMixin } from "./mixin-Typ-yp2A.js";

//#region ../html/dist/dev/media/mux-video/hls-js.js
const MuxVideoBase = MuxVideoMixin(MediaAttachMixin(CustomMediaElement("video", MuxVideoAdapter)));
var MuxVideo = class extends MuxVideoBase {};

//#endregion
//#region ../html/dist/dev/define/media/mux-video/hls-js.js
var MuxVideoElement = class extends MuxVideo {
	static {
		this.tagName = "mux-video";
	}
};
safeDefine(MuxVideoElement);

//#endregion
export { MuxVideoElement as t };
//# sourceMappingURL=hls-js-Byfa2LKa.js.map