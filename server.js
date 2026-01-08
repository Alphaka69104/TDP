const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

let players = [];
let board = Array(9).fill(null);
let currentTurn = "X";

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", ws => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: "error", message: "Gioco pieno" }));
    ws.close();
    return;
  }

  const symbol = players.length === 0 ? "X" : "O";
  players.push({ ws, symbol });

  ws.send(JSON.stringify({
    type: "init",
    symbol,
    board,
    currentTurn
  }));

  broadcast({ type: "players", count: players.length });

  ws.on("message", msg => {
    const data = JSON.parse(msg);

    if (data.type === "move") {
      if (currentTurn !== symbol || board[data.index]) return;

      board[data.index] = symbol;
      currentTurn = currentTurn === "X" ? "O" : "X";

      broadcast({
        type: "update",
        board,
        currentTurn
      });
    }
  });

  ws.on("close", () => {
    players = players.filter(p => p.ws !== ws);
    board = Array(9).fill(null);
    currentTurn = "X";

    broadcast({
      type: "reset",
      message: "Un giocatore si è disconnesso. Partita resettata."
    });
  });
});

console.log("Server WebSocket attivo su ws://localhost:3000");
