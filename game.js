const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = {
  x: 90,
  y: 0,
  width: 44,
  height: 70,
  duckHeight: 38,
  velocityY: 0,
  grounded: true,
  ducking: false,
};

const obstacles = [];
const backgroundFar = [];
const backgroundNear = [];
const foreground = [];

let groundY = 0;
let speed = 360;
let score = 0;
let spawnTimer = 0;
let gameOver = false;
let paused = false;
let lastTime = performance.now();

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  groundY = Math.floor(canvas.height * 0.78);
  player.y = groundY - getPlayerHeight();
  fillLayer(backgroundFar, 16, canvas.height * 0.16, canvas.height * 0.16, 0.2);
  fillLayer(backgroundNear, 12, canvas.height * 0.42, canvas.height * 0.14, 0.45);
  fillLayer(foreground, 18, groundY + 36, canvas.height * 0.07, 1.25);
}

function fillLayer(layer, count, y, heightRange, speedRatio) {
  layer.length = 0;
  for (let index = 0; index < count; index += 1) {
    layer.push({
      x: (canvas.width / count) * index,
      y: y + Math.random() * heightRange,
      width: 30 + Math.random() * 90,
      height: 18 + Math.random() * heightRange,
      speedRatio,
    });
  }
}

function reset() {
  obstacles.length = 0;
  player.y = groundY - player.height;
  player.velocityY = 0;
  player.grounded = true;
  player.ducking = false;
  speed = 360;
  score = 0;
  spawnTimer = 0.8;
  gameOver = false;
}

function jump() {
  if (gameOver) {
    reset();
    return;
  }
  if (paused || !player.grounded) return;
  player.velocityY = -900;
  player.grounded = false;
  player.ducking = false;
}

function duck(isDucking) {
  if (!player.grounded || gameOver) return;
  player.ducking = isDucking;
  player.y = groundY - getPlayerHeight();
}

function spawnObstacle() {
  const type = Math.floor(Math.random() * 3);
  if (type === 0) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 58, width: 34, height: 58 });
  } else if (type === 1) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 38, width: 66, height: 38 });
  } else {
    obstacles.push({ x: canvas.width + 20, y: groundY - 132, width: 72, height: 30 });
  }
  spawnTimer = 0.75 + Math.random() * 0.75;
}

function update(dt) {
  moveLayer(backgroundFar, dt);
  moveLayer(backgroundNear, dt);
  moveLayer(foreground, dt);
  if (paused || gameOver) return;

  score += dt;
  speed = Math.min(760, 360 + score * 18);
  spawnTimer -= dt;
  if (spawnTimer <= 0) spawnObstacle();

  player.velocityY += 2600 * dt;
  player.y += player.velocityY * dt;
  const standingY = groundY - player.height;
  if (player.y >= standingY) {
    player.y = groundY - getPlayerHeight();
    player.velocityY = 0;
    player.grounded = true;
  }

  for (const obstacle of obstacles) {
    obstacle.x -= speed * dt;
  }
  while (obstacles.length && obstacles[0].x + obstacles[0].width < 0) {
    obstacles.shift();
  }

  const playerBox = getPlayerBox();
  if (obstacles.some((obstacle) => intersects(playerBox, obstacle))) {
    gameOver = true;
  }
}

function moveLayer(layer, dt) {
  for (const box of layer) {
    box.x -= speed * box.speedRatio * dt;
    if (box.x + box.width < 0) {
      box.x = canvas.width + Math.random() * 80;
    }
  }
}

function getPlayerHeight() {
  return player.ducking ? player.duckHeight : player.height;
}

function getPlayerBox() {
  return {
    x: player.x,
    y: player.y,
    width: player.ducking ? player.width + 28 : player.width,
    height: getPlayerHeight(),
  };
}

function intersects(a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawLayer(backgroundFar, "#dddddd");
  drawLayer(backgroundNear, "#bbbbbb");

  ctx.fillStyle = "#111111";
  ctx.fillRect(0, groundY, canvas.width, 4);

  ctx.fillStyle = "#000000";
  const playerBox = getPlayerBox();
  ctx.fillRect(playerBox.x, playerBox.y, playerBox.width, playerBox.height);

  ctx.fillStyle = "#444444";
  for (const obstacle of obstacles) {
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }

  drawLayer(foreground, "#777777");

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawLayer(layer, color) {
  ctx.fillStyle = color;
  for (const box of layer) {
    ctx.fillRect(box.x, box.y, box.width, box.height);
  }
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if ([" ", "arrowup", "arrowdown"].includes(key)) event.preventDefault();
  if ([" ", "arrowup", "w"].includes(key)) jump();
  if (["arrowdown", "s"].includes(key)) duck(true);
  if (key === "p") paused = !paused;
  if (key === "r") reset();
});
window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowdown", "s"].includes(key)) duck(false);
});
canvas.addEventListener("pointerdown", jump);

resize();
reset();
requestAnimationFrame(loop);