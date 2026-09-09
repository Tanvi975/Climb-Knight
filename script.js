const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bgMusic = document.getElementById('bg-music');

bgMusic.volume = 0.5;
const knightImg = new Image();
knightImg.src = 'assets/knight_spritesheet.png';
const player = { x: 185, y: 500, width: 60, height: 60, vx: 0, vy: 0, speed: 5, gravity: 0.5, jumpStrength: -8, isGrounded: false, frameX: 0, maxFrame: 5, frameTimer: 0, frameInterval: 6, facingRight: true };
const monsterImg = new Image();
monsterImg.src = 'assets/monster_spritesheet.png';
const monsters = [];

const platformHeight = 16;
const verticalSpacing = 150;
const platformGap = verticalSpacing;
const platforms = [
    { x: 0, y: 500, width: 400, height: platformHeight },
    { x: 0, y: 500 - verticalSpacing, width: 400, height: platformHeight },
    { x: 0, y: 500 - (verticalSpacing * 2), width: 400, height: platformHeight },
    { x: 0, y: 500 - (verticalSpacing * 3), width: 400, height: platformHeight },
    { x: 0, y: 500 - (verticalSpacing * 4), width: 400, height: platformHeight }
];
for (let platform of platforms) {
    monsters.push({
        x: 100,
        y: platform.y - 50,
        width: 50,
        height: 50,
        speed: 2,
        direction: 1,
        platform: platform
    });
}
const keys = {};

window.addEventListener('keydown', function startMusic() {
    bgMusic.play();
}, { once: true });

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.code === 'Space') keys['Space'] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.code === 'Space') keys['Space'] = false;
});

function moveMonsters() {
    for (let monster of monsters) {
        let platform = monster.platform;
        if (platform) {
            monster.y = platform.y - monster.height;
            monster.x += monster.speed * monster.direction;
            if (monster.x + monster.width >= platform.x + platform.width) {
                monster.direction = -1;
            }
            if (monster.x <= platform.x) {
                monster.direction = 1;
            }
        }
    }
}

function update() {
    moveMonsters();
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

    if (player.y < 200) {
        player.y = 200;

        for (let platform of platforms) {
            platform.y += 2;
        }
    }

    player.isGrounded = false;

    for (let platform of platforms) {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height + 10 &&
            player.vy >= 0
        ) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
        }
    }


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
    } else {
        player.frameX = 0;
        player.frameTimer = 0;
    }
    createNewPlatforms();
}

function createNewPlatforms() {
    let minPlatformY = Math.min(...platforms.map(p => p.y));
    if (minPlatformY > 0) {
        platforms.push({
            x: 0,
            y: minPlatformY - verticalSpacing,
            width: 400,
            height: platformHeight
        });
        platforms.push(newPlatform);

        monsters.push({
            x: 100,
            y: newPlatform.y - 50,
            width: 50,
            height: 50,
            speed: 2,
            direction: 1,
            platform: newPlatform
        });
    }

    for (let i = platforms.length - 1; i >= 0; i--) {
        if (platforms[i].y > canvas.height) {
            platforms.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(0, 580, canvas.width, 20);

    ctx.fillStyle = '#5C4033';
    for (let platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

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
        } else {
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
    for (let monster of monsters) {
        ctx.drawImage(monsterImg, monster.x, monster.y, monster.width, monster.height);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();