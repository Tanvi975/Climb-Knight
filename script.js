const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const knightImg = new Image();
knightImg.src = 'assets/knight_spritesheet.png';
const player = { x: 185, y: 500, width: 60, height: 60, vx: 0, vy: 0, speed: 5, gravity: 0.4, jumpStrength: -8, isGrounded: false, frameX: 0, maxFrame: 5, frameTimer: 0, frameInterval: 6, facingRight: true };

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

    if (player.y + player.height >= 580) {
        player.y = 580 - player.height;
        player.vy = 0;
        player.isGrounded = true;
    }

    if (player.vx !== 0 && player.isGrounded) {
        player.frameTimer++;
        if (player.frameTimer >= player.frameInterval) {
            player.frameX++;
            if (player.frameX > player.maxFrame) {
                player.frameX = 0;
            }
            player.frameTimer = 0;
        }
    } else{
        player.frameX = 0;
        player.frameTimer = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(0, 580, canvas.width, 20);

    const frameWidth = knightImg.width / 6;
    const frameHeight = knightImg.height;

    if (frameWidth > 0) {
        ctx.save();
        if (!player.facingRight) {
            ctx.translate(player.x + player.width, player.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                knightImg,
                player.frameX * frameWidth, 0,
                frameWidth, frameHeight,
                0, 0,
                player.width, player.height
                );
        }
        else{
            ctx.drawImage(
                knightImg,
                player.frameX * frameWidth, 0,
                frameWidth, frameHeight,
                player.x, player.y,
                player.width, player.height
            );
        }
        ctx.restore();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();