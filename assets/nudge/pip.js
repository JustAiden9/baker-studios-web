// Pip, drawn live. A line-for-line port of PipFrame in the app's Nudge/DesignSystem/Pip.swift:
// same 120-unit canvas, same paths, same timing, so he breathes, blinks, waves and squashes
// exactly as he does in Nudge. Outfits are left out; the site's Pip never dresses for a season.
//
// Usage: <img data-pip="greeting" src="(a still of that pose)">. The script swaps each one for a
// canvas once it can draw, and the still stays if it can't. Add data-pip-trim="0.12" to cut empty
// sky off the top, and data-pip-tap to boop him on a tap. window.Pip.boop(el) and
// window.Pip.pose(el, 'dizzy') drive one from outside.
(() => {
  const INK = {
    body: '#FFC67E', shade: '#EDAE6C', wing: '#F0B777', belly: '#FFF3DF', outline: '#6B4F36',
    beak: '#F7A447', beakGloss: '#FFD08A', mouth: '#B8505E', leaf: '#74C947', leafLine: '#3E7F2A',
    eye: '#2B2320', cheek: '#F4A0A0', sparkle: '#F2C14E', sky: '#8CC4F0', sweat: '#9FD3F5',
    snore: '#7B8FC8', pink: '#F29BB0', nest: '#B98A56', nestDeep: '#7E5630', nestLight: '#D8AE78', nestRim: '#C69863',
  };

  const svg = (d) => new Path2D(d);
  const P = {
    body: svg('M0,-48 C27,-48 48,-28 49,0 C50,30 30,52 0,52 C-30,52 -50,30 -49,0 C-48,-28 -27,-48 0,-48 Z'),
    belly: svg('M-30,30 C-30,14 -16,8 0,8 C16,8 30,14 30,30 C30,44 17,51 0,51 C-17,51 -30,44 -30,30 Z'),
    bellyTicks: svg('M-11.4,20.6 C-8.25,23.4 -5.1,23.4 -2,20.6 M4.3,29 C7.45,31.8 10.55,31.8 13.7,29 M-5.1,37.35 C-2,39.2 1.15,39.2 4.3,37.35'),
    tailBack: svg('M30,26 C40,10 54,-2 66,-4 C66,6 58,18 44,30 Z'),
    tailFront: svg('M32,30 C46,20 60,14 70,16 C66,26 54,32 40,36 Z'),
    wing: svg('M0,-7 C12,-15 28,-15 38,-7 C40,-4 38,-2 35,-1 C39,1 39,5 34,6 C37,9 35,12 30,12 C20,15 8,12 0,7 Z'),
    wingLines: svg('M14,-2 C22,-3 28,-2 33,1 M12,4 C20,5 25,6 29,8'),
    folded: svg('M-47,16 C-39,12 -30,20 -29,33 C-28,43 -31,50 -35,54 L-38,50 L-42,54 L-44,48 L-48,49 C-52,39 -51,26 -47,16 Z'),
    foldedLines: svg('M-38,28 C-36,36 -36,41 -37,46 M-44,27 C-44,34 -43,39 -43,44'),
    feather: svg('M0,-46 C3,-63 20,-74 30,-70 C24,-58 12,-50 0,-46 Z'),
    featherVein: svg('M3.7,-50 C10.4,-58.9 19.1,-65.3 26.1,-68.8'),
    curlFeather: svg('M0,-46 C-1,-62 14,-74 26,-70 C24,-62 18,-66 14,-60 C10,-54 5,-50 0,-46 Z'),
    smallFeather: svg('M0,-46 C-4,-58 -15,-64 -23,-60 C-19,-53 -8,-48 0,-46 Z'),
    droopFeather: svg('M0,-46 C13,-52 28,-44 30,-28 C22,-33 8,-39 0,-46 Z'),
    nightcap: svg('M0,-46 C-18,-52 -38,-42 -44,-22 C-32,-32 -16,-40 0,-46 Z'),
    sweat: svg('M34,-22 C37,-16 39,-13 39,-10 C39,-6 34,-5 32,-8 C31,-11 32,-15 34,-22 Z'),
    nestBowl: svg('M-68,18 C-66,52 -36,72 0,72 C36,72 66,52 68,18 C44,31 -44,31 -68,18 Z'),
    nestStrands: svg('M-62,34 C-30,46 20,48 60,32 M-56,48 C-24,58 26,56 54,46 M-42,62 C-16,68 18,68 40,60 M-60,30 C-20,54 22,60 50,52 M58,32 C24,54 -20,62 -46,54'),
    nestLightStrands: svg('M-50,42 C-30,50 -10,52 8,50 M14,58 C28,56 40,52 48,48 M-30,64 C-18,66 -8,67 2,66'),
    nestBackStrands: svg('M-50,11 C-30,5 -10,4 6,5 M12,5 C28,5 42,8 52,12'),
    sparkle: svg('M0,-6 L1.8,-1.8 L6,0 L1.8,1.8 L0,6 L-1.8,1.8 L-6,0 L-1.8,-1.8 Z'),
  };
  const ellipse = (x, y, w, h) => { const p = new Path2D(); p.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * Math.PI); return p; };
  const halfRim = (cy, rx, ry) => { const p = new Path2D(); p.ellipse(0, cy, rx, ry, 0, Math.PI, 2 * Math.PI, false); return p; };

  // The nest's front rim and its twigs never change, so they're built once.
  const rimPoint = (t) => {
    const p = [[-68, 18], [-44, 33], [44, 33], [68, 18]], u = 1 - t;
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
  };
  const RIM = (() => {
    const n = 16, taper = (t) => Math.pow(Math.sin(Math.PI * t), 0.5), path = new Path2D();
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = rimPoint(t), top = [p[0], p[1] - 5.5 * taper(t)];
      if (i === 0) { path.moveTo(top[0], top[1]); continue; }
      const tm = (i - 0.5) / n, m = rimPoint(tm), lump = (2.4 + 0.9 * Math.sin(i * 2.3)) * taper(tm);
      path.quadraticCurveTo(m[0], m[1] - 5.5 * taper(tm) - lump * 2, top[0], top[1]);
    }
    for (let i = n; i >= 0; i--) { const t = i / n, p = rimPoint(t); path.lineTo(p[0], p[1] + 6.5 * taper(t)); }
    path.closePath();
    return path;
  })();
  const RIM_TWIGS = [[0.02, 0.3, -3, false], [0.22, 0.52, 2, true], [0.4, 0.7, -2, false], [0.6, 0.98, 1, true], [0.1, 0.4, 3, true], [0.5, 0.86, -3.5, false]]
    .map(([a, b, dy, light]) => {
      const path = new Path2D();
      for (let i = 0; i <= 8; i++) {
        const t = a + (b - a) * i / 8, p = rimPoint(t), q = [p[0], p[1] + dy * 0.4 + dy * Math.sin(Math.PI * i / 8)];
        if (i === 0) path.moveTo(q[0], q[1]); else path.lineTo(q[0], q[1]);
      }
      return [path, light];
    });

  // Keyframes that behave like the bird sheet's CSS: eased segments between stops.
  const Key = {
    wave: (t, period) => (1 - Math.cos(t * 2 * Math.PI / period)) / 2,
    ease: (u) => { const x = Math.min(Math.max(u, 0), 1); return x * x * (3 - 2 * x); },
    frames: (t, period, stops) => { let p = (t / period) % 1; if (p < 0) p += 1; return Key.interp(p, stops, true); },
    linear: (p, stops) => Key.interp(p, stops, false),
    interp: (p, stops, eased) => {
      for (let i = 1; i < stops.length; i++) {
        if (p <= stops[i][0]) {
          const [a, va] = stops[i - 1], [b, vb] = stops[i], u = b > a ? (p - a) / (b - a) : 1;
          return va + (vb - va) * (eased ? Key.ease(u) : u);
        }
      }
      return stops[stops.length - 1][1];
    },
  };

  // A stand-in for SwiftUI's GraphicsContext: a transform and an opacity, copied by value.
  class G {
    constructor(ctx, m, a = 1) { this.ctx = ctx; this.m = m; this.a = a; }
    copy() { return new G(this.ctx, DOMMatrix.fromMatrix(this.m), this.a); }
    translate(x, y) { this.m.translateSelf(x, y); return this; }
    scale(x, y) { this.m.scaleSelf(x, y); return this; }
    rotate(deg) { this.m.rotateSelf(0, 0, deg); return this; }
    pivot(x, y, fn) { this.translate(x, y); fn(this); this.translate(-x, -y); return this; }
    use() { const c = this.ctx, m = this.m; c.setTransform(m.a, m.b, m.c, m.d, m.e, m.f); c.globalAlpha = this.a; return c; }
    fill(path, color) { const c = this.use(); c.fillStyle = color; c.fill(path); }
    stroke(path, color, width, cap = 'butt', join = 'miter') {
      const c = this.use(); c.strokeStyle = color; c.lineWidth = width; c.lineCap = cap; c.lineJoin = join; c.stroke(path);
    }
  }

  const TAU = 2 * Math.PI, sin = Math.sin, cos = Math.cos;

  /// Everything about Pip at one instant (PipFrame).
  class Frame {
    constructor(o) {
      Object.assign(this, { effort: 0, grounded: true, nest: true }, o);
      const { pose, t, moving } = this;
      this.hopping = moving && (pose === 'happy' || pose === 'cheering');
      this.hopY = !this.hopping ? 0 : pose === 'cheering'
        ? Key.frames(t, 1.0, [[0, 0], [0.15, 0], [0.5, -30], [0.85, 0], [1, 0]])
        : Key.frames(t, 1.1, [[0, 0], [0.15, 0], [0.5, -22], [0.85, 0], [1, 0]]);
      this.squash = this.hopping
        ? { x: Key.frames(t, 1.1, [[0, 1.08], [0.15, 1], [0.5, 0.96], [0.85, 1], [1, 1.08]]), y: Key.frames(t, 1.1, [[0, 0.92], [0.15, 1], [0.5, 1.05], [0.85, 1], [1, 0.92]]) }
        : { x: 1, y: 1 };
      if (!moving || this.hopping) this.breathe = { x: 1, y: 1 };
      else if (pose === 'sleeping') { const w = Key.wave(t, 4.6); this.breathe = { x: 1 + 0.012 * w, y: 1 + 0.035 * w }; }
      else { const w = Key.wave(t, pose === 'alert' ? 2.4 : 3.2); this.breathe = { x: 1 + 0.008 * w, y: 1 + 0.022 * w }; }
      this.fidget = moving && pose === 'concerned' ? Key.frames(t, 2.4, [[0, 0], [0.2, -1.6], [0.4, 1.6], [0.6, -1], [0.8, 0], [1, 0]]) : 0;
      const sp = this.sincePose;
      this.dizzySpin = moving && pose === 'dizzy' && sp < 0.9 ? 360 * Key.ease(sp / 0.9) : 0;
      this.dizzyHop = moving && pose === 'dizzy' && sp < 0.9 ? -18 * sin(sp / 0.9 * Math.PI) : 0;
      const dizzyWobble = sp >= 0.9 ? 7 * Math.exp(-0.6 * (sp - 0.9)) * sin((sp - 0.9) * TAU / 0.7) : 0;
      if (!moving) this.tilt = { curious: -7, thinking: -5, wink: 3 }[pose] || 0;
      else this.tilt = {
        curious: () => Key.frames(t, 4, [[0, 0], [0.3, -8], [0.6, 6], [1, 0]]),
        greeting: () => 4 * sin(t * TAU / 2.2),
        thinking: () => -5 + 1.5 * sin(t * TAU / 5),
        wink: () => 3,
        dizzy: () => dizzyWobble,
      }[pose]?.() || 0;
      const sb = this.sinceBoop;
      this.boop = !moving || sb >= 1.2 ? 0 : sb < 0.07 ? sb / 0.07 : Math.exp(-7 * (sb - 0.07)) * cos((sb - 0.07) * TAU / 0.34);
      this.squeezed = moving && sb < 0.28 && pose !== 'dizzy';
      if (!moving || ['sleeping', 'dizzy', 'happy', 'cheering'].includes(pose)) this.blink = 1;
      else this.blink = Key.linear((t % this.blinkPeriod) / this.blinkPeriod, [[0, 1], [0.9, 1], [0.93, 0.1], [0.96, 1], [1, 1]]);
      this.look = pose === 'curious' ? (moving ? [Key.frames(t, 4, [[0, -3], [0.4, 3], [0.7, 3], [1, -3]]), -1] : [2.5, -1])
        : pose === 'thinking' ? [-2.5, -3] : [0, 0];
      this.sink = this.nest ? (pose === 'sleeping' ? -12.3 : -18.3) : 0;
      this.lift = this.hopY + this.dizzyHop;
    }

    draw(context) {
      const world = context.copy();
      if (this.nest) world.scale(0.9, 0.9);
      if (this.grounded) this.drawShadow(world);
      if (this.nest) this.drawNestBack(world);
      const him = this.bodyContext(world);
      this.drawTail(him);
      this.drawRaisedWings(him);
      this.drawBody(him);
      this.drawFace(him);
      this.drawCrest(him);
      if (this.nest) this.drawNestFront(world);
      this.drawFoldedWings(him);
      this.drawExtras(world);
    }

    bodyContext(world) {
      const c = world.copy(), q = this.boop;
      c.translate(this.fidget, this.sink + this.lift + (this.pose === 'focused' ? 2 : 0));
      c.pivot(0, 52, (g) => {
        g.rotate(this.tilt);
        g.scale(this.squash.x * this.breathe.x * (1 + q * 0.14), this.squash.y * this.breathe.y * (1 - q * 0.16));
      });
      c.rotate(this.dizzySpin);
      return c;
    }

    drawShadow(c) {
      const s = c.copy(), k = 1 + this.lift / 60;
      s.a = 0.12 * k;
      const y = this.nest ? 75 : 54, rx = (this.nest ? 56 : 40) * k, ry = 6 * k;
      s.fill(ellipse(-rx, y - ry, rx * 2, ry * 2), '#000');
    }

    drawBody(c) {
      c.fill(P.body, INK.body);
      c.fill(P.belly, INK.belly);
      c.stroke(P.bellyTicks, INK.shade, 1.6, 'round');
      c.stroke(P.body, INK.outline, 2, 'butt', 'round');
    }

    drawTail(c) {
      const g = c.copy().translate(6, 6).scale(0.8, 0.8);
      const flick = this.moving ? (this.hopping ? 10 * sin(this.t * TAU / 0.55) : 3 * sin(this.t * TAU / 3.1)) : 0;
      g.pivot(34, 22, (x) => x.rotate(flick));
      for (const [path, color] of [[P.tailBack, INK.shade], [P.tailFront, INK.wing]]) {
        g.fill(path, color);
        g.stroke(path, INK.outline, 2 / 0.8, 'butt', 'round');
      }
    }

    wing(c, x, y, angle, flip = false, size = 1) {
      const w = c.copy().translate(x, y).scale(flip ? -size : size, size).rotate(angle);
      w.fill(P.wing, INK.wing);
      w.stroke(P.wing, INK.outline, 2 / size, 'butt', 'round');
      w.stroke(P.wingLines, INK.shade, 1.6 / size, 'round');
    }

    drawRaisedWings(c) {
      const { pose, moving, t } = this;
      if (pose === 'greeting') this.wing(c, 38, 0, moving ? -52 + 22 * sin(t * TAU / 0.6) : -48, false, 1.05);
      else if (pose === 'cheering') { const a = moving ? -62 + 14 * sin(t * TAU / 0.32) : -62; this.wing(c, 36, -2, a, false, 1.1); this.wing(c, -36, -2, a, true, 1.1); }
      else if (pose === 'happy') { const a = moving ? -22 + 18 * sin(t * TAU / 0.3) : -22; this.wing(c, 40, 6, a, false, 1.05); this.wing(c, -40, 6, a, true, 1.05); }
      else if (pose === 'dizzy') { const a = moving ? 8 + 14 * sin(t * TAU / 0.8) : 8; this.wing(c, 40, 10, a, false, 1.05); this.wing(c, -40, 10, a, true, 1.05); }
    }

    drawFoldedWings(c) {
      const folded = (right) => {
        const f = c.copy();
        if (right) f.scale(-1, 1);
        f.fill(P.folded, INK.wing);
        f.stroke(P.folded, INK.outline, 2, 'butt', 'round');
        f.stroke(P.foldedLines, INK.shade, 1.6, 'round');
      };
      const pose = this.pose;
      if (['happy', 'cheering', 'dizzy'].includes(pose)) return;
      if (pose === 'greeting') folded(false);
      else if (pose === 'thinking') { folded(false); this.wing(c, 42, 30, 160, false, 0.95); }
      else { folded(false); folded(true); }
    }

    leaf(c, path, width = 2) {
      c.fill(path, INK.leaf);
      c.stroke(path, INK.leafLine, width, 'butt', 'round');
    }

    drawCrest(c) {
      const { pose, moving, t } = this;
      if (pose === 'alert' || pose === 'focused') {
        const boing = pose === 'alert' && moving ? 1 + 0.12 * Math.abs(sin(t * TAU / 0.9)) : 1;
        const blade = new Path2D();
        blade.moveTo(0, -46);
        blade.bezierCurveTo(-8, -56, -7, -70 * boing, 0, -82 * boing);
        blade.bezierCurveTo(7, -70 * boing, 8, -56, 0, -46);
        blade.closePath();
        this.leaf(c, blade);
        const vein = new Path2D(); vein.moveTo(0, -50); vein.lineTo(0, -76 * boing);
        c.stroke(vein, INK.leafLine, 1.2);
        this.leaf(c, P.smallFeather, 1.8);
      } else if (pose === 'concerned') {
        const g = c.copy();
        if (moving) g.pivot(0, -46, (x) => x.rotate(2 * sin(t * TAU / 2.8)));
        this.leaf(g, P.droopFeather);
        this.leaf(c, P.smallFeather, 1.8);
      } else if (pose === 'sleeping') {
        this.leaf(c, P.nightcap);
        this.leaf(c, P.smallFeather, 1.8);
      } else {
        this.leaf(c, P.smallFeather, 1.8);
        const angle = pose === 'curious' ? (moving ? -10 + 8 * sin(t * TAU / 2) : -8)
          : pose === 'happy' || pose === 'cheering' ? (moving ? 18 * sin(t * TAU / 0.42) : 10)
          : pose === 'dizzy' ? (moving ? 30 * sin(t * TAU / 0.5) : 10)
          : (moving ? 7 * sin(t * TAU / 2.6) : 0);
        const g = c.copy().pivot(0, -46, (x) => x.rotate(angle));
        this.leaf(g, pose === 'curious' ? P.curlFeather : P.feather);
        g.stroke(P.featherVein, INK.leafLine, 1.2, 'round');
      }
    }

    drawFace(c) {
      const ey = -3, self = this;
      const arc = (x, y, happy) => {
        const p = new Path2D();
        p.moveTo(x - 7, y + (happy ? 2 : 0));
        p.quadraticCurveTo(x, y + (happy ? -6 : 6), x + 7, y + (happy ? 2 : 0));
        c.stroke(p, INK.eye, 3, 'round');
      };
      const eye = (x, r = 8.5, y = ey) => {
        if (self.squeezed) return arc(x, y, true);
        const b = self.blink;
        if (b < 0.35) return arc(x, y, false);
        const px = x + self.look[0], py = y + self.look[1];
        c.fill(ellipse(px - r, py - r * b, r * 2, r * 2 * b), INK.eye);
        const g = r * 0.33;
        c.fill(ellipse(px + r * 0.32 - g, py - r * 0.38 * b - g, g * 2, g * 2), '#fff');
      };
      const cheeks = (full) => {
        const k = c.copy(); k.a = 0.85;
        const rx = full ? 7.5 : 6.5, ry = full ? 4.5 : 3.8;
        for (const x of [-29, 29]) k.fill(ellipse(x - rx, ey + 12 - ry, rx * 2, ry * 2), INK.cheek);
      };
      const beak = (open = 0) => {
        if (open > 0) {
          const m = new Path2D();
          m.moveTo(-6, ey + 9);
          m.bezierCurveTo(-4, ey + 15 + open, 4, ey + 15 + open, 6, ey + 9);
          m.closePath();
          c.fill(m, INK.mouth);
          c.stroke(m, INK.outline, 1.6, 'butt', 'round');
        }
        const u = new Path2D();
        u.moveTo(-7, ey + 8);
        u.bezierCurveTo(-4, ey + 5, 4, ey + 5, 7, ey + 8);
        u.bezierCurveTo(5, ey + 13, 2, ey + 16, 0, ey + 17);
        u.bezierCurveTo(-2, ey + 16, -5, ey + 13, -7, ey + 8);
        u.closePath();
        c.fill(u, INK.beak);
        c.stroke(u, INK.outline, 1.6, 'butt', 'round');
        const gl = new Path2D(); gl.moveTo(-3, ey + 8); gl.quadraticCurveTo(0, ey + 6.8, 3, ey + 8);
        c.stroke(gl, INK.beakGloss, 1.3, 'round');
      };
      const brows = (inner, outer, y = ey - 12) => {
        for (const s of [-1, 1]) {
          const p = new Path2D(); p.moveTo(22 * s, y + outer); p.lineTo(11 * s, y + inner);
          c.stroke(p, INK.eye, 2.6, 'round');
        }
      };
      switch (this.pose) {
        case 'idle': eye(-17); eye(17); cheeks(false); beak(); break;
        case 'greeting': eye(-17); eye(17); cheeks(true); beak(4); break;
        case 'happy': case 'cheering':
          arc(-17, ey, true); arc(17, ey, true); cheeks(true); beak(this.pose === 'cheering' ? 6 : 4); break;
        case 'alert': eye(-17, 10, ey - 1); eye(17, 10, ey - 1); cheeks(false); beak(2); break;
        case 'concerned':
          brows(-3, 3);
          eye(-17, 8, ey + 1); eye(17, 8, ey + 1); cheeks(false); beak();
          c.fill(P.sweat, INK.sweat); c.stroke(P.sweat, INK.outline, 1.4); break;
        case 'sleeping': arc(-17, ey + 2, false); arc(17, ey + 2, false); cheeks(true); beak(); break;
        case 'curious': eye(-17, 9); eye(17, 9.5); cheeks(false); beak(1.5); break;
        case 'dizzy': {
          const turn = this.moving ? this.t * 324 : 0;
          this.spiral(c, -17, ey, turn); this.spiral(c, 17, ey, -turn); cheeks(true); beak(3); break;
        }
        case 'thinking': eye(-17); eye(17); cheeks(false); beak(); break;
        case 'focused': brows(1, -2, ey - 13); eye(-17, 8); eye(17, 8); cheeks(false); beak(); break;
        case 'wink': eye(-17); arc(17, ey, true); cheeks(true); beak(3); break;
      }
    }

    spiral(c, x, y, turn) {
      const s = c.copy().pivot(x, y, (g) => g.rotate(turn));
      const p = new Path2D();
      p.moveTo(x, y);
      for (let i = 1; i <= 26; i++) { const a = i * 0.55, r = i * 0.34; p.lineTo(x + cos(a) * r, y + sin(a) * r); }
      s.stroke(p, INK.eye, 2.2, 'round', 'round');
    }

    drawNestBack(c) {
      const hollow = ellipse(-57, 4, 114, 28);
      c.fill(hollow, INK.nestDeep);
      c.stroke(hollow, INK.outline, 2);
      c.stroke(halfRim(17, 54, 12), INK.nest, 5);
      c.stroke(P.nestBackStrands, INK.nestLight, 1.8, 'round');
      c.stroke(halfRim(17.1, 57, 15.1), INK.outline, 2);
    }

    drawNestFront(c) {
      const t = this.t;
      const sx = this.hopping ? Key.frames(t, 1.1, [[0, 1.04], [0.15, 1], [0.85, 1], [1, 1.04]]) : 1;
      const sy = this.hopping ? Key.frames(t, 1.1, [[0, 0.94], [0.15, 1], [0.85, 1], [1, 0.94]]) : 1;
      const n = c.copy().pivot(0, 18, (g) => g.scale(sx * 0.86, sy));
      n.fill(P.nestBowl, INK.nest);
      n.stroke(P.nestBowl, INK.outline, 2, 'butt', 'round');
      const strands = n.copy(); strands.a = 0.8;
      strands.stroke(P.nestStrands, INK.nestDeep, 2, 'round');
      n.stroke(P.nestLightStrands, INK.nestLight, 1.8, 'round');
      n.fill(RIM, INK.nestRim);
      n.stroke(RIM, INK.outline, 2, 'butt', 'round');
      for (const [twig, light] of RIM_TWIGS) n.stroke(twig, light ? INK.nestLight : INK.nestDeep, 2.2, 'round', 'round');
    }

    sparkle(c, x, y, r, color, rotation = 0) {
      c.copy().translate(x, y).rotate(rotation).scale(r / 6, r / 6).fill(P.sparkle, color);
    }

    drawExtras(c) {
      const { pose, moving, t } = this, y0 = this.sink;
      if (pose === 'happy' || pose === 'cheering') {
        const spots = pose === 'cheering' ? [[-58, -60], [60, -66], [-44, -96], [48, -100], [0, -118]] : [[-52, -54], [54, -62], [-38, -90]];
        const colors = [INK.sparkle, INK.pink, INK.sky, INK.leaf, INK.sparkle];
        spots.forEach(([x, y], i) => {
          const k = moving ? 0.5 + 0.5 * sin(t * TAU / 0.9 + i * 1.7) : 0.9;
          this.sparkle(c, x, y + y0 + 20, 5 + 3 * k, colors[i % colors.length], k * 40);
        });
      } else if (pose === 'sleeping') {
        for (let i = 0; i < 3; i++) {
          const p = moving ? ((t / 3 + i / 3) % 1) : [0.15, 0.5, 0.85][i];
          const z = c.copy(); z.a = moving ? sin(p * Math.PI) : 0.9;
          const ctx = z.use();
          ctx.fillStyle = INK.snore;
          ctx.font = `700 ${10 + p * 8}px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('z', 38 + p * 22 + sin(p * 6) * 3, y0 - 42 - p * 44);
        }
      } else if (pose === 'dizzy') {
        const turn = moving ? t * 2.6 : 0.6;
        for (let i = 0; i < 3; i++) {
          const a = turn + i * TAU / 3;
          this.sparkle(c, cos(a) * 40, y0 - 62 + sin(a) * 9 + this.lift, 6, INK.sparkle, a * 60);
        }
      } else if (pose === 'thinking') {
        for (let i = 0; i < 3; i++) {
          const d = c.copy(); d.a = moving ? ((t % 2.4) / 0.6 > i ? 1 : 0.15) : 1;
          const r = 3 + i * 1.4, dot = ellipse(34 + i * 10 - r, y0 - 46 - i * 12 - r, r * 2, r * 2);
          d.fill(dot, '#fff'); d.stroke(dot, INK.outline, 1.5);
        }
      } else if (pose === 'wink') {
        const k = moving ? 0.6 + 0.4 * sin(t * TAU / 1.2) : 1;
        this.sparkle(c, 34, y0 - 10, 5 * k + 2, INK.sparkle, 20);
      } else if (pose === 'alert' && moving) {
        const k = Math.abs(sin(t * TAU / 0.9)), l = c.copy();
        l.a = 0.4 + 0.6 * k;
        const y = y0 - 88 - k * 4, p = new Path2D();
        p.moveTo(-16, y); p.lineTo(-22, y - 8);
        p.moveTo(16, y); p.lineTo(22, y - 8);
        p.moveTo(0, y - 6); p.lineTo(0, y - 15);
        l.stroke(p, INK.sparkle, 3, 'round');
      }
    }
  }

  // The live birds on this page. Each keeps its own clock and blink rhythm, like in the app.
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const now = () => performance.now() / 1000;
  const birds = new Map();

  class Bird {
    constructor(img) {
      this.pose = img.dataset.pip;
      this.trim = parseFloat(img.dataset.pipTrim || '0');
      this.phase = Math.random() * 20;
      this.blinkPeriod = 3.6 + Math.random() * 1.8;
      this.poseStart = -100; this.boopStart = -100;
      const canvas = this.canvas = document.createElement('canvas');
      canvas.className = img.className;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', img.alt || 'Pip');
      if (!img.alt) canvas.setAttribute('aria-hidden', 'true');
      canvas.style.aspectRatio = `1.4 / ${(1.85 * (1 - this.trim)).toFixed(4)}`;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      this.ctx = canvas.getContext('2d');
      if (img.hasAttribute('data-pip-tap')) {
        canvas.dataset.tap = '';
        canvas.addEventListener('pointerdown', () => { this.boop(); wake(); });
      }
      img.replaceWith(canvas);
      this.visible = false;
    }
    setPose(pose) { this.pose = pose; this.poseStart = now(); }
    boop() { this.boopStart = now(); }
    draw() {
      const c = this.canvas, dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
      if (!w || !h) return;
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      const ctx = this.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, w, h);
      const unit = w / 1.4 / 120, n = now(), moving = !still.matches;
      const base = new DOMMatrix().translateSelf(w / 2, h - 70 * unit).scaleSelf(unit, unit);
      new Frame({
        pose: this.pose, t: moving ? n + this.phase : 0, moving,
        sincePose: moving ? n - this.poseStart : 10, sinceBoop: moving ? n - this.boopStart : 10,
        blinkPeriod: this.blinkPeriod,
      }).draw(new G(ctx, base));
    }
  }

  let raf = 0;
  const tick = () => {
    raf = 0;
    birds.forEach((b) => { if (b.visible) b.draw(); });
    if (!still.matches && [...birds.values()].some((b) => b.visible)) raf = requestAnimationFrame(tick);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => {
      const b = birds.get(e.target); if (b) { b.visible = e.isIntersecting; if (b.visible) wake(); }
    }), { rootMargin: '120px' })
    : null;

  const start = () => {
    if (!window.Path2D || !window.DOMMatrix) return;
    document.querySelectorAll('img[data-pip]').forEach((img) => {
      const b = new Bird(img);
      birds.set(b.canvas, b);
      if (io) io.observe(b.canvas); else b.visible = true;
    });
    still.addEventListener?.('change', () => { birds.forEach((b) => b.draw()); wake(); });
    addEventListener('resize', () => birds.forEach((b) => b.visible && b.draw()));
    wake();
  };

  const find = (el) => birds.get(el) || birds.get(el?.querySelector?.('canvas'));
  window.Pip = {
    boop: (el) => { const b = find(el); if (b) { b.boop(); wake(); } },
    pose: (el, pose) => { const b = find(el); if (b) { b.setPose(pose); wake(); } },
    // For checking the port against frames exported from the app.
    Frame, G,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
