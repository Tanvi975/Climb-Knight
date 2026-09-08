const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const knightImg = new Image();
knightImg.src = 'knight.png';

const player = { x: 185, y: 500, width: 30, height: 35, vx: 0, vy: 0, speed: 5, gravity: 0.4, jumpStrength: -8, isGrounded: false };

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.code === 'Space') keys['Space'] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.code === 'Space') keys['Space'] = false;
});

function update() {
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
        player.vx = -player.speed;
    } else if (keys['d'] || keys['D'] || keys['ArrowRight']) {
        player.vx = player.speed;
    } else {
        player.vx = 0;
    }

    if ((keys['w'] || keys['W'] || keys['Space'] || keys['ArrowUp']) && player.isGrounded) {
        player.vy = player.jumpStrength;
        player.isGrounded = false;
    }

    player.vy += player.gravity;
    player.x += player.vx;
    player.y += player.vy;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    if (player.y + player.height >= 560) {
        player.y = 560 - player.height;
        player.vy = 0;
        player.isGrounded = true;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'slategrey';
    ctx.fillRect(0, 560, canvas.width, 40);

    ctx.drawImage(knightImg, player.x, player.y, player.width, player.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();