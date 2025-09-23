// Interactive “wind hairs” background for Banquette

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

  // If performance is heavy on laptops, uncomment:
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
  const r = D * 0.1;
  const hairLen = D * 0.5;
  const sep = hairLen / nSegments;
  hairs = [];
  for (let i = 0; i < nHairs; i++) {
    const spine = new Spine({ n: nSegments, separation: sep, bendMax: PI / 6 });
    const v = createVector(r, 0).rotate(map(i, 0, nHairs - 1, 0, -PI));
    const p = createVector(D / 2, D / 2).add(v);
    v.setMag(sep);
    const q = p.copy().add(v);
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
  background(0); // solid black page background

  const cntr = createVector(width / 2, height / 2);

  // Use pointer if inside canvas (or any touch)
  let p;
  const inCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  if (touches.length > 0) {
    p = createVector(touches[0].x, touches[0].y);
  } else if (inCanvas) {
    p = createVector(mouseX, mouseY);
  } else {
    // Autonomous motion when pointer leaves the canvas
    const t = millis() / 5000;
    const r = lerp(D / 6, D / 2, noise(t, 1));
    const a = lerp(-TAU, TAU, noise(t, 2));
    p = cntr.copy().add(createVector(0, -r).rotate(a));
  }

  // Wind vector from pointer → center (always active)
  let q = createVector(-dx, -dy).add(p);           // pointer in pg coords
  let v = createVector(D / 2, D / 2).sub(q);       // toward pg center
  const speed = dist(mouseX, mouseY, pmouseX, pmouseY);
  let s = map(v.mag(), 0, D / 2, 0.4, 4) + map(speed, 0, 40, 0, 1);
  s = constrain(s, 0.4, 6);
  v.setMag(s);

  // Integrate multiple times per frame for fluid motion
  moveHairs(v); moveHairs(v); moveHairs(v); moveHairs(v);

  // stroked lines on two layers
  pg.noFill(); pg.stroke('white'); pg.strokeWeight(3);
  pg2.clear(); pg2.noFill(); pg2.stroke('black'); pg2.strokeWeight(1);

  for (let { spine } of hairs) { spine.draw(pg); spine.draw(pg2); }
  image(pg, dx, dy); image(pg2, dx, dy);

  // parallax smear for motion
  pg.background(0, 30);
  const factor = 1 / 100;
  let cx = -D * factor, cy = -D * factor;
  const w = D + D * factor * 2, h = D + D * factor * 2;
  const vn = v.copy().normalize();
  cx += vn.x * D * factor; cy += vn.y * D * factor;
  const pic = pg.get();
  pg.image(pic, cx, cy, w, h);

  // visual arrow indicator
  stroke('white'); fill('white');
  drawArrow(p, v.copy().setMag(s * 30), 20);
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
