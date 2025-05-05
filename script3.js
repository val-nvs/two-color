const uploader = document.getElementById('uploader');
const canvas   = document.getElementById('canvas');
const ctx      = canvas.getContext('2d');

uploader.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    // size canvas to image
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    // draw original
    ctx.drawImage(img, 0, 0);

    // grab pixel data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    // apply (r+g)/2 filter
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const avg = (r + g) / 2 | 0;  // integer
      // set channels to avg:
      data[i]   = avg;  // red
      data[i+1] = avg;  // green
      data[i+2] = avg;  // blue
      // leave alpha (data[i+3]) unchanged
    }

    // put back filtered data
    ctx.putImageData(imageData, 0, 0);
  };

  // read file into image
  const reader = new FileReader();
  reader.onload = evt => img.src = evt.target.result;
  reader.readAsDataURL(file);
});




  const slider = document.getElementById("mySlider");
  const output = document.getElementById("sliderValue");

  slider.addEventListener("input", () => {
    output.textContent = slider.value;
  });

