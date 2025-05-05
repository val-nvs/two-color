window.addEventListener('DOMContentLoaded', () => {
  // DOM refs
  const hueLInput = document.getElementById('hueL');
  const hueMInput = document.getElementById('hueM');
  const hueLVal   = document.getElementById('hueLval');
  const hueMVal   = document.getElementById('hueMval');
  const fileInput = document.getElementById('imgInput');
  const canvas    = document.getElementById('canvas');
  const ctx       = canvas.getContext('2d');

  let lastImg = null;

  // HSV → RGB (0–255)
  function hsv2rgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    const c = v * s;
    const hp = h / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let [r1, g1, b1] = [0, 0, 0];
    if (hp < 1)       [r1, g1, b1] = [c, x, 0];
    else if (hp < 2)  [r1, g1, b1] = [x, c, 0];
    else if (hp < 3)  [r1, g1, b1] = [0, c, x];
    else if (hp < 4)  [r1, g1, b1] = [0, x, c];
    else if (hp < 5)  [r1, g1, b1] = [x, 0, c];
    else              [r1, g1, b1] = [c, 0, x];
    const m = v - c;
    return {
      r: (r1 + m) * 255,
      g: (g1 + m) * 255,
      b: (b1 + m) * 255
    };
  }

  // Normalize so r+g+b = 255
  function normalize255({r, g, b}) {
    const sum = r + g + b;
    if (sum === 0) return { r: 0, g: 0, b: 0 };
    const f = 255 / sum;
    return { r: r * f, g: g * f, b: b * f };
  }

  // Compute overlay colors from current slider values
  function computeOverlays() {
    const hL = +hueLInput.value;
    const hM = +hueMInput.value;
    hueLVal.textContent = `${hL}°`;
    hueMVal.textContent = `${hM}°`;

    const oL = normalize255(hsv2rgb(hL, 1, 1));
    const oM = normalize255(hsv2rgb(hM, 1, 1));
    // leftover for S
