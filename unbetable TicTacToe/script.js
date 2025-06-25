const boxes = document.querySelectorAll(".box");
const boxTexts = document.querySelectorAll(".boxtext");
const infoText = document.querySelector(".info");
const resetBtn = document.getElementById("reset");
let gameover = new Audio("victory.mp3")
let audioTurn = new Audio("ting.mp3")

const starterSelect = document.getElementById("starter");
const startGameBtn = document.getElementById("startGame");

let board = Array(9).fill("");
let currentPlayer = "X";
const aiPlayer = "O";
let isGameOver = false;

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWinner(bd) {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) return bd[a];
  }
  return bd.includes("") ? null : "Draw";
}

function renderBoard() {
  boxTexts.forEach((el, idx) => {
    el.textContent = board[idx];
  });
}

function handleClick(e) {
  const idx = +e.target.getAttribute("box-index");
  if (board[idx] || isGameOver || currentPlayer !== "X") return;
  audioTurn.play()

  board[idx] = currentPlayer;
  renderBoard();

  const winner = checkWinner(board);
  if (winner) {
    endGame(winner);
    return;
  }

  currentPlayer = aiPlayer;
  infoText.textContent = "AI thinking...";
  setTimeout(() => {
    const bestMove = minimax(board, aiPlayer).index;
    board[bestMove] = aiPlayer;
    renderBoard();

    const winnerAfterAi = checkWinner(board);
    if (winnerAfterAi) {
      endGame(winnerAfterAi);
    } else {
      currentPlayer = "X";
      infoText.textContent = "your turn X";
    }
  }, 400);
}

function endGame(winner) {
  isGameOver = true;
  gameover.play()
  infoText.textContent = winner === "Draw" ? "It's a draw!" : `${winner} wins!`;
}


//Unbeatble AI using MiniMax algorithm.
function minimax(newBoard, player) {
  const availSpots = newBoard.map((v, i) => v === "" ? i : null).filter(i => i !== null);

  const winner = checkWinner(newBoard);
  if (winner === "X") return { score: -10 };
  if (winner === "O") return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i of availSpots) {
    const move = {};
    move.index = i;
    newBoard[i] = player;

    const result = minimax(newBoard, player === "O" ? "X" : "O");
    move.score = result.score;

    newBoard[i] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    for (let i in moves) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i in moves) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function resetGame(startWithAI = false) {
  board = Array(9).fill("");
  isGameOver = false;
  currentPlayer = startWithAI ? aiPlayer : "X";
  renderBoard();
  infoText.textContent = startWithAI ? "AI starts..." : "your turn X";

  if (startWithAI) {
    setTimeout(() => {
      const bestMove = minimax(board, aiPlayer).index;
      board[bestMove] = aiPlayer;
      renderBoard();
      currentPlayer = "X";
      infoText.textContent = "your turn X";
    }, 500);
  }
}

// Hook buttons
resetBtn.addEventListener("click", () => {
  starterSelect.disabled = false;
  resetGame(false);
});

startGameBtn.addEventListener("click", () => {
  const first = starterSelect.value;
  starterSelect.disabled = true;
  resetGame(first === "ai");
});

// Enable box clicks
boxes.forEach(box => box.addEventListener("click", handleClick));

// Initial setup
renderBoard();
