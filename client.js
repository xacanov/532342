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

let players = [{ x: 300, y: 300 }]; // статично — чтобы было видно
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
  console.log("[WS] Received data len:", event.data.byteLength);
  // Статичная точка для теста
  players = [{ x: 300, y: 300 }];
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  players.forEach(p => {
    if (p?.x && p?.y) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = "lime";
      ctx.fill();
      if (mods.weaponRadius) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 80, 0, Math.PI * 2);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  });
  requestAnimationFrame(draw);
}
draw();

