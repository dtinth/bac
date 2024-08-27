import { defineChallengeConfiguration } from "../../challenge-runner";

import { actions, challenge } from "./challenge";

export const config = defineChallengeConfiguration({
  challenge,
  timeLimitSeconds: 10,
  renderIntroduction: () => {
    return <>Sort the numbers in ascending order. You have 10 seconds.</>;
  },
  renderChallenge: (state, dispatch) => {
    const handleDragStart = (
      _e: React.DragEvent<HTMLDivElement>,
      index: number
    ) => {
      dispatch(actions.s, index);
    };
    const handleDragOver = (
      e: React.DragEvent<HTMLDivElement>,
      index: number
    ) => {
      e.preventDefault();
      dispatch(actions.o, index);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      dispatch(actions.d, index);
    };
    return (
      <>
        <div style={{ display: "flex", gap: "4px" }}>
          {state.values.map((value, index) => (
            <div
              key={value}
              style={{
                flex: "1 0 0",
                cursor: "move",
                userSelect: "none",
                textAlign: "center",
                opacity:
                  state.sourceIndex === index
                    ? 0
                    : state.targetIndex === index
                    ? 0.5
                    : 1,
              }}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => dispatch(actions.e, 0)}
            >
              <div style={{ position: "relative", height: "128px" }}>
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: 0,
                    right: 0,
                    background: "#369",
                    height: `${(value / state.values.length) * 100}%`,
                  }}
                ></div>
              </div>
              {value}
            </div>
          ))}
        </div>
      </>
    );
  },
});
