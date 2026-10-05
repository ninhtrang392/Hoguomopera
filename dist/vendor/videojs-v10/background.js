/*! Video.js | https://videojs.org/about-this-player */
import{a as e,n as t,t as n}from"./constants-COmqnfpX.js";import{n as r}from"./ui-element-W8TE1cv7.js";import{t as i}from"./safe-define-BnsQT9yb.js";import{r as a,t as o}from"./create-player-QqbEYf9t.js";import"./ui/container.js";import"./background-video-0h2dzDbv.js";const{PlayerElement:s,PlayerController:c}=o({features:a});var l=class extends s{static{this.tagName=`background-video-player`}};i(l);var u=`background-video-player{display:contents}background-video-skin{--media-object-fit:cover;object-fit:var(--media-object-fit);width:100%;min-width:300px;height:100%;min-height:150px;display:block;position:relative}background-video-skin>:not(img,picture){object-fit:var(--media-object-fit);width:100%;height:100%;position:absolute;inset:0}background-video-skin>img,background-video-skin>picture{object-fit:var(--media-object-fit);width:100%;height:100%}
`;function d(){return`
    <media-container>
      <!-- @deprecated slot="media" is no longer required, use the default slot instead -->
      <slot name="media"></slot>
      <slot></slot>
    </media-container>
    <a rel="help" href="${t}" hidden>${n}</a>
  `}var f=class t extends r{static{this.tagName=`background-video-skin`}static{this.shadowRootOptions={mode:`open`}}static{this.getTemplateHTML=d}constructor(){super(),e(`__media-background-styles`,u),this.shadowRoot||(this.attachShadow(t.shadowRootOptions),this.shadowRoot.innerHTML=d())}};i(f);
//# sourceMappingURL=background.js.map