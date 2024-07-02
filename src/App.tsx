import { Container, Link } from "@chakra-ui/react";
import { ChallengeRunner } from "./challenge-runner";
import { configMap } from "./challenges";

function App() {
  const params = new URLSearchParams(location.search);
  const config = configMap.get(params.get("challenge") ?? "");
  const seed = params.get("seed") ?? `${Date.now()}`;
  return (
    <Container maxW="container.md" py={4}>
      {config ? (
        <ChallengeRunner config={config} seed={seed} />
      ) : (
        <ul>
          {Array.from(configMap.keys(), (key) => (
            <li key={key}>
              <Link href={`?challenge=${key}`}>{key}</Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

export default App;
