import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { actions, challenge } from "./challenge";
import {
  ChallengeRunner,
  defineChallengeConfiguration,
} from "./challenge-runner";

function App() {
  return (
    <Container maxW="container.md" py={4}>
      <ChallengeRunner config={config} initialParams={{ seed: "meow" }} />
    </Container>
  );
}

const config = defineChallengeConfiguration({
  challenge,
  timeLimitSeconds: 5,
  renderIntroduction: () => {
    return (
      <>
        There are 3 pages of simple forms for you to complete. However, you have
        only 5 seconds.
      </>
    );
  },
  renderChallenge: (state, dispatch) => {
    const renderNextButton = () => {
      return (
        <Button
          rightIcon={<ArrowForwardIcon />}
          colorScheme="teal"
          onClick={() => dispatch(actions.n, 0)}
        >
          Next
        </Button>
      );
    };
    if (state.page === 0) {
      return (
        <Flex direction="column" gap={2}>
          <FormControl>
            <FormLabel>Type the following text: {state.expectedText}</FormLabel>
            <Input
              type="text"
              value={state.challengeA}
              onChange={(e) => dispatch(actions.a, e.target.value)}
              onPaste={() => dispatch(actions.p, 0)}
            />
          </FormControl>
          <Box>{renderNextButton()}</Box>
        </Flex>
      );
    } else if (state.page === 1) {
      return (
        <Flex direction="column" gap={2}>
          <Checkbox
            isChecked={state.challengeB}
            onChange={() => dispatch(actions.b, !state.challengeB)}
          >
            Check this box
          </Checkbox>
          <Box>{renderNextButton()}</Box>
        </Flex>
      );
    } else if (state.page === 2) {
      return (
        <Flex direction="column" gap={2}>
          Click the button {state.expectedNumber} times.
          <Button onClick={() => dispatch(actions.c, "")}>
            {state.challengeC}
          </Button>
          <Box>{renderNextButton()}</Box>
        </Flex>
      );
    }
  },
});

export default App;
