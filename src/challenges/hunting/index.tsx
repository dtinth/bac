import { useEffect, useRef } from "react";
import { defineChallengeConfiguration } from "../../challenge-runner";

import { Badge, BadgeProps, Flex } from "@chakra-ui/react";
import {
  actions,
  challenge,
  getChallengeViewModel,
  getNumber,
} from "./challenge";

const questionMark =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAA0VXHyAAAApElEQVQoFZVSMQ6AIBADw+hTHB18hA/xST6ERzg4+hRHB5uUNHAQI8Rg02vvCsE/+3LGy/1b8zr5Yx3x+6d3YTsGSoG+PRIE6hCMwMTTcAnShFy9xJsfSOMHUxhow45+aqkwrLYNctagMCAxwlBUhyGfDq1OTEK1zKoCWENeA9ZJxBeRxObZRBK0DYiEF1C3h6dtYDNzocUEU6sjSdD9+DinY38BgGo9osmbr9wAAAAASUVORK5CYII=";

export const config = defineChallengeConfiguration({
  challenge,
  timeLimitSeconds: 20,
  renderIntroduction: () => {
    return (
      <>
        You are given 5 numbers to click and 64 boxes. Click on those boxes. The
        catch? You have to hover over the boxes to see the number.
      </>
    );
  },
  renderChallenge: (state, dispatch) => {
    const { seed, hoverIndex, clickedIndices } = state;
    const { clicked, target } = getChallengeViewModel(seed, clickedIndices);
    return (
      <>
        Click the boxes with the numbers:
        <Flex
          gap={3}
          align="center"
          wrap="wrap"
          justify="flex-start"
          mt={3}
          mb={3}
        >
          {target.map((n, index) => {
            const props: BadgeProps = {};
            if (clicked.has(n)) {
              props.colorScheme = "green";
              props.variant = "solid";
            }
            return (
              <Badge key={index} {...props}>
                {n}
              </Badge>
            );
          })}
        </Flex>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 32px)",
            gap: "4px",
          }}
        >
          {Array.from({ length: 64 }, (_, i) => (
            <GridItem
              key={i}
              index={i}
              seed={state.seed}
              hover={hoverIndex === i}
              onHover={() => dispatch(actions.h, i)}
              onUnhover={() => dispatch(actions.l, i)}
              onClick={() => dispatch(actions.c, i)}
              clicked={clickedIndices.includes(i)}
            />
          ))}
        </div>
      </>
    );
  },
});

function GridItem(props: {
  index: number;
  seed: string;
  hover: boolean;
  clicked: boolean;
  onHover: () => void;
  onUnhover: () => void;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useRef(null as null | { x: number; y: number });
  useEffect(() => {
    if (props.hover && ref.current) {
      const box = ref.current.getBoundingClientRect();
      const div = document.createElement("div");
      div.style.position = "fixed";
      div.style.top = `${
        mouse.current ? mouse.current.y : box.top + box.height / 2
      }px`;
      div.style.left = `${
        mouse.current ? mouse.current.x : box.left + box.width / 2
      }px`;
      div.style.border = "1px solid black";
      div.style.backgroundColor = "#ffffcc";
      div.style.padding = "4px";
      div.style.color = "black";
      div.style.zIndex = "100";
      div.style.pointerEvents = "none";
      div.textContent = getNumber(props.seed, props.index).toString();
      div.style.transform = "translate(0%, -100%)";
      document.body.appendChild(div);
      const onMouseMove = (e: MouseEvent) => {
        div.style.top = `${e.clientY}px`;
        div.style.left = `${e.clientX}px`;
      };
      window.addEventListener("mousemove", onMouseMove);
      return () => {
        div.remove();
        window.removeEventListener("mousemove", onMouseMove);
      };
    }
  }, [props.hover, props.seed, props.index]);
  return (
    <div
      ref={ref}
      style={{
        width: "32px",
        height: "32px",
        opacity: props.clicked ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        mouse.current = { x: e.clientX, y: e.clientY };
        props.onHover();
      }}
      onMouseLeave={props.onUnhover}
      onClick={props.onClick}
    >
      <img
        src={questionMark}
        style={{ width: "32px", height: "32px", imageRendering: "pixelated" }}
      />
    </div>
  );
}
