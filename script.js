let lastSendTimesDiff = {
  client1: null,
  client2: null,
  client3: null,
};

let sendOrder = [];

const today = new Date();
today.setHours(0, 0, 0);

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatDate(minutes) {
  const tempDate = new Date(today);
  tempDate.setMinutes(minutes);

  return tempDate.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateTimeDifference(start, end) {
  const diff = end - start;
  const hours = Math.floor(diff / 60)
    .toString()
    .padStart(2, "0");
  const mins = (diff % 60).toString().padStart(2, "0");
  return `+${hours}:${mins}`;
}

function submitAll() {
  handleSubmit(1);
  handleSubmit(2);
  handleSubmit(3);
}

function handleSubmit(clientNumber) {
  const serverTimeInput = document.querySelector("#serverTime").value;
  const machineTimeInput = document.querySelector(
    `#client${clientNumber}MachineTime`
  ).value;
  const sendTimeInput = document.querySelector(
    `#client${clientNumber}SendTime`
  ).value;

  if (!serverTimeInput || !machineTimeInput || !sendTimeInput) {
    alert(
      `Cliente ${clientNumber}: Por favor, preencha todos os campos de horário.`
    );
    return;
  }

  const serverTimeInMinutes = timeToMinutes(serverTimeInput);
  const machineTimeInMinutes = timeToMinutes(machineTimeInput);
  const sendTimeInMinutes = timeToMinutes(sendTimeInput);

  const timeDifference = sendTimeInMinutes - machineTimeInMinutes;

  if (timeDifference < 0) {
    alert(
      `Cliente ${clientNumber}: Horário inválido! Certifique-se que o horário de envio é maior ou igual o horário da máquina.`
    );
    return;
  }

  const serverReceiveTime = serverTimeInMinutes + timeDifference;

  const receiveTimeStr = formatDate(serverReceiveTime);
  const timeDiffStr = calculateTimeDifference(
    machineTimeInMinutes,
    sendTimeInMinutes
  );

  lastSendTimesDiff[`client${clientNumber}`] = timeDifference;
  updateSendOrder();

  const logTerminal = document.querySelector("#logTerminal");
  const logMessage =
    `[${receiveTimeStr}] Cliente ${clientNumber} enviou uma mensagem.\n` +
    `> Horário da máquina cliente: ${machineTimeInput}\n` +
    `> Horário de envio: ${sendTimeInput} (${timeDiffStr})\n`;
  logTerminal.innerHTML += `<pre class="text-wrap">${logMessage}</pre>`;
  logTerminal.scrollTop = logTerminal.scrollHeight;
}

function clearTerminal() {
  const logTerminal = document.querySelector("#logTerminal");
  logTerminal.innerText = "";
}

function updateSendOrder() {
  const indexedClients = Object.entries(lastSendTimesDiff)
    .map((entry, index) => ({
      value: entry[1],
      index: index + 1,
    }));

  sendOrder = indexedClients
    .filter((client) => client.value !== null)
    .sort((a, b) => a.value - b.value)
    .map((client) => client.index);

  updateClientOrderDisplay();
}

function updateClientOrderDisplay() {
  sendOrder.forEach((clientNumber, index) => {
    const clientTitle = document.querySelector(`#client${clientNumber}Title`);
    clientTitle.textContent = `Cliente ${clientNumber} (ordem ${index + 1}º)`;
  });
}
