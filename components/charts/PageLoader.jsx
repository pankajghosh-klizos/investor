import { DotLoader } from "react-spinners";

function PageLoader({primaryColor}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <DotLoader color={primaryColor} size={55} />
    </div>
  );
}

export default PageLoader;
