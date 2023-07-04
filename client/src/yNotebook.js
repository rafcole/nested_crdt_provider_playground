"use strict";

import * as Y from "yjs";
import { v4 } from "uuid";
import { WebsocketProvider } from "y-websocket";

export default class YNotebook {
  constructor(rootYdoc, setCells) {
    console.log("newYdoc instantiated locally");
    // this is dangerous, do not use except for console logs
    // you break it you debug it
    this.rootYdoc = rootYdoc;

    this.provider = new WebsocketProvider(
      "ws://localhost:1234",
      "test room",
      rootYdoc
    );
    this.provider.on("status", event => {
      console.log(event.status); // logs "connected" or "disconnected"
      this.logSnapshot("provider status change");
    });

    this.provider.on("sync", isSynced => {
      console.log("\n\nSync event detected - isSynced arg === ", isSynced);

      console.log(
        "rootYDoc sync snapshot ==> ",
        rootYdoc.get("notebookData").toJSON()
      );
    });

    // connected/disconnected
    this.provider.on("status", event => {
      console.log(
        "\n\n PROVIDER STATUS CHANGE ########## provider status change => " +
          event.status +
          " at " +
          new Date().toLocaleString() +
          "\n\n"
      );
    });

    this.cellCount = 0;

    this.rootYdoc.on("subdocs", (changes, added, removed) => {
      console.log("\n\nsubdocs event");
      console.log("==> added - ", added);
      console.log("==> changes - ", changes);
      // console.log("==> changes - ", changes);
    });

    this.notebookData = rootYdoc.getMap("notebookData");
    let notebookIsEmpty = Object.keys(this.notebookData.toJSON()).length === 0;

    if (notebookIsEmpty) {
      console.log("empty notebook");
      const cellData = new Y.Map();
      this.rawCellData = this.notebookData.set("rawCellData", cellData);
      const cellOrderArr = new Y.Array();
      this.notebookData.set("cellOrderArr", cellOrderArr);
    }

    this.cellOrderArr = this.notebookData.get("cellOrderArr");

    // this works
    this.cellOrderArr.observe(yarrayEvent => {
      console.log("\n\ncellOrderArr event observed => ", yarrayEvent);
      console.log(this.cellOrderArr.toArray());
      console.log("________________________");
    });
    console.log("this.cellOrderArr in constructor: ", this.cellOrderArr);

    // IMPORTING APP LOGIC (cells, useEffect...)
    this.cells = [];
    this.setCells = setCells;
    this.updateCells();
    this.undoManagers = {};
  }

  subscribeCellOrder() {
    // return a function that unsubscribes?
  }

  getSnapshot;

  logSnapshot(msg) {
    console.log(
      msg + "notebook snapshot ==> ",
      this.rootYdoc.get("notebookData").toJSON()
    );
  }
  createUndoManager(ytext, cellId) {
    const undoManager = new Y.UndoManager(ytext);
    this.undoManagers[cellId] = undoManager;
    console.log(this.undoManagers);
    return undoManager;
  }

  getOrderedCellJSArr() {
    return this.cellOrderArr.toArray();
  }

  updateCells = () => {
    this.cells = this.getOrderedCellData();
    this.setCells(this.cells);
  };

  deleteCell = id => {
    this.rawCellData.delete(id);
    this.updateCells();
  };

  getUndoManagerByCellId(id) {
    return this.undoManagers[id];
  }

  // addCellAtIndex(idx, type, text = "default", id = null) {
  //   if (!this.cellOrderArr) {
  //     throw "this.cellOrderArr is undefined";
  //   }
  //   const foo = this.cellOrderArr;
  //   console.log(this.cellOrderArr);
  //   console.log("cellOrderArr inside AddCellAtIndex: ", foo);
  //   console.log(
  //     "cellOrderArr.toString() inside add cellAtIndex: ",
  //     this.cellOrderArr.toArray()
  //   );

  //   const { cellId } = this.createCell(type, text, id);
  //   // if (idx === this.cellOrderArr.length) {
  //   console.log("cellOrderArr Length === ", this.cellOrderArr);
  //   // this.addCellAtEnd(type, text, id);
  //   // } else {
  //   this.cellOrderArr.insert(idx, [cellId]);
  //   // }
  //   this.updateCells();
  // }

  addCellAtIndex = (idx, type, textStr, id) => {
    console.log("\n\n\naddCellAtIndex");
    console.log(`==> idx: `, idx);
    console.log(`==> type: `, type);
    console.log(`==> text: `, textStr);
    console.log(`==> id: `, id);

    console.log(this.getOrderedCellData.toJSON);
    console.log("__________________________");
    const { cellId } = this.createCell(type, textStr, id);
    if (idx >= this.cellOrderArr.toArray().length) {
      this.cellOrderArr.push([cellId]);
    } else {
      this.cellOrderArr.insert(idx, [cellId]);
    }
    this.updateCells();
    console.log("addCellAtIndex complete\n\n\n");
  };

  // add a cell to the root notebook
  createCell(type, text = "cells empty by default", id) {
    // text needs to be yText for magic change properties
    // id and type should be functionally immutable
    const cellId = id || v4();
    const yText = new Y.Text();
    const cellYMap = new Y.Map();

    cellYMap.set("type", type);
    cellYMap.set("text", yText);
    yText.insert(0, text);
    cellYMap.set("id", id);
    cellYMap.set("modifiedSinceLastExecution", true);

    this.rawCellData.set(cellId, cellYMap);

    const undoManager = this.createUndoManager(yText, cellId);
    console.log(
      `undoManager within addCell for cellId ${cellId}:`,
      undoManager
    );

    console.log("cell generated => ", cellYMap.toString());
    console.log("notebook snapshot with new cell", this.rootYdoc.toJSON());
    return { cellId, cellYMap };
  }

  // addCellAtEnd(type, text, id) {
  //   const { cellId } = this.addCell(type, text, id);

  //   this.cellOrderArr.push([cellId]);
  // }

  getOrderedCellData() {
    return this.cellOrderArr.map(cellId => {
      const data = this.rawCellData.get(cellId);
      return data;
    });
  }

  getAllCodeCells() {
    const data = this.getOrderedCellData().filter(cellObj => {
      return cellObj.get("type") === "code";
    });

    return data;
  }

  // lang parameter not implemented, would be easy to implement for scale
  getCodeCellTextBefore(id) {
    // lang = lang || 'javascript';
    const codeStrings = [];

    for (const cellObj of this.getAllCodeCells()) {
      codeStrings.push(cellObj.get("text").toString());
      if (cellObj.get("id") === id) {
        break;
      }
    }

    return codeStrings.join("\n");
  }

  getCellText(id) {
    return this.getCellyText(id).toString();
  }

  getCellyText(id) {
    return this.rawCellData.get(id).get("text");
  }

  executeCodeFromCell(id) {
    this.getCodeCellTextBefore(id);
  }

  toJSON() {
    return this.notebookData.toJSON();
  }

  logCells() {
    // const rawCellJSON = this.rawCellData.toJSON();

    console.log("\nRAW CELL DATA");
    // console.log(rawCellJSON);
    // console.log('\nCELLS IN ORDER');
    console.log(this.cellOrderArr.toJSON());
  }

  insertMockData(cells = null) {
    console.log("insertMockData called");
    if (!cells) {
      cells = [
        {
          id: "0bd0f48b-deb8-4b88-8c98-959ebd34acbe",
          text: "console.log('cell 1')",
          type: "code"
        },

        {
          id: "e0a16f81-1cca-4070-bc80-2c79e95fb5f0",
          text: "cell 2 mmmmm mock data lorem ipsum etc and so on",
          type: "markdown"
        },
        {
          id: "wer3a8d1-d896-4a65-8109-7e84537018e6",
          text: "cell 3stop, collaborate and listen",
          type: "markdown"
        },
        {
          id: "9gwsa23a8d1-d896-4a6s-8109-7e84537018edxx",
          text: "more code",
          type: "code"
        },
        {
          id: "kn3a8d1-d896-4a65-8109-7e84537018e6yy",
          text: "lotta code here to",
          type: "code"
        }
      ];
    }
  }
}

//   for (let { id, text, type } of cells) {
//     this.addCell(type, text, id);
//   }

//   const cellIdsInOrder = cells.map(cellObj => cellObj.id);

//   // const cellOrderArr = new Y.Array(cellIdsInOrder);
//   // cellOrderArr.insert(0, cellIdsInOrder);

//   this.cellOrderArr.insert(0, cellIdsInOrder);
//   console.log('cellOrderArr: ', this.cellOrderArr);
//   console.log('cellOrderArr inside insertMockData: ', this.cellOrderArr.toArray().length);

//   return this.notebookData;
// }
export const yPrettyPrint = (ydoc, msg = "") => {
  console.log(
    "\n\n==> " + msg + ": \n" + JSON.stringify(ydoc.toJSON(), null, 4) + "\n\n"
  );
};
