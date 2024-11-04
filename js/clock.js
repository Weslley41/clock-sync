function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatDate(minutes) {
  const tempDate = new Date(TODAY);
  tempDate.setMinutes(minutes);
  const stringTime = tempDate
    .toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");

  return "[" + stringTime + "]";
}

function formatTime(minutes) {
  const hours = Math.round(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

class MessageTime {
  constructor(parameters) {
    this.time = parameters.time;
    this.timeInMinutes = timeToMinutes(parameters.time);
    this.sendDelay = parameters.sendDelay;
    this.sender = parameters.sender;
  }

  basedOnServerClockString() {
    const serverTime = server.timeInMinutes + this.sendDelay;
    return `${formatDate(serverTime)} ${this.sender}`;
  }
  basedOnLogicClockString() {
    const logicTime = this.timeInMinutes + this.sender.differenceToLogicClock;
    return `${formatDate(logicTime)} ${this.sender}`;
  }
}

class Server {
  differenceToLogicClock = 0;

  constructor(parameters) {
    this.time = parameters.time;
    this.elementNote = parameters.elementNote;
    this.timeInMinutes = timeToMinutes(parameters.time);
    this.clients = [];
  }

  changeTime(newTime) {
    console.log('new time:', newTime)
    this.time = newTime;
    this.timeInMinutes = timeToMinutes(newTime);
  }

  updateDiffToLogicClock() {
    this.differenceToLogicClock = logicClockInMinutes - this.timeInMinutes;
  }

  addClient(client) {
    this.clients.push(client);
  }

  getMessagesOrder() {
    const messages = this.clients
      .flatMap((client) => client.history)
      .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

    return messages.map((message) => message.basedOnLogicClockString());
  }

  getLastMessagesOrder() {
    const lastMessages = [];
    server.clients.forEach((client) => {
      const lastMessage = client.history[client.history.length - 1];
      if (lastMessage) lastMessages.push(lastMessage);
    });

    return lastMessages.sort((a, b) => a.sendDelay - b.sendDelay);
  }

  syncClocks() {
    logicClockInMinutes = this.timeInMinutes;

    const clients = this.clients.filter((client) => client.time);
    clients.forEach((client) => {
      logicClockInMinutes += client.timeInMinutes;
    });
    console.log(clients)
    console.log(clients.length + 1)
    console.log(logicClockInMinutes)
    logicClockInMinutes = logicClockInMinutes / (clients.length + 1);

    this.updateDiffToLogicClock();
    clients.forEach((client) => client.updateDiffToLogicClock());
    return formatTime(logicClockInMinutes);
  }
}

class Client {
  differenceToLogicClock = 0;

  constructor(parameters) {
    this.name = parameters.name;
    this.elementNote = parameters.elementNote;
    this.elementOrder = parameters.elementOrder;
    this.history = [];
    if (parameters.time) {
      this.time = parameters.time;
      this.timeInMinutes = timeToMinutes(parameters.time);
    }
  }

  toString() {
    return this.name;
  }

  _calculateTimeDifference(time) {
    return timeToMinutes(time) - this.timeInMinutes;
  }

  updateDiffToLogicClock() {
    console.log('logicClockInMinutes:', logicClockInMinutes)
    console.log('this.timeInMinutes:', this.timeInMinutes)
    this.differenceToLogicClock = logicClockInMinutes - this.timeInMinutes;
    console.log('this.differenceToLogicClock:', this.differenceToLogicClock)
  }

  changeTime(newTime) {
    this.time = newTime;
    this.timeInMinutes = timeToMinutes(newTime);
  }

  sendMessage(time) {
    if (!this.time) {
      alert("Defina o horário da máquina antes de enviar uma mensagem.");
      return;
    }
    if (timeToMinutes(time) < this.timeInMinutes) {
      alert("Horário de envio não pode ser anterior ao horário da máquina.");
      return;
    }

    const message = new MessageTime({
      time,
      sendDelay: this._calculateTimeDifference(time),
      sender: this,
    });

    this.history.push(message);
    return message;
  }

  clear() {
    this.history = [];
  }
}

var logicClockInMinutes = 0;
const TODAY = new Date();
TODAY.setHours(0, 0, 0);
