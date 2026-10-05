import { t as createContext } from "./create-context-Dp8VhaeT.js";

//#region ../html/dist/dev/player/context.js
const PLAYER_CONTEXT_KEY = Symbol.for("@videojs/player");
/**
* The default player context instance for consuming the player store in controllers.
*
* @public
*/
const playerContext = createContext(PLAYER_CONTEXT_KEY);
const MEDIA_CONTEXT_KEY = Symbol.for("@videojs/media");
const mediaContext = createContext(MEDIA_CONTEXT_KEY);
const CONTAINER_CONTEXT_KEY = Symbol.for("@videojs/container");
const containerContext = createContext(CONTAINER_CONTEXT_KEY);

//#endregion
export { mediaContext as n, playerContext as r, containerContext as t };
//# sourceMappingURL=context-HXfCy4bR.js.map