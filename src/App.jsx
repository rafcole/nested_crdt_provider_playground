import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import Editor from "@monaco-editor/react"
import * as Y from "yjs"
// import { WebrtcProvider } from "y-webrtc"
import { MonacoBinding } from "y-monaco"
import { WebsocketProvider } from 'y-websocket'

// Setup Monaco Editor
// Attach YJS Text to Monaco Editor

const doc = new Y.Doc();
const provider = new WebsocketProvider('ws://localhost:1234', 'test', doc);
const yNotebook = doc.getMap('notebook');
yNotebook.set('monacoA', new Y.Text('top of page Monaco A'));
yNotebook.set('monacoB', new Y.Text('top of page monaco B'));

console.log(doc.toJSON())
console.log(doc.get('notebook').toJSON())

function App() {
  const editorRef = useRef(null);

  // Editor value -> YJS Text value (A text value shared by multiple people)
  // One person deletes text -> Deletes from the overall shared text value
  // Handled by YJS

  // Initialize YJS, tell it to listen to our Monaco instance for changes.

  function handleEditorDidMountA(editor, monaco) {
    editor = editor;

    // const provider = new WebsocketProvider('ws://localhost:1234', 'test', doc); 
    const type = doc.get('notebook').get("monacoA"); 

    const binding = new MonacoBinding(type, editor.getModel(), new Set([editor]), provider.awareness)
    // console.log(provider.awareness);                
  }
  function handleEditorDidMountB(editor, monaco) {
    editor = editor;

    // const provider = new WebsocketProvider('ws://localhost:1234', 'test', doc); 
    const type = doc.get('notebook').get("monacoB");

    const binding = new MonacoBinding(type, editor.getModel(), new Set([editor]), provider.awareness)
    // console.log(provider.awareness);                
  }

  return (
    <div>    
      <Editor
      defaultValue='Editor A default value from editor component'
      height="35vh"
      width="100vw"
      theme="vs-dark"
      onMount={handleEditorDidMountA}
    />
      <Editor
      defaultValue='Editor B default value from editor component'
      height="35vh"
      width="100vw"
      theme="vs-dark"
      onMount={handleEditorDidMountB}
    />
    </div>

  )
}

export default App
