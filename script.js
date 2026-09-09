const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bgMusic = document.getElementById('bg-music');
const coinDisplay = document.getElementById('coins');
const pointsDisplay = document.getElementById('points');

if (bgMusic) bgMusic.volume = 0.5;

let coinScore = 0;
let points = 0;

function updateScoreDisplay() {
    if (coinDisplay) coinDisplay.textContent = `Coins: ${coinScore}`;
    if (pointsDisplay) pointsDisplay.textContent = `Points: ${points}`;
}

const knightImg = new Image();
knightImg.src = 'assets/knight_spritesheet.png';

const player = {x: 185, y: 500, width: 60, height: 60, vx: 0, vy: 0, speed: 4, climbSpeed: 3, gravity: 0.5, jumpStrength: -8, isGrounded: false, isClimbing: false, frameX: 0, maxFrame: 5, frameTimer: 0, frameInterval: 6, facingRight: true};

const monsterImg = new Image();
monsterImg.src = 'assets/monster_spritesheet.png';
const monsters = [];

function moveMonsters() {
    for (let monster of monsters) {
        let platform = monster.platform;
        if (platform) {
            monster.y = platform.y - monster.height;
            monster.x += monster.speed * monster.direction;

            if (monster.x + monster.width >= platform.x + platform.width) {
                monster.x = platform.x + platform.width - monster.width;
                monster.direction = -1;
            } else if (monster.x <= platform.x) {
                monster.x = platform.x;
                monster.direction = 1;
            }

            monster.frameTimer++;
            if (monster.frameTimer >= monster.frameInterval) {
                monster.frameX = (monster.frameX + 1) % monster.walkFrames;
                monster.frameTimer = 0;
            }
        }
    }
}

const platformHeight = 16;
const verticalSpacing = 150;
const platformWidth = 400;

const platforms = [
    { x: 0, y: 500, width: platformWidth, height: platformHeight, passed: true }, 
    { x: 0, y: 500 - verticalSpacing, width: platformWidth, height: platformHeight, passed: false },
    { x: 0, y: 500 - (verticalSpacing * 2), width: platformWidth, height: platformHeight, passed: false },
    { x: 0, y: 500 - (verticalSpacing * 3), width: platformWidth, height: platformHeight, passed: false },
    { x: 0, y: 500 - (verticalSpacing * 4), width: platformWidth, height: platformHeight, passed: false }
];

function createMonster(platform) {
    const size = 50;
    return {
        x: platform.x + Math.random() * (platform.width - size),
        y: platform.y - size,
        width: size,
        height: size,
        speed: 1,
        direction: Math.random() < 0.5 ? 1 : -1,
        platform: platform,
        frameX: 0,
        totalCols: 6,
        walkFrames: 3,
        frameTimer: 0,
        frameInterval: 8,
        changeDirTimer: 0,
        changeDirInterval: 60 + Math.floor(Math.random() * 120)
    };
}

for (let i = 1; i < platforms.length; i++) {
    monsters.push(createMonster(platforms[i]));
}

const ladderWidth = 34;
const ladderMargin = 30;
const ladders = [];

const coinImg = new Image();
coinImg.src = 'assets/coin_spritesheet.png';

const coinSound = new Audio();
coinSound.src = 'assets/coin-music.mp3';

const coinSize = 24;
const coins = [];

function getRandomLadderX() {
    return ladderMargin + Math.random() * (platformWidth - ladderMargin * 2 - ladderWidth);
}

for (let i = 0; i < platforms.length; i++) {
    coins.push({
        x: 20 + Math.random() * (platformWidth - 40 - coinSize),
        y: platforms[i].y - coinSize - 4,
        width: coinSize,
        height: coinSize,
        frameX: 0,
        frameTimer: 0,
        frameInterval: 6
    });
}

for (let i = 1; i < platforms.length; i++) {
    ladders.push({
        x: getRandomLadderX(),
        y: platforms[i].y,
        width: ladderWidth,
        height: verticalSpacing
    });
}

const keys = {};

window.addEventListener('keydown', function startMusic() {
    if (bgMusic) bgMusic.play().catch(() => {});
}, { once: true });

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.code === 'Space') keys['Space'] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.code === 'Space') keys['Space'] = false;
});

function update() {
    moveMonsters();

    if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
        player.vx = -player.speed;
        player.facingRight = false;
    } else if (keys['d'] || keys['D'] || keys['ArrowRight']) {
        player.vx = player.speed;
        player.facingRight = true;
    } else {
        player.vx = 0;
    }

    let touchingLadder = null;
    for (let ladder of ladders) {
        if (
            player.x + player.width > ladder.x &&
            player.x < ladder.x + ladder.width &&
            player.y + player.height > ladder.y &&
            player.y < ladder.y + ladder.height
        ) {
            touchingLadder = ladder;
            break;
        }
    }

    const wantsToClimbUp = keys['w'] || keys['W'] || keys['ArrowUp'];
    const wantsToClimbDown = keys['s'] || keys['S'] || keys['ArrowDown'];

    if (touchingLadder && (wantsToClimbUp || wantsToClimbDown)) {
        player.isClimbing = true;
    }
    if (!touchingLadder) {
        player.isClimbing = false;
    }

    if (player.isClimbing) {
        if (wantsToClimbUp) {
            player.vy = -player.climbSpeed;
        } else if (wantsToClimbDown) {
            player.vy = player.climbSpeed;
            if (player.y + player.height >= touchingLadder.y + touchingLadder.height) {
                player.y = (touchingLadder.y + touchingLadder.height) - player.height;
                player.vy = 0;
                player.isClimbing = false;
                player.isGrounded = true;
            }
        } else {
            player.vy = 0;
        }

        if (keys['Space']) {
            player.vy = player.jumpStrength;
            player.isClimbing = false;
        }
    } else {
        if ((wantsToClimbUp || keys['Space']) && player.isGrounded) {
            player.vy = player.jumpStrength;
            player.isGrounded = false;
        }
        player.vy += player.gravity;
    }

    player.x += player.vx;
    player.y += player.vy;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    if (player.y < 200) {
        const scrollDelta = 200 - player.y;
        player.y = 200;

        for (let platform of platforms) platform.y += scrollDelta;
        for (let ladder of ladders) ladder.y += scrollDelta;
        for (let coin of coins) coin.y += scrollDelta;
    }

    player.isGrounded = false;
    for (let platform of platforms) {
        if (!platform.passed && player.y + player.height < platform.y) {
            platform.passed = true;
            points++;
            updateScoreDisplay();
        }

        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height + 10 &&
            player.vy >= 0
        ) {
            const hasLadderBelow = ladders.some(l => 
                player.x + player.width > l.x && 
                player.x < l.x + l.width && 
                Math.abs(l.y - platform.y) < 5
            );

            if (!player.isClimbing || !hasLadderBelow) {
                player.y = platform.y - player.height;
                player.vy = 0;
                player.isGrounded = true;
                player.isClimbing = false;
            }
        }
    }

    if (player.y + player.height >= 580) {
        player.y = 580 - player.height;
        player.vy = 0;
        player.isGrounded = true;
        player.isClimbing = false;
    }

    if ((player.vx !== 0 && player.isGrounded) || (player.isClimbing && player.vy !== 0)) {
        player.frameTimer++;
        if (player.frameTimer >= player.frameInterval) {
            player.frameX = (player.frameX + 1) % (player.maxFrame + 1);
            player.frameTimer = 0;
        }
    } else {
        player.frameX = 0;
        player.frameTimer = 0;
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];

        coin.frameTimer++;
        if (coin.frameTimer >= coin.frameInterval) {
            coin.frameX = (coin.frameX + 1) % 7;
            coin.frameTimer = 0;
        }

        if (
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y
        ) {
            coinScore++;
            points++;
            updateScoreDisplay();

            coinSound.currentTime = 0;
            coinSound.play().catch(() => {});
            coins.splice(i, 1);
        }
    }

    createNewPlatforms();
}

function createNewPlatforms() {
    let minPlatformY = Math.min(...platforms.map(p => p.y));

    if (minPlatformY > 0) {
        let newY = minPlatformY - verticalSpacing;

        const newPlatform = {
            x: 0,
            y: newY,
            width: platformWidth,
            height: platformHeight,
            passed: false
        };
        platforms.push(newPlatform);

        ladders.push({
            x: getRandomLadderX(),
            y: newY,
            width: ladderWidth,
            height: verticalSpacing
        });

        coins.push({
            x: 20 + Math.random() * (platformWidth - 40 - coinSize),
            y: newY - coinSize - 4,
            width: coinSize,
            height: coinSize,
            frameX: 0,
            frameTimer: 0,
            frameInterval: 6
        });

        monsters.push(createMonster(newPlatform));
    }

    for (let i = platforms.length - 1; i >= 0; i--) {
        if (platforms[i].y > canvas.height) {
            platforms.splice(i, 1);
        }
    }

    for (let i = ladders.length - 1; i >= 0; i--) {
        if (ladders[i].y > canvas.height) {
            ladders.splice(i, 1);
        }
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        if (coins[i].y > canvas.height) {
            coins.splice(i, 1);
        }
    }

    for (let i = monsters.length - 1; i >= 0; i--) {
        if (!platforms.includes(monsters[i].platform)) {
            monsters.splice(i, 1);
        }
    }
}

function drawLadders() {
    ctx.fillStyle = '#8B5A2B';
    for (let ladder of ladders) {
        ctx.fillRect(ladder.x, ladder.y, 4, ladder.height);
        ctx.fillRect(ladder.x + ladder.width - 4, ladder.y, 4, ladder.height);

        for (let rungY = ladder.y + 16; rungY < ladder.y + ladder.height; rungY += 16) {
            ctx.fillRect(ladder.x, rungY, ladder.width, 3);
        }
    }
}

function drawCoins() {
    const frameWidth = coinImg.width / 7;
    const frameHeight = coinImg.height;

    for (let coin of coins) {
        if (frameWidth > 0 && coinImg.complete) {
            ctx.drawImage(
                coinImg,
                coin.frameX * frameWidth, 0,
                frameWidth, frameHeight,
                coin.x, coin.y,
                coin.width, coin.height
            );
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawMonsters() {
    if (!monsterImg.complete || monsterImg.naturalWidth === 0) {
        for (let monster of monsters) {
            ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
        }
        return;
    }

    for (let monster of monsters) {
        const frameWidth = monsterImg.naturalWidth / monster.totalCols;
        const frameHeight = monsterImg.naturalHeight;
        const sourceX = monster.frameX * frameWidth;

        ctx.save();
        if (monster.direction === -1) {
            ctx.translate(monster.x + monster.width, monster.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                monsterImg,
                sourceX, 0,
                frameWidth, frameHeight,
                0, 0,
                monster.width, monster.height
            );
        } else {
            ctx.drawImage(
                monsterImg,
                sourceX, 0,
                frameWidth, frameHeight,
                monster.x, monster.y,
                monster.width, monster.height
            );
        }
        ctx.restore();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#5C4033';
    ctx.fillRect(0, 580, canvas.width, 20);

    drawLadders();

    ctx.fillStyle = '#5C4033';
    for (let platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    drawMonsters();

    const frameWidth = knightImg.width / 6;
    const frameHeight = knightImg.height;

    if (frameWidth > 0 && knightImg.complete) {
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
    } else {
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    drawCoins();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

updateScoreDisplay();
gameLoop();