//#region ../utils/dist/dom/predicates.js
function isDocument(value) {
	return value instanceof Node && value.nodeType === 9;
}
function isShadowRoot(value) {
	return value instanceof Node && value.nodeType === 11 && "host" in value;
}
function isHTMLImageElement(value) {
	return value instanceof HTMLImageElement;
}

//#endregion
export { isHTMLImageElement as n, isShadowRoot as r, isDocument as t };
//# sourceMappingURL=predicates-CPrzHtdX.js.map