export const WING_PERIOD = 3.6;

// Independent spring offsets keep pointer interaction separate from wing poses.
export function repelParticles(coordinates, offsets, velocities, pointer, radius, dt) {
  const steps=Math.max(1,Math.ceil(Math.min(dt,.05)/.008));
  const step=Math.min(dt,.05)/steps;
  for(let i=0;i<coordinates.length;i+=3){
    for(let n=0;n<steps;n++){
      let fx=0,fy=0;
      if(pointer){
        const dx=coordinates[i]+offsets[i]-pointer.x,dy=coordinates[i+1]+offsets[i+1]-pointer.y;
        const distance=Math.hypot(dx,dy);
        if(distance<radius){
          const angle=i*2.399963;
          const force=12*radius*Math.pow(1-distance/radius,2);
          fx=(distance>1e-6?dx/distance:Math.cos(angle))*force;
          fy=(distance>1e-6?dy/distance:Math.sin(angle))*force;
        }
      }
      for(let axis=0;axis<2;axis++){
        const j=i+axis;
        velocities[j]+=((axis===0?fx:fy)-22*offsets[j]-8*velocities[j])*step;
        offsets[j]+=velocities[j]*step;
      }
    }
    coordinates[i]+=offsets[i];coordinates[i+1]+=offsets[i+1];
  }
}
// Shoulder axis follows the back: about 15 degrees up toward the head.
export const WING_TILT = Math.PI / 12;

// Bend along the wing span: the shoulder leads and the wrist/feathers follow.
// Integrating the curved span keeps the feather fan connected at its root.
// Body points (wing = 0) are never transformed.
export function wingPose(x, y, z, wing, time) {
  if (!wing) return [x, y, z];
  const far = wing === 2;
  const phase = time / WING_PERIOD * Math.PI * 2;
  const span = y + .068;
  let lift=0, sweep=0;
  const segments=8;
  for(let i=0;i<segments;i++) {
    const reach=Math.min(1,Math.max(0,span*(i+.5)/segments/.68));
    const bend=reach*reach*(3-2*reach);
    // A travelling bend: the shoulder turns first, then the wrist and tips.
    // Slow the reversal at the top of the stroke without a hard hold.
    const delayed=phase-1.05*bend;
    const flowing=delayed-.12*Math.sin(delayed);
    const angle=1.02-.94*Math.cos(flowing)+.16*bend*Math.sin(flowing);
    lift+=span/segments*Math.cos(angle);
    sweep+=span/segments*Math.sin(angle);
  }
  // Trailing feathers curl slightly after the wrist, with no random jitter.
  const tip=Math.min(1,Math.max(0,span/.68));
  const trailing=Math.min(1,Math.max(0,(.205-x)/.65));
  const featherPhase=phase-1.15*tip-.3*trailing;
  const curl=.065*tip*tip*trailing*Math.sin(featherPhase);
  const depth=(sweep+curl)*(far ? -1 : 1);
  const localX=x-.205+depth*.65;
  const localY=lift+curl*.35;
  const c=Math.cos(WING_TILT),s=Math.sin(WING_TILT);
  return [
    .205+localX*c-localY*s,
    -.068+localX*s+localY*c,
    z + depth * .65 + (far ? -.04 : .04)
  ];
}

export function crossedDownstroke(previous, current) {
  return Math.floor(current / WING_PERIOD - .22) > Math.floor(previous / WING_PERIOD - .22);
}
