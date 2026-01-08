const ws = new WebSocket("ws://localhost:3000");
const cells = document.querySelectorAll(".cell");
const status = document.getElementById("status");

let mySymbol = null;
let board = [];

ws.onmessage = event => {
  const data = JSON.parse(event.data);

  if (data.type === "init") {
    mySymbol = data.symbol;
    board = data.board;
    updateBoard();
    status.textContent = `Sei il giocatore ${mySymbol}`;
  }

  if (data.type === "update") {
    board = data.board;
    updateBoard();
    status.textContent = `Turno di ${data.currentTurn}`;
  }

  if (data.type === "reset") {
    board = Array(9).fill(null);
    updateBoard();
    status.textContent = data.message;
  }
};

cells.forEach(cell => {
  cell.addEventListener("click", () => {
    const index = cell.dataset.index;
    ws.send(JSON.stringify({ type: "move", index }));
  });
});

function updateBoard() {
  cells.forEach((cell, i) => {
    cell.textContent = board[i] || "";
  });
}
