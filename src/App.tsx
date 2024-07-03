import { Container, Link } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ChallengeRunner } from "./challenge-runner";
import { configMap } from "./challenges";

interface ChallengeParams {
  challengeName: string;
  seed: string;
}

function App() {
  const { isLoading, data: params } = useQuery({
    queryKey: ["params"],
    queryFn: async (): Promise<ChallengeParams> => {
      const params = new URLSearchParams(location.search);
      return {
        challengeName: params.get("challenge") ?? (
          configMap.size === 1 ? Array.from(configMap.keys())[0] : ""
        ),
        seed: params.get("seed") ?? `${Date.now()}`,
      };
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return (
    <Container maxW="container.md" py={4}>
      {params?.challengeName ? (
        <ChallengeLoader challengeName={params.challengeName} seed={params.seed} />
      ) : isLoading ? (
        <div>Loading...</div>
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
