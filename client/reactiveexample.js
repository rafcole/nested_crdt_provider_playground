import { useReactive } from "@reactivedata/react";

export default function App() {
  const state = useReactive({
    clickCount: 0
  });

  return (
    <div>
      <p>
        The button has been clicked <strong>{state.clickCount} times!</strong>
      </p>
      <button onClick={() => state.clickCount++} />
    </div>
  );
}
