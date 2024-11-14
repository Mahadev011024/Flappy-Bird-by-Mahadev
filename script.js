const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

// Set canvas size
canvas.width = 320;
canvas.height = 480;

// Load bird, ground, and cloud images
const birdImg = new Image();
birdImg.src = "bird.png";
const groundImg = new Image();
groundImg.src = "ground.png";
const cloudImg = new Image();
cloudImg.src = "cloud.png";  // Ensure this path is correct for the cloud image

// Game variables
let birdX = 50;
let birdY = 150;
let birdSpeed = 0;
let gravity = 0.25;
let jump = -4.6;
let groundHeight = 70;
let gameOver = false;
let birdWidth = 30;
let birdHeight = 30;
let pipeWidth = 50;
let pipeGap = 150;
let pipeSpeed = 2;
let pipeFrequency = 100; // Every X frames, a new pipe is created

// Score variables
let score = 0;
let pipes = [];
let frameCount = 0;

// Cloud variables
let clouds = [];
let cloudSpeed = 1;  // Speed at which clouds move to the left
let cloudWidth = 60;  // Width of the cloud
let cloudHeight = 40; // Height of the cloud

// Function to make the bird jump
function flap() {
    if (!gameOver) {
        birdSpeed = jump;
    } else {
        restartGame();
    }
}

// Restart game function
function restartGame() {
    birdY = 150;
    birdSpeed = 0;
    pipes = [];
    score = 0; // Reset score when game restarts
    gameOver = false;
    frameCount = 0;
    clouds = []; // Clear clouds
    createClouds(); // Create new clouds
    flap();  // Make the bird jump automatically after restarting
    draw(); // Start drawing again after restart
}

// Show game over screen
function gameOverScreen() {
    gameOver = true;
    birdSpeed = 0;  // Freeze the bird's speed

    context.fillStyle = "#000";
    context.font = "20px Arial";
    context.fillText("Game Over! Tap to Restart", 50, canvas.height / 2);
}

// Add tap-to-jump event listeners
canvas.addEventListener("touchstart", flap);
canvas.addEventListener("mousedown", flap);

// Create pipes
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - groundHeight - pipeGap));
    pipes.push({
        x: canvas.width,
        y: pipeHeight,
    });
}

// Draw pipes
function drawPipes() {
    pipes.forEach((pipe, index) => {
        // Draw top pipe
        context.fillStyle = "#00cc66";
        context.fillRect(pipe.x, 0, pipeWidth, pipe.y);

        // Draw bottom pipe
        context.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - (pipe.y + pipeGap + groundHeight));

        // Move pipes leftward
        pipe.x -= pipeSpeed;

        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }

        // Increment score when bird passes through the pipe
        if (pipe.x + pipeWidth < birdX && !pipe.passed) {
            score++; // Increment score
            pipe.passed = true; // Mark pipe as passed
        }

        // Improved collision detection (touching the pipes)
        if (
            birdX + birdWidth > pipe.x &&
            birdX < pipe.x + pipeWidth &&
            (birdY < pipe.y || birdY + birdHeight > pipe.y + pipeGap)
        ) {
            gameOverScreen(); // Bird dies on collision
        }
    });
}

// Create clouds
function createClouds() {
    // Create a few clouds at random vertical positions
    for (let i = 0; i < 3; i++) {
        clouds.push({
            x: Math.random() * canvas.width + canvas.width,  // Random starting position off-screen
            y: Math.random() * (canvas.height / 2),         // Random vertical position
        });
    }
}

// Draw clouds
function drawClouds() {
    clouds.forEach((cloud, index) => {
        context.drawImage(cloudImg, cloud.x, cloud.y, cloudWidth, cloudHeight);  // Draw cloud

        // Move the cloud to the left
        cloud.x -= cloudSpeed;

        // Reset cloud position when it goes off-screen
        if (cloud.x + cloudWidth < 0) {
            cloud.x = canvas.width;  // Reset cloud to the right side
            cloud.y = Math.random() * (canvas.height / 2);  // Randomize vertical position
        }
    });
}

// Draw score on the canvas
function drawScore() {
    context.fillStyle = "#000";
    context.font = "20px Arial";
    context.fillText("Score: " + score, 20, 30);
}

// Main game loop
function draw() {
    if (gameOver) return; // Stop the loop if game is over

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky background
    context.fillStyle = "#70c5ce";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds (once the image is loaded)
    if (cloudImg.complete && cloudImg.naturalHeight !== 0) {
        drawClouds();  // Draw the clouds in the game loop
    }

    // Draw ground
    context.drawImage(groundImg, 0, canvas.height - groundHeight, canvas.width, groundHeight);

    // Draw bird (with fallback rectangle)
    if (birdImg.complete && birdImg.naturalHeight !== 0) {
        context.drawImage(birdImg, birdX, birdY, birdWidth, birdHeight);
    } else {
        // Fallback if bird image is not loaded
        context.fillStyle = "#ff0";
        context.fillRect(birdX, birdY, birdWidth, birdHeight);
    }

    // Only apply gravity and move the bird if the game is not over
    if (!gameOver) {
        birdSpeed += gravity;
        birdY += birdSpeed;
    }

    // Prevent the bird from going above the screen
    if (birdY < 0) {
        birdY = 0;
        birdSpeed = 0; // Stop bird movement if it reaches the top
    }

    // Prevent the bird from going below the ground
    if (birdY + birdHeight > canvas.height - groundHeight) {
        birdY = canvas.height - groundHeight - birdHeight; // Keep bird on the ground
        birdSpeed = 0; // Stop the bird from falling further
    }

    // Draw and update pipes
    drawPipes();

    // Increment frame count
    frameCount++;

    // Check if new pipes should be created based on frame count
    if (frameCount % pipeFrequency === 0) {
        createPipe();
    }

    // Draw score
    drawScore();

    // End game if bird hits the ground
    if (birdY + birdHeight >= canvas.height - groundHeight) {
        gameOverScreen();
        return;
    }

    requestAnimationFrame(draw); // Continue loop if game is not over
}

// Start the game once images are loaded
birdImg.onload = function () {
    groundImg.onload = function () {
        cloudImg.onload = function () {
            createClouds();  // Create clouds after image is loaded
            flap();  // Make the bird jump automatically when the game starts
            draw();
        };
    };
};

// Initialize the game
if (!birdImg.complete || !groundImg.complete || !cloudImg.complete) {
    birdImg.onload = groundImg.onload = cloudImg.onload = function () {
        createClouds();  // Create clouds after image is loaded
        flap();  // Make the bird jump automatically when the game starts
        draw();
    };
}
