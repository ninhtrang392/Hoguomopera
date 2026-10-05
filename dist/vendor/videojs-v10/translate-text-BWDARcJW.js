import { t as resolveText } from "./resolve-text-Ba3rK6xL.js";

//#region ../core/dist/dev/core/i18n/utils/interpolate.js
const PLACEHOLDER = /\{([^{}]+)\}/g;
function interpolate(template, params) {
	if (!params) return template;
	return template.replace(PLACEHOLDER, (match, name) => {
		return Object.hasOwn(params, name) ? String(params[name]) : match;
	});
}

//#endregion
//#region ../core/dist/dev/core/i18n/translate-text.js
function translateText(text, translatorOrParams, params) {
	if (typeof text === "string") return text;
	if (typeof translatorOrParams === "function") return translatorOrParams(text, params);
	return interpolate(resolveText(text), translatorOrParams ?? params);
}

//#endregion
export { interpolate as n, translateText as t };
//# sourceMappingURL=translate-text-BWDARcJW.js.map