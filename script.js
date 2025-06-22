const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const player = { x: 180, y: 520, w: 40, h: 40, speed: 5 };
const bullets = [];

let keys = {};
let xp = 0, level = 1, score = 0, highScore = 0, bulletSpeed = 2;
let lastXPTime = 0, lastScoreTime = 0;
let alive = true;

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  // console.log('keydown:', e.key.toLowerCase());
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
  // console.log('keyup:', e.key.toLowerCase());
});

function spawnBullet() {
  const x = Math.random() * (canvas.width - 10);
  bullets.push({ x, y: 0, w: 10, h: 20, speed: bulletSpeed });
}

setInterval(() => {
  if (alive) spawnBullet();
}, 800);

function resetGame() {
  if (score > highScore) highScore = score;
  xp = 0; level = 1; score = 0; bulletSpeed = 2;
  bullets.length = 0;
  player.x = 180;
  player.y = 520;
  alive = true;
}

function update(timestamp = 0) {
  if (!alive) return;

  // תנועה של השחקן
  if (keys['w'] && player.y > 0) player.y -= player.speed;
  if (keys['s'] && player.y < canvas.height - player.h) player.y += player.speed;
  if (keys['a'] && player.x > 0) player.x -= player.speed;
  if (keys['d'] && player.x < canvas.width - player.w) player.x += player.speed;

  // עדכון כדורים יורדים
  bullets.forEach(b => b.y += b.speed);

  // עדכון XP כל שנייה
  if (!lastXPTime || timestamp - lastXPTime > 1000) {
    xp += 10;
    lastXPTime = timestamp;
  }

  // עדכון ניקוד כל שנייה
  if (!lastScoreTime || timestamp - lastScoreTime > 1000) {
    score += 5;
    lastScoreTime = timestamp;
  }

  // עלייה ברמה והאצת כדורים
  if (xp >= level * 500 && level < 10) {
    level++;
    bulletSpeed += 0.5;
    bullets.forEach(b => b.speed = bulletSpeed);
  }

  // בדיקת פגיעה של כדורים בשחקן
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (
      b.x < player.x + player.w &&
      b.x + b.w > player.x &&
      b.y < player.y + player.h &&
      b.y + b.h > player.y
    ) {
      alive = false;
      alert('💥 נפגעת! המשחק מתחיל מחדש.');
      resetGame();
      return;
    }

    // הסרת כדורים שיצאו מתחת למסך
    if (b.y > canvas.height) bullets.splice(i, 1);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ציור השחקן
  ctx.fillStyle = 'white';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // ציור הכדורים
  ctx.fillStyle = 'red';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

  // ציור הטקסטים
  ctx.fillStyle = 'lime';
  ctx.font = '20px Arial';
  ctx.fillText(`נקודות: ${score}`, 10, 25);
  ctx.fillText(`שלב: ${level}`, 300, 25);

  ctx.fillStyle = 'orange';
  ctx.fillText(`XP: ${xp}`, 10, 590);
  ctx.fillText(`שיא: ${highScore}`, 300, 590);
}

function loop(timestamp = 0) {
  update(timestamp);
  draw();
  requestAnimationFrame(loop);
}

loop();
