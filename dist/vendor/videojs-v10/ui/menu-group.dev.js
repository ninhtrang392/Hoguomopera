/*! Video.js | https://videojs.org/about-this-player */
import { t as UIElement } from "../ui-element-CAlH76yk.js";
import { t as safeDefine } from "../safe-define-THEasJ9B.js";
import { t as MenuGroupController } from "../group-controller-CfbJ8gqp.js";

//#region ../html/dist/dev/ui/menu/group.js
/**
* Groups related menu items; the element itself takes `role="group"`. A `<media-menu-group-label>` child names the
* group unless it already has an `aria-label` or `aria-labelledby`.
*/
var MenuGroupElement = class extends UIElement {
	static {
		this.tagName = "media-menu-group";
	}
	#group = new MenuGroupController(this);
	update(_changed) {
		super.update(_changed);
		this.#group.applyProps();
	}
};

//#endregion
//#region ../html/dist/dev/define/ui/menu-group.js
safeDefine(MenuGroupElement);

//#endregion
//# sourceMappingURL=menu-group.dev.js.map