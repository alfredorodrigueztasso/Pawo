interface LogoPawoProps {
  height?: number;
  width?: number;
}

export function LogoPawo({ height = 32, width = 93 }: LogoPawoProps) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-light.svg"
        alt="Pawo"
        width={width}
        height={height}
        className="logo-light"
        style={{ height: "auto" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-dark.svg"
        alt="Pawo"
        width={width}
        height={height}
        className="logo-dark"
        style={{ height: "auto" }}
      />
    </>
  );
}
