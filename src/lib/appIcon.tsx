export function crescentIcon(sizePx: number) {
  const moon = Math.round(sizePx * 0.62);
  const bite = Math.round(sizePx * 0.62);
  const biteOffset = Math.round(sizePx * 0.2);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1B6B4A",
        position: "relative",
      }}
    >
      <div
        style={{
          width: moon,
          height: moon,
          borderRadius: "50%",
          background: "#ffffff",
          position: "relative",
          display: "flex",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: biteOffset,
            left: biteOffset,
            width: bite,
            height: bite,
            borderRadius: "50%",
            background: "#1B6B4A",
          }}
        />
      </div>
    </div>
  );
}
