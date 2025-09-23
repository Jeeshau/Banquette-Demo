// js/Spine.js — minimal helper used by the sketch
class Spine {
  constructor({ n, separation, bendMax }) {
    this.n = n;
    this.separation = separation;
    this.bendMax = bendMax;
    this.node = Array.from({ length: n }, () => createVector(0, 0));
  }

  setNode(i, v) {
    this.node[i].set(v.x, v.y);

    // Optional smoothing: cap bend angle between consecutive segments
    if (i > 1) {
      const a = p5.Vector.sub(this.node[i], this.node[i - 1]);
      const b = p5.Vector.sub(this.node[i - 1], this.node[i - 2]);
      const ang = a.angleBetween(b);
      const max = this.bendMax;
      if (abs(ang) > max) {
        a.rotate((ang > 0 ? 1 : -1) * (max - ang));
        this.node[i] = p5.Vector.add(this.node[i - 1], a);
      }
    }
  }

  draw(g) {
    g.beginShape();
    for (let i = 0; i < this.n; i++) g.vertex(this.node[i].x, this.node[i].y);
    g.endShape();
  }
}
