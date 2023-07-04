import { Server } from "@hocuspocus/server";
import { Doc } from "yjs";
import { Awareness } from "y-protocols/awareness";
import { mockCellsToYDoc, mockJsonToYDoc } from "./utils/mockDataToYDoc.js";
import * as Y from "yjs";
import { SQLite } from "@hocuspocus/extension-sqlite";
import { debounce } from "./utils/debounce.js";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { yPrettyPrint } from "./utils/mockDataToYDoc.js";
import { Logger } from "@hocuspocus/extension-logger";
// import { mockJsonToYDoc } from "./utils/mockDataToYDoc.js";

let count = 0;
const debouncedLogChange = debounce(data => {
  console.log("changed! ", count);
  console.log("logging: ", data);
}, 1000);

const server = Server.configure({
  port: 1238,
  name: "pennant-hocuspocus-provider",

  extensions: [
    new SQLite({ database: "db.sqlite" }),
    new Logger({
      onLoadDocument: true,
      onChange: true,
      onConnect: false,
      onDisconnect: false,
      onUpgrade: false,
      onRequest: false,
      onListen: false,
      onDestroy: false,
      onConfigure: false
    })
  ],

  async connected() {
    console.log("connections: 🍉", server.getConnectionsCount());
  },

  async onChange(data) {
    count++;

    debouncedLogChange(data.context);
  },

  async onLoadDocument(data) {
    // mock data interception
    const doc = mockJsonToYDoc();
    yPrettyPrint(doc, "onLoadDocument: 🍎");
    return doc;
  }
});

server.listen();
