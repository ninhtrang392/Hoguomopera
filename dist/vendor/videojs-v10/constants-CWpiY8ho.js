import { n as supportsConstructableStyleSheets } from "./supports-C_17-h8z.js";

//#region ../utils/dist/dom/shadow-styles.js
/** Inject a `<style>` tag into `document.head` once (idempotent by `id`). */
function ensureGlobalStyle(id, css) {
	const doc = globalThis.document;
	if (!doc || doc.getElementById(id)) return;
	const style = doc.createElement("style");
	style.id = id;
	style.textContent = css;
	doc.head.appendChild(style);
}
function isConstructableStyleSheet(value) {
	return typeof globalThis.CSSStyleSheet !== "undefined" && value instanceof globalThis.CSSStyleSheet;
}
function getStyleText(style) {
	if (typeof style === "string") return style;
	return Array.from(style.cssRules).map((rule) => rule.cssText).join("\n");
}
/** Create a constructable stylesheet when available, otherwise return raw CSS. */
function createShadowStyle(css) {
	if (!supportsConstructableStyleSheets()) return css;
	const sheet = new globalThis.CSSStyleSheet();
	sheet.replaceSync(css);
	return sheet;
}
/** Apply styles to a shadow root using `adoptedStyleSheets` when available, falling back to `<style>` injection. */
function applyShadowStyles(shadowRoot, styles) {
	if (styles.every(isConstructableStyleSheet) && "adoptedStyleSheets" in shadowRoot) {
		shadowRoot.adoptedStyleSheets = styles;
		return;
	}
	const doc = shadowRoot.ownerDocument;
	for (const styleText of styles.map(getStyleText)) {
		const style = doc.createElement("style");
		style.textContent = styleText;
		shadowRoot.appendChild(style);
	}
}

//#endregion
//#region ../core/dist/dev/core/ui/constants.js
/**
* Page that explains what a Video.js player is and how to build one. Every packaged skin links to it with a hidden `<a
* rel="help">` inside the player: the HTML skins append it to their shadow root and the React skins render it, so
* server-rendered pages carry the link in their HTML. `hidden` keeps it out of the UI and the accessibility tree.
*/
const SKIN_HELP_URL = "https://videojs.org/about-this-player";
/** Text of the hidden help link. Scrapers and agents read it; people never see it. */
const SKIN_HELP_TEXT = "About this Video.js player";

//#endregion
export { ensureGlobalStyle as a, createShadowStyle as i, SKIN_HELP_URL as n, applyShadowStyles as r, SKIN_HELP_TEXT as t };
//# sourceMappingURL=constants-CWpiY8ho.js.map