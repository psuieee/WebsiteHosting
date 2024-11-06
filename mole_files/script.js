const GAME_DURATION_SEC = 30;
const MOLE_LIFESPAN_MIN = 1000;
const MOLE_LIFESPAN_MAX = 3000;
const FramesPerSecond = 30

let highScore = 0;
let score = 0;

let gameLoop;
let moleTimeout;
let soundtrack;

function playBonkSound() {
    const bonkSound = new Audio('mole_files/bonk.mp3');
    bonkSound.play();
    bonkSound.onended = () => bonkSound.remove();
}

function updateTimer(finishTime) {
    const currentTime = new Date().getTime();
    const timeLeft = (finishTime - currentTime) / 1000;
    if (timeLeft <= 0) {
        document.getElementById('timer').innerText = '0.0';
    } else {
        document.getElementById('timer').innerText = timeLeft.toFixed(1);
    }
}

function updateScore() {
    document.getElementById('score').innerText = score;
}

function updateHighScore() {
    document.getElementById('high-score').innerText = highScore;
}

function spawnMole() {
    const moleImage = document.createElement('img');
    moleImage.src = 'mole_files/mole.png';
    moleImage.id = 'mole';
    moleImage.classList.add('mole');
    moleImage.style.position = 'absolute';
    moleImage.style.left = `${Math.random() * (window.innerWidth - 200) + 100}px`;
    moleImage.style.top = `${Math.random() * (window.innerHeight - 200) + 100}px`;
    moleImage.style.width = '100px';
    moleImage.style.height = '100px';
    moleImage.onmousedown = () => false;
    moleImage.addEventListener('click', () => {
        score++;
        updateScore();
        moleImage.remove();
        playBonkSound();
    });
    document.body.appendChild(moleImage);

    setTimeout(() => {
        if (moleImage.parentNode !== null) {
            moleImage.remove();
        }
    }, MOLE_LIFESPAN_MIN + Math.random() * (MOLE_LIFESPAN_MAX - MOLE_LIFESPAN_MIN));
}

function startMusic() {
    soundtrack = new Audio('mole_files/game_theme.mp3');
    soundtrack.loop = true;
    soundtrack.play();
}

function stopMusic() {
    soundtrack.pause();
    soundtrack = null;
}

function moleLoop() {
    const randomDelay = Math.floor(Math.random() * 2000) + 500;
    moleTimeout = setTimeout(() => {
        spawnMole();
        moleLoop();
    }, randomDelay);
}

function stopMoleLoop() {
    clearTimeout(moleTimeout);
}

function startGame() {
    document.getElementById('start-button').style.display = 'none';
    
    const gameFinishTime = new Date().getTime() + GAME_DURATION_SEC * 1000;
    updateTimer(gameFinishTime);
    
    startMusic();
    
    gameLoop = setInterval(() => {
        const currentTime = new Date().getTime();
        if (gameFinishTime <= currentTime) {
            endGame();
        }
        updateTimer(gameFinishTime);
    }, 1000 / FramesPerSecond);

    moleLoop();
}

function endGame() {
    stopMusic();
    
    clearInterval(gameLoop);
    gameLoop = null;

    stopMoleLoop();
    document.querySelectorAll('#mole').forEach(mole => mole.remove());

    if (score > highScore) {
        highScore = score;
    }
    score = 0;

    updateHighScore();
    updateScore();

    document.getElementsByClassName('game-over')[0].style.display = 'block';
    setTimeout(() => {
        document.getElementsByClassName('game-over')[0].style.display = 'none';
        document.getElementById('start-button').style.display = 'block';
    }, 3000);
}