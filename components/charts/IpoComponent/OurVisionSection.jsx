import IpoSectionHead from "../IpoSectionHead";

function OurvisionSection({ result }) {
  // console.log(result?.discoveredSection)
  return (
    <section className="ourvision-section common_section" >
      <div className="container-fluid px-lg-5 px-3">
        <div className="row">
          <IpoSectionHead
            title={
              result?.discoveredSection?.title
                ? result?.discoveredSection?.title
                : "Discover Our Vision: Innovation in Action"
            }
            shortTitle={
              result?.discoveredSection?.description
                ? result?.discoveredSection?.description
                : "Watch revolutionizing financial technology with AI driven insights and market intelligence"
            }
          />
        </div>
      </div>
      {/* <video autoPlay loop muted className="w-100">
        <source src={vision} type="video/mp4" autoPlay />
        Your browser does not support the video tag. Please try again with a
        different browser.
      </video> */}
      {result?.discoveredSection?.video.endsWith(".mp4") || result?.discoveredSection?.video.endsWith(".webm") ? (
        <video autoPlay loop muted className="w-100 overflow-y-hidden" style={{maxHeight: '100rem'}}>
          <source
            src={result.discoveredSection.video ? result.discoveredSection.video : "/vision.webm"}
            type="video/mp4"
            autoPlay
          />
          Your browser does not support the video tag. Please try again with a
          different browser.
        </video>
      ) : (
        <div className="video_wraper w-100 overflow-y-hidden" style={{maxHeight: '100rem'}}>
          <img
            src={result?.discoveredSection?.video ? result.discoveredSection.video : "/vision.webm"}
            className="w-100 h-100"
            alt="vision preview"
          />
        </div>
      )}
    </section>
  );
}

export default OurvisionSection;
