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

// const doc = new Y.Doc();

// const provider = new WebsocketProvider(
//   import.meta.env.VITE_WEBSOCKET_SERVER,
//   "levelup",
//   doc,
//   { WebSocketPolyfill: ws }
// );

let provider = new HocuspocusProvider({
    // ! hardcoding server for testing
    url: "ws://127.0.0.1:1238",
    name: 'superduperrandom',
    onSynced: (state) => {
      console.log('sync event mms')
      yPrettyPrint(provider.document);
      console.log('end sync event')
  }})

const doc = provider.document;

function App() {
  const [notebookYMap, setNotebookYMap] = useState(new Y.Map());
  const [rawCellDataYMap, setRawCellYMap] = useState(notebookYMap.get('rawCellData'));
  const [cellOrderArr, setCellOrderArr] = useState([]);
   // [cellId, cellData
  const editorRef = useRef(null);


  useEffect(() => {
    provider.on('sync', isSynced => {
      console.log('\n\nlocal yDoc has synced')
      yPrettyPrint(doc)

      //TODO check for existing
      const _nb = doc.getMap('notebook')
      setNotebookYMap(_nb)

      const _rcd = _nb.get('rawCellData')
      setRawCellYMap(_rcd)

      const _coa = _nb.get('cellOrderArr')
      setCellOrderArr(_coa.toArray())

      _coa.observe(e => {
        setCellOrderArr(_coa.toArray())
      })
    })
  }, [])

  function handleEditorDidMount(editor, monaco, cellId) {
    editorRef.current = editor;
    
    const content = rawCellDataYMap.get(cellId).get('content')

    const binding = new MonacoBinding(content, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);               
  }

  function handlePushCell (type) {
    const id = v4()
    const newCell = new Y.Map()
    newCell.set('content', new Y.Text('added via button'))
    newCell.set('type', type)
    newCell.set('id', id)

    rawCellDataYMap.set(id, newCell)
    notebookYMap.get('cellOrderArr').push([id]) 
  }
  return (
    <div>
      <h3>multiMonacoSimple</h3>
      {cellOrderArr.map((cellId, index) => {
        console.log(cellId)
        return (
          <div key={cellId}>
          <Editor
            key={cellId}
            defaultLanguage="javascript"
            height="35vh"
            width="60vw"
            theme="vs-dark"
            onMount={(_editor, _monaco)=> handleEditorDidMount(_editor, _monaco, cellId, index)}
          />
          </div>
        );
      })}
      <button onClick={() => handlePushCell('code')}>Add Code Cell</button>
    </div>
  );
}

export default App;
