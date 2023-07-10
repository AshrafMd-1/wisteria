function getRandomColor() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}

// Generate random gradient angle
function getRandomAngle() {
  let angle = Math.floor(Math.random() * 361); // Generates a random number between 0 and 360
  return `${angle}deg`;
}

// Set random gradient background colors and angle
function setRandomGradient() {
  let color1 = getRandomColor();
  let color2 = getRandomColor();
  let angle = getRandomAngle();
  document.documentElement.style.setProperty('--color1', color1);
  document.documentElement.style.setProperty('--color2', color2);
  document.documentElement.style.setProperty('--angle', `${angle}`);
}

// Call the function on page load
window.addEventListener('load', setRandomGradient);