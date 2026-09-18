// Connected areas share a horizontal world. Simulation keeps the robot local to
// its active area; rendering and input convert through the same fixed offsets.
export const AREA_STRIDE = 1200;
export const HALL_HALF_HEIGHT = 60;
export const HALLWAY_HALF_HEIGHT = HALL_HALF_HEIGHT;
export const HALLWAY_MIDPOINT = 1080;
export const areaOffset = index => index * AREA_STRIDE;

export function hallwayFor(room, index = room.areaIndex || 0) {
  if (!room.exit) return null;
  const offset = areaOffset(index), y = room.exit.y;
  return {left:offset+920,right:offset+1240,top:y-HALL_HALF_HEIGHT,bottom:y+HALL_HALF_HEIGHT,y,gateX:offset+940};
}
