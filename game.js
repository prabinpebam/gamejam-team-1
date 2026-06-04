// Minimal canvas game starter for the Mini Game Jam.
// Replace this with your own game! It's just a moving square to prove the loop works.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 28,
  speed: 260, // pixels per second
  color: "#5cc8ff",
};

const keys = new Set();
let paused = false;
let lastTime = performance.now();

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p") {
    paused = !paused;
    return;
  }
  keys.add(e.key.toLowerCase());
});

window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

function update(dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv;
    dy *= inv;
  }

  player.x += dx * player.speed * dt;
  player.y += dy * player.speed * dt;

  const half = player.size / 2;
  player.x = Math.max(half, Math.min(canvas.width - half, player.x));
  player.y = Math.max(half, Math.min(canvas.height - half, player.y));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(
    player.x - player.size / 2,
    player.y - player.size / 2,
    player.size,
    player.size
  );

  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e8ecf4";
    ctx.font = "32px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
  }
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  if (!paused) update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
