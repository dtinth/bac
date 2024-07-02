import { Container, Link } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ChallengeRunner } from "./challenge-runner";
import { configMap } from "./challenges";

function App() {
  const params = new URLSearchParams(location.search);
  const challengeName = params.get("challenge") ?? "";
  const seed = params.get("seed") ?? `${Date.now()}`;
  return (
    <Container maxW="container.md" py={4}>
      {challengeName ? (
        <ChallengeLoader challengeName={challengeName} seed={seed} />
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

export interface ChallengeLoader {
  challengeName: string;
  seed: string;
}
export function ChallengeLoader(props: ChallengeLoader) {
  const { challengeName, seed } = props;
  const query = useQuery({
    queryKey: ["challenge", challengeName],
    queryFn: async () => {
      const configPromise = await configMap.get(challengeName);
      return configPromise;
    },
  });
  if (query.data) {
    return <ChallengeRunner config={query.data.config} seed={seed} />;
  } else if (query.isLoading) {
    return <div>Loading challenge...</div>;
  } else if (query.isError) {
    return <div>Error loading challenge</div>;
  } else {
    return <div>Unknown state</div>;
  }
}

export default App;
