import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  Text,
} from "@chakra-ui/react";
import { defineChallengeConfiguration } from "../../challenge-runner";

import { Operator, actions, challenge } from "./challenge";

export const config = defineChallengeConfiguration({
  challenge,
  timeLimitSeconds: 120,
  renderIntroduction: () => {
    return (
      <>Give the correct answers to 100 simple math problems in 1 minute.</>
    );
  },
  renderChallenge: (state, dispatch) => {
    const renderButton = (num: number) => {
      return (
        <Button width="100%" onClick={() => dispatch(actions.k, num)}>
          {num}
        </Button>
      );
    };
    const formatNumber = (num: number) => {
      // Add thousands separators
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    return (
      <Flex direction="column" gap={3} align="center">
        <Box>Question #{state.completed + 1}</Box>
        <Box>
          <Text fontSize="xl" fontWeight="bold">
            {formatNumber(state.question[0])}{" "}
            {(
              {
                "*": "×",
                "/": "÷",
              } as Record<Operator, string>
            )[state.question[1]] || state.question[1]}{" "}
            {formatNumber(state.question[2])} = ?
          </Text>
        </Box>
        <Grid templateColumns="repeat(3, 5em)" gap={2} justifyContent="center">
          <GridItem colSpan={3}>
            <Card>
              <CardBody p={2}>
                <Text color="red.500" fontSize="xl" fontWeight="bold">
                  &nbsp; {state.answer === 0 ? "" : formatNumber(state.answer)}
                </Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>{renderButton(7)}</GridItem>
          <GridItem>{renderButton(8)}</GridItem>
          <GridItem>{renderButton(9)}</GridItem>
          <GridItem>{renderButton(4)}</GridItem>
          <GridItem>{renderButton(5)}</GridItem>
          <GridItem>{renderButton(6)}</GridItem>
          <GridItem>{renderButton(1)}</GridItem>
          <GridItem>{renderButton(2)}</GridItem>
          <GridItem>{renderButton(3)}</GridItem>
          <GridItem>{renderButton(0)}</GridItem>
          <GridItem colSpan={2}>
            <Button width="100%" onClick={() => dispatch(actions.a, 0)}>
              Submit
            </Button>
          </GridItem>
        </Grid>
      </Flex>
    );
  },
});
