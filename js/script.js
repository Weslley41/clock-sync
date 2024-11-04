const logTerminal = document.querySelector("#logTerminal");
const client1Order = document.getElementById("client1-order");
const client2Order = document.getElementById("client2-order");
const client3Order = document.getElementById("client3-order");
const client1Note = document.getElementById("client1-note");
const client2Note = document.getElementById("client2-note");
const client3Note = document.getElementById("client3-note");
const serverNote = document.getElementById("server-note");

const server = new Server({ time: "00:00", elementNote: serverNote });
const client1 = new Client({
  name: "Cliente 1",
  elementNote: client1Note,
  elementOrder: client1Order,
});
const client2 = new Client({
  name: "Cliente 2",
  elementNote: client2Note,
  elementOrder: client2Order,
});
const client3 = new Client({
  name: "Cliente 3",
  elementNote: client3Note,
  elementOrder: client3Order,
});
server.addClient(client1);
server.addClient(client2);
server.addClient(client3);

function handleSubmit(clientNumber) {
  const machineTime = document.getElementById(
    `client${clientNumber}MachineTime`
  ).value;
  const sendTime = document.getElementById(
    `client${clientNumber}SendTime`
  ).value;

  const client = server.clients[clientNumber - 1];
  client.changeTime(machineTime);
  const message = client.sendMessage(sendTime);
  if (message) {
    const messageStringTime = message.basedOnServerClockString();
    const delayString = formatTime(message.sendDelay);

    const serverMessage = `${messageStringTime} (+${delayString})`;
    const clientMessage = `${formatDate(
      message.timeInMinutes
    )} Horário do cliente`;

    addToTerminal(`${serverMessage}\n${clientMessage}`);
    updateOrder();
  }
}

function handleSyncClocks() {
  const logicClock = server.syncClocks();
  if (!logicClock) return;

  addToTerminal("Relógio lógico: " + logicClock);
  updateClockNotes();
  clearOrderMessages();
  server.getMessagesOrder().forEach((logMessage) => addToTerminal(logMessage));
}

function addToTerminal(string) {
  logTerminal.innerHTML += `<pre class="text-wrap">${string}</pre>`;
}

function updateClockNotes() {
  const clocks = [server, client1, client2, client3];

  clocks.forEach((clock) => {
    let minutesString = "--:--";
    if (clock.time) {
      minutesString = formatTime(clock.differenceToLogicClock);
      minutesString = minutesString.replaceAll("-", "");
      if (clock.differenceToLogicClock < 0) {
        minutesString = "-" + minutesString;
      }
    }

    clock.elementNote.innerText = "Acréscimo: " + minutesString;
  });
}

function clearOrderMessages() {
  client1Order.innerText = "";
  client2Order.innerText = "";
  client3Order.innerText = "";
}

function updateOrder() {
  clearOrderMessages();

  const lastMessages = [];
  server.clients.forEach((client) => {
    const lastMessage = client.history[client.history.length - 1];
    if (lastMessage) lastMessages.push(lastMessage);
  });

  server.getLastMessagesOrder().forEach((message, index) => {
    message.sender.elementOrder.innerText = `${index + 1}°`;
  });
}

function clearTerminal() {
  logTerminal.innerText = "";
  client1.clear();
  client2.clear();
  client3.clear();
}

const serverTime = document.getElementById("serverTime")
serverTime.addEventListener("change", (event) => server.changeTime(event.target.value));
