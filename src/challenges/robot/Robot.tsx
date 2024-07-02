export function Robot(props: { direction: number }) {
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
