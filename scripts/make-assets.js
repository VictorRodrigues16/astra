/**
 * Astra — gerador de assets (ícone, splash, favicon, ícone adaptativo).
 *
 * Renderiza a marca da Astra (um planeta com órbita e satélite) em PNG
 * usando apenas módulos nativos do Node (zlib + fs), sem dependências.
 * Rode com:  node scripts/make-assets.js
 */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

/* ----------------------------- PNG encoder ------------------------------ */
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(W, H, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
  const stride = W * 4;
  const raw = Buffer.alloc((stride + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

/* ------------------------------- helpers -------------------------------- */
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function over(buf, i, r, g, b, a) {
  if (a <= 0) return;
  const da = buf[i + 3] / 255;
  const oa = a + da * (1 - a);
  if (oa <= 0) { buf[i] = buf[i + 1] = buf[i + 2] = buf[i + 3] = 0; return; }
  buf[i]     = clamp((r * a + buf[i] * da * (1 - a)) / oa, 0, 255);
  buf[i + 1] = clamp((g * a + buf[i + 1] * da * (1 - a)) / oa, 0, 255);
  buf[i + 2] = clamp((b * a + buf[i + 2] * da * (1 - a)) / oa, 0, 255);
  buf[i + 3] = clamp(oa * 255, 0, 255);
}

const CYAN = [34, 211, 238];
const VIOLET = [124, 92, 252];
const NAVY = [11, 20, 38];
const BLACK = [4, 7, 14];
const WHITE = [240, 250, 255];

function render(N, { bg = true, scale = 1, stars = true } = {}) {
  const buf = Buffer.alloc(N * N * 4);
  const cx = N / 2, cy = N / 2;
  const aa = Math.max(1, N / 700); // largura da borda anti-serrilhada

  // fundo (gradiente radial profundo)
  if (bg) {
    const maxR = N * 0.72;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const d = Math.hypot(x - cx * 0.92, y - cy * 0.86) / maxR;
        const c = mix(NAVY, BLACK, smooth(d));
        const i = (y * N + x) * 4;
        buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
      }
    }
  }

  const Rp = 0.255 * N * scale;          // raio do planeta
  const a = 0.43 * N * scale;            // semi-eixo maior da órbita
  const b = 0.158 * N * scale;           // semi-eixo menor da órbita
  const ang = -26 * Math.PI / 180;       // inclinação da órbita
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const thick = 0.020 * N * scale;       // espessura do anel
  const te = thick / ((a + b) / 2);      // espessura em unidades do elipsoide

  // estrelas
  if (bg && stars) {
    let seed = 1337;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let s = 0; s < Math.round(N * 0.16); s++) {
      const sx = rnd() * N, sy = rnd() * N;
      if (Math.hypot(sx - cx, sy - cy) < Rp + thick * 2) continue;
      const br = 0.35 + rnd() * 0.65;
      const rad = rnd() < 0.85 ? 0.9 : 1.7;
      for (let oy = -2; oy <= 2; oy++) for (let ox = -2; ox <= 2; ox++) {
        const px = Math.round(sx) + ox, py = Math.round(sy) + oy;
        if (px < 0 || py < 0 || px >= N || py >= N) continue;
        const fall = Math.exp(-(ox * ox + oy * oy) / (rad * rad));
        over(buf, (py * N + px) * 4, WHITE[0], WHITE[1], WHITE[2], br * fall * 0.9);
      }
    }
  }

  const ringColor = (X, Y) => {
    const t = smooth((X / a + 1) / 2);
    return mix([60, 170, 210], [200, 245, 255], t);
  };

  // varre todos os pixels uma vez, respeitando a ordem de profundidade
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.hypot(dx, dy);

      // frame girado da órbita
      const X = dx * ca + dy * sa;
      const Y = -dx * sa + dy * ca;
      const e = Math.hypot(X / a, Y / b);
      const ringCov = 1 - smooth(Math.abs(e - 1) / te);
      const front = Y > 0;

      // 1) bloom externo do planeta
      if (dist > Rp - aa) {
        const glow = 0.30 * Math.exp(-Math.pow((dist - Rp) / (0.14 * N), 2));
        if (glow > 0.004) over(buf, i, CYAN[0], CYAN[1], CYAN[2], glow);
      }

      // 2) arco traseiro da órbita (atrás do planeta)
      if (ringCov > 0.01 && !front && dist > Rp - aa * 1.5) {
        const c = ringColor(X, Y);
        over(buf, i, c[0], c[1], c[2], ringCov * 0.55);
      }

      // 3) planeta
      const pc = clamp(0.5 + (Rp - dist) / aa, 0, 1);
      if (pc > 0) {
        const nx = dx / Rp, ny = dy / Rp;
        const tg = smooth(((nx + ny) * 0.5 + 1) / 2);
        let col = mix(CYAN, VIOLET, tg);
        const diag = nx * 0.707 + ny * 0.707;
        const light = clamp(0.92 - 0.5 * diag, 0.4, 1.5);
        col = [col[0] * light, col[1] * light, col[2] * light];
        const hx = x - (cx - 0.42 * Rp), hy = y - (cy - 0.44 * Rp);
        const hl = 0.55 * Math.exp(-(hx * hx + hy * hy) / (0.16 * Rp * Rp));
        col = mix(col, WHITE, clamp(hl, 0, 1));
        over(buf, i, col[0], col[1], col[2], pc);
      }

      // 4) arco frontal da órbita (na frente do planeta)
      if (ringCov > 0.01 && front) {
        const c = ringColor(X, Y);
        over(buf, i, c[0], c[1], c[2], ringCov * 0.95);
      }
    }
  }

  // 5) satélite no arco frontal
  const phi = 38 * Math.PI / 180;
  const ex = a * Math.cos(phi), ey = b * Math.sin(phi);
  const satx = cx + ex * ca - ey * sa;
  const saty = cy + ex * sa + ey * ca;
  const satR = 0.045 * N * scale;
  for (let y = Math.floor(saty - satR * 3); y <= saty + satR * 3; y++) {
    for (let x = Math.floor(satx - satR * 3); x <= satx + satR * 3; x++) {
      if (x < 0 || y < 0 || x >= N || y >= N) continue;
      const d = Math.hypot(x - satx, y - saty);
      const core = clamp(0.5 + (satR * 0.6 - d) / aa, 0, 1);
      const glow = 0.6 * Math.exp(-Math.pow(d / (satR * 1.5), 2));
      const i = (y * N + x) * 4;
      if (glow > 0.004) over(buf, i, CYAN[0], CYAN[1], CYAN[2], glow);
      if (core > 0) over(buf, i, WHITE[0], WHITE[1], WHITE[2], core);
    }
  }

  return buf;
}

/** Banner widescreen para o cabecalho do README. */
function renderBanner(W, H) {
  const buf = Buffer.alloc(W * H * 4);
  const fx = W * 0.34, fy = H * 0.32;
  const maxR = Math.hypot(W, H) * 0.62;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - fx, y - fy) / maxR;
      const c = mix(NAVY, BLACK, smooth(d));
      const i = (y * W + x) * 4;
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
    }
  }

  // brilho diagonal de accent no canto superior esquerdo
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const g = 0.10 * Math.exp(-Math.pow(Math.hypot(x - W * 0.18, y - H * 0.2) / (W * 0.4), 2));
      if (g > 0.003) over(buf, (y * W + x) * 4, CYAN[0], CYAN[1], CYAN[2], g);
    }
  }

  // estrelas
  let seed = 99;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let s = 0; s < Math.round(W * 0.22); s++) {
    const sx = rnd() * W, sy = rnd() * H;
    if (Math.hypot(sx - W * 0.72, sy - H * 0.5) < H * 0.42) continue;
    const br = 0.3 + rnd() * 0.7;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const px = Math.round(sx) + ox, py = Math.round(sy) + oy;
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      over(buf, (py * W + px) * 4, WHITE[0], WHITE[1], WHITE[2], br * Math.exp(-(ox * ox + oy * oy)) * 0.9);
    }
  }

  // marca (planeta) composta a direita
  const markN = Math.round(H * 1.04);
  const mark = render(markN, { bg: false, scale: 0.82, stars: false });
  const ox = Math.round(W * 0.5);
  const oy = Math.round((H - markN) / 2);
  for (let y = 0; y < markN; y++) {
    for (let x = 0; x < markN; x++) {
      const px = ox + x, py = oy + y;
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      const si = (y * markN + x) * 4;
      const a = mark[si + 3] / 255;
      if (a > 0) over(buf, (py * W + px) * 4, mark[si], mark[si + 1], mark[si + 2], a);
    }
  }

  return buf;
}

/* ------------------------------- output --------------------------------- */
const outDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });
const write = (name, W, H, buf) => {
  fs.writeFileSync(path.join(outDir, name), encodePNG(W, H, buf));
  console.log('  ✓', name, `${W}x${H}`);
};

console.log('Gerando assets da Astra...');
write('icon.png', 1024, 1024, render(1024, { bg: true, scale: 1 }));
write('adaptive-icon.png', 1024, 1024, render(1024, { bg: false, scale: 0.66, stars: false }));
write('splash-icon.png', 1024, 1024, render(1024, { bg: false, scale: 0.62, stars: false }));
write('favicon.png', 196, 196, render(196, { bg: true, scale: 0.92 }));
write('notification-icon.png', 256, 256, render(256, { bg: false, scale: 0.8, stars: false }));

// banner do README
const readmeDir = path.join(__dirname, '..', 'assets', 'readme');
fs.mkdirSync(readmeDir, { recursive: true });
fs.writeFileSync(path.join(readmeDir, 'banner.png'), encodePNG(1280, 540, renderBanner(1280, 540)));
console.log('  ✓ readme/banner.png 1280x540');

console.log('Pronto.');
