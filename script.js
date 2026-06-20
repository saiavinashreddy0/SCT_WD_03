let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; 
let isGameActive = true;
let playAgainstAI = false;

let scores = { X: 0, O: 0, Ties: 0 };

const cells = document.querySelectorAll('.cell');
const resultOverlay = document.getElementById('resultOverlay');
const resultMessage = document.getElementById('resultMessage');
const nextRoundBtn = document.getElementById('nextRoundBtn');
const resetBtn = document.getElementById('resetBtn');

const scoreCardX = document.getElementById('scoreCardX');
const scoreCardO = document.getElementById('scoreCardO');
const labelO = document.getElementById('labelO');

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// 1. Initialize Action Event Listeners
document.getElementById('modePVP').addEventListener('click', (e) => switchMode(false, e.target));
document.getElementById('modeAI').addEventListener('click', (e) => switchMode(true, e.target));
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
nextRoundBtn.addEventListener('click', resetBoardOnly);
resetBtn.addEventListener('click', resetEverything);

function switchMode(aiMode, buttonElement) {
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    playAgainstAI = aiMode;
    labelO.textContent = aiMode ? "AI ROT" : "O PLAYER";
    resetEverything();
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[clickedIndex] !== "" || !isGameActive) return;

    makeMove(clickedIndex, currentPlayer);
    checkForResult();

    if (playAgainstAI && isGameActive && currentPlayer === "O") {
        setTimeout(makeAIMove, 400); // Small realistic delay for AI calculation
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player === "X" ? 'x-marker' : 'o-marker');
    
    // Toggle player alignment tracking
    currentPlayer = player === "X" ? "O" : "X";
    toggleTurnVisuals();
}

function toggleTurnVisuals() {
    if (currentPlayer === "X") {
        scoreCardX.classList.add('active-turn');
        scoreCardO.classList.remove('active-turn');
    } else {
        scoreCardO.classList.add('active-turn');
        scoreCardX.classList.remove('active-turn');
    }
}

// 2. Intelligent AI Bot Logic (Prioritizes winning moves, then blocks user)
function makeAIMove() {
    let bestMove = findStrategicMove("O"); // Check if AI can win immediately
    if (bestMove === null) bestMove = findStrategicMove("X"); // Block user from winning
    if (bestMove === null) bestMove = boardState[4] === "" ? 4 : null; // Secure optimal center spot
    if (bestMove === null) {
        // Fallback to picking any random vacant slot
        const emptyIndices = boardState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
        bestMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (bestMove !== undefined && bestMove !== null) {
        makeMove(bestMove, "O");
        checkForResult();
    }
}

function findStrategicMove(player) {
    for (let condition of winningConditions) {
        const values = condition.map(index => boardState[index]);
        const playerCount = values.filter(val => val === player).length;
        const emptyCount = values.filter(val => val === "").length;

        if (playerCount === 2 && emptyCount === 1) {
            return condition[values.indexOf("")];
        }
    }
    return null;
}

// 3. Score Evaluators
function checkForResult() {
    let roundWon = false;
    let winner = "";

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            roundWon = true;
            winner = boardState[a];
            break;
        }
    }

    if (roundWon) {
        endMatch(`${winner} Wins the Match`);
        scores[winner]++;
        updateScoreboard();
        return;
    }

    if (!boardState.includes("")) {
        endMatch("Match Settled in Tie");
        scores.Ties++;
        updateScoreboard();
    }
}

function endMatch(message) {
    resultMessage.textContent = message;
    resultOverlay.classList.add('active');
    isGameActive = false;
}

function updateScoreboard() {
    document.getElementById('scoreX').textContent = scores.X;
    document.getElementById('scoreO').textContent = scores.O;
    document.getElementById('scoreTies').textContent = scores.Ties;
}

function resetBoardOnly() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    currentPlayer = "X";
    toggleTurnVisuals();
    resultOverlay.classList.remove('active');
    
    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = 'cell';
    });
}

function resetEverything() {
    scores = { X: 0, O: 0, Ties: 0 };
    updateScoreboard();
    resetBoardOnly();
}