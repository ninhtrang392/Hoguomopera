import { r as isShadowRoot } from "./predicates-CPrzHtdX.js";

//#region ../utils/dist/dom/tree.js
function containsComposed(root, element) {
	let current = element;
	while (current) {
		if (current === root || root.contains(current)) return true;
		const nodeRoot = current.getRootNode();
		current = isShadowRoot(nodeRoot) ? nodeRoot.host : current.parentNode;
	}
	return false;
}

//#endregion
export { containsComposed as t };
//# sourceMappingURL=tree-8weNZlPe.js.map