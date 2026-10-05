//#region ../core/dist/dev/core/ui/transition.js
/** Shared data attributes for open/close transition state. Spread into component data-attrs objects. */
const TransitionDataAttrs = {
	/** Present during the open transition. */
	transitionStarting: "data-starting-style",
	/** Present during the close transition. */
	transitionEnding: "data-ending-style"
};
function getTransitionFlags(status) {
	return {
		transitionStarting: status === "starting",
		transitionEnding: status === "ending"
	};
}

//#endregion
export { getTransitionFlags as n, TransitionDataAttrs as t };
//# sourceMappingURL=transition-sjG62j00.js.map