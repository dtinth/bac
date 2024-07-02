import { Button, Flex } from "@chakra-ui/react";
import { defineChallengeConfiguration } from "../../challenge-runner";

import {
  actions,
  challenge,
  getMaze,
  isValidCoordinate,
  travel,
} from "./challenge";

export const config = defineChallengeConfiguration({
  challenge,
  timeLimitSeconds: 120,
  renderIntroduction: () => {
    return <>Navigate from the top left to the bottom right.</>;
  },
  renderChallenge: (state, dispatch) => {
    const maze = getMaze(state.seed);
    const color = (direction: number) => {
      return isValidCoordinate(travel(state.cell, direction), maze)
        ? "green"
        : "red";
    };
    return (
      <Flex direction="column" gap={3} align="center">
        <Flex gap={3}>
          <Button
            onClick={() => dispatch(actions.f, 0)}
            colorScheme={color(state.direction)}
            data-color={color(state.direction)}
          >
            ↟ Go forward
          </Button>
        </Flex>
        <Flex gap={3}>
          <Button onClick={() => dispatch(actions.l, 0)}>↺ Turn left</Button>
          <Button onClick={() => dispatch(actions.r, 0)}>↻ Turn right</Button>
        </Flex>
        <table>
          {maze.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, columnIndex) => (
                <td
                  key={columnIndex}
                  style={{
                    backgroundColor: cell ? "#ccc" : "#fff",
                    width: 16,
                    height: 16,
                    position: "relative",
                  }}
                >
                  {state.cell[0] === rowIndex &&
                  state.cell[1] === columnIndex ? (
                    <Robot direction={state.direction} />
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </table>
      </Flex>
    );
  },
});

function Robot(props: { direction: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) rotate(${props.direction * 90}deg)`,
      }}
    >
      {">"}
    </div>
  );
}
