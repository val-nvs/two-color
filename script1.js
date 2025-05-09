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
    // leftover for S
    const rawS = {
      r: Math.max(0, 255 - oL.r - oM.r),
      g: Math.max(0, 255 - oL.g - oM.g),
      b: Math.max(0, 255 - oL.b - oM.b)
    };
    const oS = normalize255(rawS);

    return { oL, oM, oS };
  }

  // Main image processing
  function processImage() {
    if (!lastImg) return;

    // size canvas to image
    canvas.width  = lastImg.width;
    canvas.height = lastImg.height;
    ctx.drawImage(lastImg, 0, 0);

    const { oL, oM, oS } = computeOverlays();
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      const R = d[i], G = d[i+1];
      const L = R, M = G, S = (L + M) / 2;

      // tint helper
      const tint = (val, o) => ({
        r: o.r * (val / 255),
        g: o.g * (val / 255),
        b: o.b * (val / 255)
      });

      const tL = tint(L, oL);
      const tM = tint(M, oM);
      const tS = tint(S, oS);

      let r = tL.r + tM.r + tS.r;
      let g = tL.g + tM.g + tS.g;
      let b = tL.b + tM.b + tS.b;

      d[i]   = r > 255 ? 255 : r;
      d[i+1] = g > 255 ? 255 : g;
      d[i+2] = b > 255 ? 255 : b;
      d[i+3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // File picker
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      lastImg = img;
      URL.revokeObjectURL(url);
      processImage();
    };
    img.src = url;
  });

  // Re-process on slider changes
  hueLInput.addEventListener('input',  processImage);
  hueMInput.addEventListener('input',  processImage);
});

