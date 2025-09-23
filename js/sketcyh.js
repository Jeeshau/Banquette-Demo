// js/sketch.js
/**
 * WIND — homepage background
 * Based on your open p5 sketch
 */

let hairs, D;
const nHairs = 60;
const nSegments = 10;
const g = 1;
let pg, pg2, dx, dy;
let reduceMotion = false;
let paused = false;

function setup() {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  createCanvas(windowWidth, windowHeight);
  // For performance on heavy laptops, uncomment:
  // pixelDensity(1);

  frameRate(reduceMotion ? 24 : 55);

  D = min(width, height) * 0.9;
  pg = createGraphics(D, D);
  pg.background(255);
  pg2 = createGraphics(D, D);
  dx = (width - D) / 2;
  dy = (height - D) / 2;
  initHairs();

  // Pause/Resume button
  const btn = document.getElementById('toggleAnim');
  if (btn) {
    btn.addEventListener('click', () => {
      paused = !paused;
      btn.textContent = paused ? 'Resume' : 'Pause';
      if (paused) noLoop(); else loop();
    });
  }
}

function initHairs() {
  let r = D * 0.1;
  let hairLen = D * 0.5;
  let sep = hairLen / nSegments;
  hairs = [];
  for (let i = 0; i < nHairs; i++) {
    let spine = new Spine({ n: nSegments, separation: sep, bendMax: PI / 6 });
    let v = createVector(r, 0).rotate(map(i, 0, nHairs - 1, 0, -PI));
    let p = createVector(D / 2, D / 2).add(v);
    v.setMag(sep);
    let q = p.copy().add(v);
    let node = p.copy();
    for (let j = 0; j < nSegments; j++) {
      spine.node[j] = node.copy();
      node.add(v);
    }
    hairs.push({ p, q, spine });
  }
}

function moveHairs(v) {
  for (let { p, q, spine } of hairs) {
    for (let i = nSegments - 1; i > 1; i--) {
      let node = spine.node[i].copy();
      if (v) node.add(v);
      node.y += g;
      spine.setNode(i, node);
    }
    spine.setNode(0, p);
    spine.setNode(1, q);
  }
}

function drawArrow(p, v, sz) {
  let q = p.copy().add(v);
  let u = v.copy().setMag(sz);
  let a = radians(120), b = radians(150);
  push();
  strokeJoin(ROUND);
  line(p.x, p.y, q.x, q.y);
  beginShape();
  for (let i = 0; i < 3; i++) {
    u.rotate(i === 0 ? b : a);
    q.add(u);
    vertex(q.x, q.y);
  }
  endShape(CLOSE);
  pop();
}

function draw() {
  background(220);

  const cntr = createVector(width / 2, height / 2);
  let p, v, s;

  // Mouse or first touch
 // treat hover OR press as interaction
const inCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
const hovered = inCanvas && (pmouseX !== mouseX || pmouseY !== mouseY);

if (mouseIsPressed || touches.length > 0 || hovered) {
  const mx = touches.length ? touches[0].x : mouseX;
  const my = touches.length ? touches[0].y : mouseY;
  p = createVector(mx, my);
} else {
  // noise-driven auto motion...

    let t = millis() / 5000;
    let r = lerp(D / 6, D / 2, noise(t, 1));
    let a = lerp(-TAU, TAU, noise(t, 2));
    p = cntr.copy().add(createVector(0, -r).rotate(a));
  }

  let d = p.dist(cntr);
  if (d > D / 5 && d < D / 2) {
    const q = createVector(-dx, -dy).add(p);
    v = createVector(D / 2, D / 2).sub(q);
    s = map(v.mag(), D / 2, 0, 0.2, 4) * g;
    v.setMag(s);
  }

  // Multiple integration steps for fluid motion
  moveHairs(v); moveHairs(v); moveHairs(v); moveHairs(v);

  pg.noFill();
  pg.stroke('white');
  pg.strokeWeight(3);
  pg2.clear();
  pg2.noFill();
  pg2.stroke('black');
  pg2.strokeWeight(1);

  for (let { spine } of hairs) {
    spine.draw(pg);
    spine.draw(pg2);
  }
  image(pg, dx, dy);
  image(pg2, dx, dy);

  pg.background(0, 30);
  const factor = 1 / 100;
  let cx = -D * factor, cy = -D * factor;
  const w = D + D * factor * 2;
  const h = D + D * factor * 2;
  if (v) {
    v.normalize();
    cx += v.x * D * factor;
    cy += v.y * D * factor;
  }
  let pic = pg.get();
  pg.image(pic, cx, cy, w, h);

  if (v) {
    stroke('white');
    fill('white');
    drawArrow(p, v.copy().setMag(s * 30), 20);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  D = min(width, height) * 0.9;
  pg = createGraphics(D, D);
  pg.background(255);
  pg2 = createGraphics(D, D);
  dx = (width - D) / 2;
  dy = (height - D) / 2;
  initHairs();
}
