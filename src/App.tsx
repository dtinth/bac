import "./App.css";
import reactLogo from "./assets/react.svg";
import { actions, challenge } from "./challenge";
import { useChallenge } from "./challenge-framework";
import viteLogo from "/vite.svg";

function App() {
  const [state, dispatch] = useChallenge(challenge, { seed: "meow" });

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => dispatch(actions.c, "")}>
          {JSON.stringify(state, null, 2)}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
