/*! Video.js | https://videojs.org/about-this-player */
import { t as CustomMediaElement } from "../custom-media-element-BZpNeQvS.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { t as MediaAttachMixin } from "../media-attach-mixin-BbypNME0.js";
import { t as HlsAudioAdapter } from "../adapter-xDj58Vde.js";

//#region ../html/dist/dev/media/hls-audio/adapter.js
var HlsAudio = class extends MediaAttachMixin(CustomMediaElement("audio", HlsAudioAdapter)) {};

//#endregion
//#region ../html/dist/dev/define/media/hls-audio.js
var HlsAudioElement = class extends HlsAudio {
	static {
		this.tagName = "hls-audio";
	}
};
safeDefine(HlsAudioElement);

//#endregion
export { HlsAudioElement };
//# sourceMappingURL=hls-audio.dev.js.map