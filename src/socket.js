import { global } from "./global.js";

class Socket {
  constructor(addr) {
    this.addr = addr;
    this.canvas = false;
    this.ws = null;

    let flag = false;
    let commands = [false, false, false];

    this.cmd = {
      set: (index, value) => {
        if (commands[index] !== value || index === 0) {
          commands[index] = value;
          flag = true;
        }
      }, talk: () => {
        flag = false;
        let o = 0;

        for (let i = 0; i < commands.length; i++) {
          if (commands[i]) o |= (1 << i);
        }

        this.sendData("m", global.movement, o);
      }, ready: () => flag
    }
  }

  init(canvas) {
    this.ws = new WebSocket(this.addr);
    this.ws.binaryType = "arraybuffer";
    this.canvas = canvas;

    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
  }

  onOpen() {
    console.log("Connected to server.");
    this.ws.commandCycle = setInterval(() => this.talk(), 100);
    this.sendData("s", 0);

    global.gameStart = true;
    if (!this.canvas) {
      console.log("Something went wrong");
    } else {
      this.canvas.init();
    }
  }

  sendData(header, movement, flags) {
    const buffer = new ArrayBuffer(header === "s" ? 1 : 13);
    const view = new DataView(buffer);
    
    view.setInt8(0, header.charCodeAt(0));
    if (header === "s") {
      this.ws.send(buffer);
      return;
    }
    view.setInt16(1, global.target.x, true);
    view.setInt16(3, global.target.y, true);
    view.setFloat32(5, movement, true);
    view.setUint32(9, flags, true);
    this.ws.send(buffer);
  }

  onMessage(message) {
    const view = new DataView(message.data);
    const messageType = String.fromCharCode(view.getUint8(0));

    switch (messageType) {
      case 's':
        global.index = view.getUint32(1, true);
        break;
      case 'm':
        const map = { width: view.getUint32(1, true), height: view.getUint32(5, true) };
        Object.assign(global.map.serverData, map);
        break;
      case 'u':
        this.updateEntities(view);
        break;
    }
  }

  updateEntities(view) {
    const ids = new Set();
    let offset = 1;

    while (offset < view.byteLength) {
      const entityData = this.extractEntityData(view, offset);
      const entity = global.entities.get(entityData.id) || this.createEntity(entityData.id);
      this.updateEntity(entity, entityData);
      ids.add(entityData.id);
      offset += entityData.sizeBytes;
    }

    this.removeDeadEntities(ids);
  }

  extractEntityData(view, offset) {
    const pos = { x: view.getFloat64(offset, true), y: view.getFloat64(offset + 8, true) };
    const entityData = {
      size: view.getFloat32(offset + 16, true),
      angle: view.getFloat32(offset + 20, true),
      id: view.getInt32(offset + 24, true),
      mockupId: view.getInt32(offset + 28, true),
      health: view.getInt32(offset + 32, true),
      maxHealth: view.getInt32(offset + 36, true),
      team: view.getInt32(offset + 40, true),
      shape: view.getUint8(offset + 44, true),
      color: this.getColor(view, offset + 45),
    };
    return { ...entityData, pos, sizeBytes: 49 };
  }

  getColor(view, offset) {
    const r = view.getUint8(offset, true);
    const g = view.getUint8(offset + 1, true);
    const b = view.getUint8(offset + 2, true);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  createEntity(id) {
    const entity = {
      serverData: { x: 0, y: 0, angle: 0, health: 0, maxHealth: 0 },
      x: 0, y: 0, size: 0, angle: 0, health: 0, maxHealth: 0, color: "", team: 0, dead: false
    };
    global.entities.set(id, entity);
    return entity;
  }

  updateEntity(entity, { id, pos, size, angle, health, maxHealth, color, team, mockupId }) {
    entity.index = id;
    entity.xOld = entity.x || entity.serverData.x;
    entity.yOld = entity.y || entity.serverData.y;
    Object.assign(entity.serverData, { x: pos.x, y: pos.y, angle, health, maxHealth });
    Object.assign(entity, { size, color, team, mockupId });
    if (id === global.index) {
      Object.assign(global.player, { serverX: pos.x, serverY: pos.y, size, angle, color, team, mockupId });
    }
  }

  removeDeadEntities(ids) {
    for (const [id, entity] of global.entities) {
      if (!ids.has(id)) {
        entity.dead = true;
      }
    }
    global.entities = new Map([...global.entities].filter(([id, entity]) => ids.has(id) || !entity.dead || id === global.index));
  }

  onClose() {
    console.log("Connection closed.");
    clearInterval(this.ws.commandCycle);
    global.gameStart = false;
    global.disconnected = true;
  }
}

export { Socket };
