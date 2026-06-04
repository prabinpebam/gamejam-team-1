const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = {
  x: 90,
  y: 0,
  width: 44,
  height: 70,
  velocityY: 0,
  grounded: true,
};

const obstacles = [];
const backgroundFar = [];
const backgroundNear = [];
const foreground = [];

const worlds = [
  {
    background: "assets/world-1/background.png",
    character: "assets/world-1/character/character.png",
    obstacles: [
      "assets/world-1/obstacles/image 12.png",
      "assets/world-1/obstacles/image 13.png",
    ],
    parallax1: [
      "assets/world-1/parallax-1/image 6.png",
      "assets/world-1/parallax-1/image 8.png",
      "assets/world-1/parallax-1/image 9.png",
      "assets/world-1/parallax-1/image 10.png",
    ],
    parallax2: [
      "assets/world-1/parallax-2/image 6.png",
      "assets/world-1/parallax-2/image 8.png",
      "assets/world-1/parallax-2/image 9.png",
      "assets/world-1/parallax-2/image 10.png",
    ],
    parallax3: [
      "assets/world-1/parallax-3/01-parallax-3-asset.png",
      "assets/world-1/parallax-3/02-parallax-3-asset.png",
    ],
  },
  {
    background: "assets/world-2/background.png",
    character: "assets/world-2/character/character.png",
    obstacles: [
      "assets/world-2/obstacles/image 12.png",
      "assets/world-2/obstacles/image 13.png",
    ],
    parallax1: [
      "assets/world-2/parallax-1/WastelandMidground001.png",
    ],
    parallax2: [
      "assets/world-2/parallax-2/Wasteland_Background001 1.png",
    ],
    parallax3: [
      "assets/world-2/parallax-3/01-parallax-3-asset.png",
      "assets/world-2/parallax-3/02-parallax-3-asset.png",
    ],
  },
];

let currentWorldIndex = 0;
let parallax3Images = [];
let parallax2Images = [];
let parallax1Images = [];
let obstacleImages = [];
let characterImage = null;
let backgroundImage = null;

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
  player.x = canvas.width * 0.09;
  player.height = canvas.height * 0.2;
  player.width = player.height * 0.55;
  player.y = groundY - player.height;
  fillParallax3();
  fillParallax2();
  fillForeground();
}

function loadImage(src) {
  const image = new Image();
  image.src = src;
  image.addEventListener("load", draw);
  return image;
}

function loadWorld(index) {
  currentWorldIndex = index;
  const world = worlds[currentWorldIndex];
  parallax3Images = world.parallax3.map(loadImage);
  parallax2Images = world.parallax2.map(loadImage);
  parallax1Images = world.parallax1.map(loadImage);
  obstacleImages = world.obstacles.map(loadImage);
  characterImage = loadImage(world.character);
  backgroundImage = loadImage(world.background);
  if (canvas.width && canvas.height) {
    fillParallax3();
    fillParallax2();
    fillForeground();
  }
  draw();
}

function switchWorld() {
  loadWorld((currentWorldIndex + 1) % worlds.length);
}

function fillLayer(layer, count, bottomY, speedRatio) {
  layer.length = 0;
  for (let index = 0; index < count; index += 1) {
    const height = canvas.height * (0.025 + Math.random() * 0.08);
    layer.push({
      x: (canvas.width / count) * index,
      y: bottomY - height,
      width: canvas.width * (0.03 + Math.random() * 0.08),
      height,
      bottomY,
      speedRatio,
    });
  }
}

function fillForeground() {
  foreground.length = 0;
  const count = 5;
  for (let index = 0; index < count; index += 1) {
    const height = canvas.height * (0.08 + Math.random() * 0.06);
    const bottomY = canvas.height;
    foreground.push({
      x: (canvas.width / count) * index,
      y: bottomY - height,
      width: canvas.width * (0.18 + Math.random() * 0.1),
      height,
      bottomY,
      speedRatio: 1.25,
      imageIndex: randomParallax1ImageIndex(),
    });
  }
}

function fillParallax3() {
  backgroundFar.length = 0;
  const count = 8;
  for (let index = 0; index < count; index += 1) {
    const width = canvas.width * (0.18 + Math.random() * 0.12);
    backgroundFar.push({
      x: (canvas.width / count) * index,
      y: 0,
      width,
      bottomY: groundY * 0.62,
      speedRatio: 0.2,
      imageIndex: randomParallax3ImageIndex(),
    });
  }
}

function fillParallax2() {
  backgroundNear.length = 0;
  const count = 6;
  for (let index = 0; index < count; index += 1) {
    backgroundNear.push({
      x: (canvas.width / count) * index,
      y: 0,
      width: canvas.width * (0.18 + Math.random() * 0.1),
      bottomY: groundY * 0.76,
      speedRatio: 0.45,
      imageIndex: randomParallax2ImageIndex(),
    });
  }
}

function randomParallax3ImageIndex() {
  return Math.floor(Math.random() * parallax3Images.length);
}

function randomParallax2ImageIndex() {
  return Math.floor(Math.random() * parallax2Images.length);
}

function randomParallax1ImageIndex() {
  return Math.floor(Math.random() * parallax1Images.length);
}

function getBaseSpeed() {
  return canvas.width * 0.28;
}

function reset() {
  obstacles.length = 0;
  player.y = groundY - player.height;
  player.velocityY = 0;
  player.grounded = true;
  speed = getBaseSpeed();
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
  player.velocityY = -canvas.height * 1.6;
  player.grounded = false;
}

function spawnObstacle() {
  const type = Math.floor(Math.random() * 2);
  if (type === 0) {
    const height = player.height * 0.45;
    obstacles.push({
      x: canvas.width + canvas.width * 0.02,
      y: groundY - height,
      width: player.width * 0.55,
      height,
      imageIndex: 0,
    });
  } else if (type === 1) {
    const height = player.height * 0.28;
    obstacles.push({
      x: canvas.width + canvas.width * 0.02,
      y: groundY - height,
      width: player.width * 1.25,
      height,
      imageIndex: 1,
    });
  }
  spawnTimer = 0.75 + Math.random() * 0.75;
}

function update(dt) {
  moveLayer(backgroundFar, dt);
  moveLayer(backgroundNear, dt);
  moveLayer(foreground, dt);
  if (paused || gameOver) return;

  score += dt;
  speed = Math.min(canvas.width * 0.62, getBaseSpeed() + score * canvas.width * 0.014);
  spawnTimer -= dt;
  if (spawnTimer <= 0) spawnObstacle();

  player.velocityY += canvas.height * 4.6 * dt;
  player.y += player.velocityY * dt;
  const standingY = groundY - player.height;
  if (player.y >= standingY) {
    player.y = standingY;
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
      box.x = canvas.width + Math.random() * canvas.width * 0.08;
      if (layer === backgroundFar) {
        box.width = canvas.width * (0.18 + Math.random() * 0.12);
        box.imageIndex = randomParallax3ImageIndex();
      } else if (layer === backgroundNear) {
        box.width = canvas.width * (0.18 + Math.random() * 0.1);
        box.imageIndex = randomParallax2ImageIndex();
      } else if (layer === foreground) {
        box.width = canvas.width * (0.18 + Math.random() * 0.1);
        box.height = canvas.height * (0.08 + Math.random() * 0.06);
        box.y = box.bottomY - box.height;
        box.imageIndex = randomParallax1ImageIndex();
      }
    }
  }
}

function getPlayerBox() {
  return {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
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
  drawBackgroundImage();

  drawParallax3();
  drawParallax2();

  ctx.fillStyle = "#111111";
  ctx.fillRect(0, groundY, canvas.width, canvas.height * 0.008);

  drawCharacter();

  drawObstacles();

  drawParallax1();

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawBackgroundImage() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!backgroundImage || !backgroundImage.complete || backgroundImage.naturalWidth === 0) return;

  const imageRatio = backgroundImage.naturalWidth / backgroundImage.naturalHeight;
  const canvasRatio = canvas.width / canvas.height;
  let width = canvas.width;
  let height = canvas.height;
  if (imageRatio > canvasRatio) {
    width = canvas.height * imageRatio;
  } else {
    height = canvas.width / imageRatio;
  }
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;
  ctx.drawImage(backgroundImage, x, y, width, height);
}

function drawLayer(layer, color) {
  ctx.fillStyle = color;
  for (const box of layer) {
    ctx.fillRect(box.x, box.y, box.width, box.height);
  }
}

function drawCharacter() {
  const playerBox = getPlayerBox();
  if (!characterImage || !characterImage.complete || characterImage.naturalWidth === 0) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(playerBox.x, playerBox.y, playerBox.width, playerBox.height);
    return;
  }

  ctx.drawImage(characterImage, playerBox.x, playerBox.y, playerBox.width, playerBox.height);
}

function drawObstacles() {
  ctx.fillStyle = "#444444";
  for (const obstacle of obstacles) {
    const image = obstacleImages[obstacle.imageIndex];
    if (!image || !image.complete || image.naturalWidth === 0) {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      continue;
    }
    ctx.drawImage(image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }
}

function drawParallax3() {
  for (const box of backgroundFar) {
    const image = parallax3Images[box.imageIndex];
    if (!image || !image.complete || image.naturalWidth === 0) continue;
    const height = box.width * (image.naturalHeight / image.naturalWidth);
    box.y = box.bottomY - height;
    ctx.drawImage(image, box.x, box.y, box.width, height);
  }
}

function drawParallax2() {
  for (const box of backgroundNear) {
    const image = parallax2Images[box.imageIndex];
    if (!image || !image.complete || image.naturalWidth === 0) continue;
    const height = box.width * (image.naturalHeight / image.naturalWidth);
    box.y = box.bottomY - height;
    ctx.drawImage(image, box.x, box.y, box.width, height);
  }
}

function drawParallax1() {
  for (const box of foreground) {
    const image = parallax1Images[box.imageIndex];
    if (!image || !image.complete || image.naturalWidth === 0) continue;
    const height = box.width * (image.naturalHeight / image.naturalWidth);
    box.y = box.bottomY - height;
    ctx.drawImage(image, box.x, box.y, box.width, height);
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
  if ([" ", "arrowup"].includes(key)) event.preventDefault();
  if ([" ", "arrowup", "w"].includes(key)) jump();
  if (key === "p") paused = !paused;
  if (key === "r") reset();
  if (key === "t") switchWorld();
});
canvas.addEventListener("pointerdown", jump);

loadWorld(0);
resize();
reset();
requestAnimationFrame(loop);