/*! Video.js | https://videojs.org/about-this-player */
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { t as DialogDataAttrs } from "../data-Cw0pKnnN.js";
import { t as AlertDialogCore } from "../core-Dp9EeNaj.js";
import { n as DialogElementBase } from "../element-CktyvsNl.js";

//#region ../core/dist/dev/core/ui/alert-dialog/data.js
const AlertDialogDataAttrs = { ...DialogDataAttrs };

//#endregion
//#region ../html/dist/dev/ui/alert-dialog/element.js
/**
* A modal dialog with alert semantics.
*
* @fires open-change - Fired when the dialog's open state changes.
*/
var AlertDialogElement = class extends DialogElementBase {
	static {
		this.tagName = "media-alert-dialog";
	}
	constructor() {
		super({
			core: new AlertDialogCore(),
			stateAttrMap: AlertDialogDataAttrs,
			idPrefix: "alert-dialog",
			bindTrigger: false
		});
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/alert-dialog.js
safeDefine(AlertDialogElement);

//#endregion
//# sourceMappingURL=alert-dialog.dev.js.map