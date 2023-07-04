import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useReactive } from "@reactivedata/react";
import { ws } from "ws";
import { mockJsonToYDoc } from "./mocking/mockDataToYDoc";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { yPrettyPrint } from "./notebookMockGenerator";
import { v4 } from "uuid";


//////////////////// y-websocket ///////////////////////
const doc = new Y.Doc();

const provider = new WebsocketProvider(
  import.meta.env.VITE_WEBSOCKET_SERVER,
  "levelup",
  doc,
  { WebSocketPolyfill: ws }
);
///////////////////// end y-websocket ///////////////////////

///////////////////// HP ///////////////////////
// let provider = new HocuspocusProvider({
//     // ! hardcoding server for testing
//     url: "ws://127.0.0.1:1238",
//     name: 'superdupasdferrdanasdfdom',
//     onSynced: (state) => {
//       console.log('sync event mms')
//       yPrettyPrint(provider.document);
//       console.log('end sync event')
//   }})

// const doc = provider.document;
///////////////////// end HP ///////////////////////
function App() {
  const [cellDataArr, setCellDataArr] = useState(doc.getArray('cells').toArray());
  const cellDataArrRef = useRef(doc.getArray('cells'));
  const editorRef = useRef(null);


  useEffect(() => {
    provider.on('sync', isSynced => {
      console.log('\n\nlocal yDoc has synced')
      yPrettyPrint(doc)

      const _cda = doc.get('cells')
      setCellDataArr(_cda.toArray())

      _cda.observe(e => {
        setCellDataArr(_cda.toArray())
      })
    })
  }, [])

  function handleEditorDidMount(editor, monaco, cellData, index) {
    editorRef.current = editor;
    
    const content = cellData.get('editorContent')

    const binding = new MonacoBinding(content, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);               
  }

  // co pilot read my other function and wrote this lmao
  function handleAddCellAtIndex(index, type) {
    const id = v4()
    const newCell = new Y.Map()
    newCell.set('editorContent', new Y.Text('added via button'))
    newCell.set('type', type)
    newCell.set('id', id)

    yPrettyPrint(newCell, 'new cell added via button push')

    cellDataArrRef.current.insert(index, [newCell])
  }

  return (
    <div>
      <h3>multiMonacoSimple</h3>
      <div>        
        <button onClick={() => handleAddCellAtIndex(0, 'code')}>Add Code Cell</button>
        <button onClick={() => handleAddCellAtIndex(0, 'markdown')}>Add Markdown Cell</button>
      </div>
      <div>
        {yPrettyPrint(doc.get('cells'), '=====> cell data array rendering')}
        {cellDataArr.map((cellData, index) => {
          yPrettyPrint(cellData, 'currently rendering cell data')
          console.log(cellData.id)
          return (
            <div key={cellData.id}>
              <Editor
                key={cellData.id}
                defaultLanguage={(cellData.type === 'code') ? "javascript": "markdown"}
                height="35vh"
                width="60vw"
                theme="vs-dark"
                onMount={(_editor, _monaco)=> handleEditorDidMount(_editor, _monaco, cellData, index)}
              />
              <div>
                <button onClick={() => handleAddCellAtIndex(index + 1, 'code')}>Add Code Cell</button>
                <button onClick={() => handleAddCellAtIndex(index + 1, 'markdown')}>Add Markdown Cell</button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default App;
