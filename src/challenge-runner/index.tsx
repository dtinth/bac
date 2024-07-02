/* eslint-disable react-refresh/only-export-components */
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  IconButton,
  Progress,
  Spacer,
} from "@chakra-ui/react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { uuidv7 } from "uuidv7";
import { Challenge, ChallengeMetadata } from "../challenge-framework";
import { RuntimeDispatchFn, useChallenge } from "../challenge-runtime";

export interface ChallengeConfiguration<TState = Wildcard> {
  challenge: Challenge<TState>;
  timeLimitSeconds: number;
  renderChallenge: (
    state: NoInfer<TState>,
    dispatch: RuntimeDispatchFn<NoInfer<TState>>
  ) => React.ReactNode;
  renderIntroduction: () => React.ReactNode;
}
export function defineChallengeConfiguration<TState>(
  config: ChallengeConfiguration<TState>
) {
  return config;
}

export interface ChallengeRunner {
  config: ChallengeConfiguration<Wildcard>;
  seed: string;
}
export function ChallengeRunner(props: ChallengeRunner) {
  const { config, seed } = props;
  const [attempt, setAttempt] = useState<ChallengeMetadata | undefined>();
  const newAttempt = () =>
    setAttempt({ seed, attemptId: uuidv7(), startTime: Date.now() });
  if (!attempt) {
    return (
      <>
        <Flex
          bg="blue.100"
          p={4}
          mb={3}
          borderRadius="md"
          align="center"
          gap={2}
        >
          <Box>
            <strong>Ready to start the challenge?</strong>
            <br />
            Click the start button to begin.
          </Box>
          <Spacer />
          <Button onClick={newAttempt} colorScheme="blue">
            Start challenge
          </Button>
        </Flex>
        <Card>
          <CardBody p={4}>{config.renderIntroduction()}</CardBody>
        </Card>
      </>
    );
  }
  return (
    <ChallengeAttempt
      config={config}
      challengeMetadata={attempt}
      key={attempt.attemptId}
      onReset={() => setAttempt(undefined)}
    />
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Wildcard = any;

export interface ChallengeAttempt {
  config: ChallengeConfiguration<Wildcard>;
  challengeMetadata: ChallengeMetadata;
  onReset: () => void;
}

export function ChallengeAttempt(props: ChallengeAttempt) {
  const { config, challengeMetadata } = props;
  const { challenge } = config;
  const [state, dispatch, runtimeMetadata, startPerformanceTime] = useChallenge(
    config.challenge,
    challengeMetadata
  );
  const [timeIsUp, setTimeIsUp] = useState(false);
  const logSizeLimit = 262144;
  const hp = Math.max(
    0,
    Math.min(100, Math.ceil((1 - runtimeMetadata.size / logSizeLimit) * 100))
  );

  if (challenge.isChallengeCompleted(state)) {
    return (
      <Flex
        bg="green.100"
        p={4}
        mb={3}
        borderRadius="md"
        align="center"
        gap={2}
      >
        <Box>
          <strong>Challenge completed!</strong>
          <br />
          Congratulations!
        </Box>
      </Flex>
    );
  }

  let failureReason: string | undefined = challenge.getFailureReason(state);
  if (!failureReason && hp === 0) {
    failureReason = "You performed too many actions. Try again!";
  }
  if (!failureReason && timeIsUp) {
    failureReason = "Time's up! Try again!";
  }
  if (failureReason) {
    return (
      <Flex bg="red.100" p={4} mb={3} borderRadius="md" align="center" gap={2}>
        <Box>
          <strong>Challenge failed</strong>
          <br />
          {failureReason}
        </Box>
        <Spacer />
        <Button onClick={props.onReset} colorScheme="red">
          Start over
        </Button>
      </Flex>
    );
  }

  return (
    <Box>
      <Flex
        bg="orange.100"
        p={4}
        mb={3}
        borderRadius="md"
        align="center"
        gap={2}
      >
        <Box>
          <strong>Challenge in progress</strong>
          <br />
          Attempt: {challengeMetadata.attemptId}
        </Box>
        <Spacer />
        <Box width="5em" fontSize="xs">
          HP
          <Countdown
            startPerformanceTime={startPerformanceTime}
            timeLimitSeconds={config.timeLimitSeconds}
            onTimeUp={() => setTimeIsUp(true)}
          >
            {(timePercent) => (
              <Progress
                value={Math.min(hp, timePercent)}
                border="1px solid"
                borderColor="orange.300"
                colorScheme="orange"
              />
            )}
          </Countdown>
        </Box>
        <IconButton
          colorScheme="red"
          variant="outline"
          aria-label="Restart challenge"
          size="sm"
          icon={<ReloadIcon />}
          onClick={props.onReset}
        />
      </Flex>
      <Card>
        <CardBody p={4}>{config.renderChallenge(state, dispatch)}</CardBody>
      </Card>
    </Box>
  );
}

interface Countdown {
  startPerformanceTime: number;
  timeLimitSeconds: number;
  children: (timeLeftPercent: number) => React.ReactNode;
  onTimeUp?: () => void;
}
function Countdown(props: Countdown) {
  const { startPerformanceTime, timeLimitSeconds, children } = props;
  const [now, setNow] = useState(performance.now());
  const fired = useRef(false);
  useEffect(() => {
    const id = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(id);
  }, []);
  const elapsed = (now - startPerformanceTime) / 1000;
  const timeLeftPercent = Math.max(
    0,
    Math.min(100, Math.round((1 - elapsed / timeLimitSeconds) * 100))
  );
  const rendered = useMemo(
    () => children(timeLeftPercent),
    [children, timeLeftPercent]
  );
  const timeUp = timeLeftPercent === 0;
  const onTimeUpRef = useRef(props.onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = props.onTimeUp;
  }, [props.onTimeUp]);
  useEffect(() => {
    if (timeUp && !fired.current) {
      fired.current = true;
      onTimeUpRef.current?.();
    }
  }, [timeUp]);
  return <>{rendered}</>;
}
