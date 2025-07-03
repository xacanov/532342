const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mods = {
  freecam: false,
  hatSwitch: false,
  fastPlace: false,
  weaponRadius: false
};

for (let mod in mods) {
  const box = document.getElementById(mod);
  if (box) box.onchange = e => mods[mod] = e.target.checked;
}

document.addEventListener("keydown", e => {
  if (e.code === "KeyR") socket.send(new Uint8Array([0x00]));
  if (e.code === "KeyF") mods.freecam = !mods.freecam;
  if (e.code === "KeyX") mods.hatSwitch = !mods.hatSwitch;
});

let players = [];
let myId = null;

const socket = new WebSocket("wss://game.glar.io");
socket.binaryType = "arraybuffer";

socket.onopen = () => {
  console.log("[WS] Connected");
  const nickname = "MODUSER";
  const nameBytes = new TextEncoder().encode(nickname);
  const buffer = new Uint8Array(1 + nameBytes.length);
  buffer[0] = 0x03;
  buffer.set(nameBytes, 1);
  socket.send(buffer);
  console.log("[WS] Sent join");
};

socket.onmessage = (event) => {
  const view = new DataView(event.data);
  const opcode = view.getUint8(0);

  // Тестовая декодировка игроков (примерный формат, зависит от серверного протокола)
  if (opcode === 0x10 || view.byteLength >= 17) {
    players = [];
    for (let i = 1; i < view.byteLength; i += 17) {
      const id = view.getUint32(i, true);
      const x = view.getFloat32(i + 4, true);
      const y = view.getFloat32(i + 8, true);
      const me = view.getUint8(i + 16) === 1;
      if (me && !myId) myId = id;
      players.push({ id, x, y, me });
    }
  }
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  players.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = p.id === myId ? "lime" : "blue";
    ctx.fill();
    if (mods.weaponRadius && p.id === myId) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 80, 0, Math.PI * 2);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
  requestAnimationFrame(draw);
}
draw();
