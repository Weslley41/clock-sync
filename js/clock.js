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
  let hours = (minutes > 0 ? Math.floor(minutes / 60) : Math.ceil(minutes / 60))
  hours = hours.toString().padStart(2, "0");

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
      .sort((a, b) => {
        const timeA = a.timeInMinutes + a.sender.differenceToLogicClock;
        const timeB = b.timeInMinutes + b.sender.differenceToLogicClock;
        return timeA - timeB;
      });

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
    this.differenceToLogicClock = logicClockInMinutes - this.timeInMinutes;
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
