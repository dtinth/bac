import { Button, Flex } from "@chakra-ui/react";
import { defineChallengeConfiguration } from "../../challenge-runner";

import {
  actions,
  challenge,
  getMaze,
  isValidCoordinate,
  travel,
  turnLeft,
  turnRight,
} from "./challenge";

export const config = defineChallengeConfiguration({
  challenge,
  timeLimitSeconds: 120,
  renderIntroduction: () => {
    return <>Navigate from the top left to the bottom right.</>;
  },
  renderChallenge: (state, dispatch) => {
    const maze = getMaze(state.seed);
    const hasWallInFront = !isValidCoordinate(
      travel(state.cell, state.direction),
      maze
    );
    const hasWallToTheLeft = !isValidCoordinate(
      travel(state.cell, turnLeft(state.direction)),
      maze
    );
    const hasWallToTheRight = !isValidCoordinate(
      travel(state.cell, turnRight(state.direction)),
      maze
    );
    return (
      <Flex direction="column" gap={3} align="center">
        <Flex gap={3} style={{ perspective: "240px" }} py={4}>
          <div
            id="wallToTheLeft"
            data-state={hasWallToTheLeft ? "present" : "absent"}
            style={{
              background: hasWallToTheLeft ? "#369" : "#eee",
              width: 100,
              transformOrigin: "right",
              transform: "rotateY(90deg)",
            }}
          ></div>
          <Button
            id="wallInFront"
            onClick={() => dispatch(actions.f, 0)}
            colorScheme={hasWallInFront ? "red" : "green"}
            data-state={hasWallInFront ? "present" : "absent"}
          >
            ↟ Go forward
          </Button>
          <div
            id="wallToTheRight"
            data-state={hasWallToTheRight ? "present" : "absent"}
            style={{
              background: hasWallToTheRight ? "#369" : "#eee",
              width: 100,
              transformOrigin: "left",
              transform: "rotateY(-90deg)",
            }}
          ></div>
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
                    backgroundColor: cell ? "#369" : "#fff",
                    width: 12,
                    height: 12,
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
        fontWeight: "bold",
        color: "red",
      }}
    >
      {">"}
    </div>
  );
}
