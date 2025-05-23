import Link from 'next/link';
import IpoSectionHead from "../IpoSectionHead";

import { PressreleasesSlider } from "../SwiperSlider";

function PressReleasesSection({
  PressReleaseData,
  DefaultPressReleaseData,
  result,
  loading,
}) {
  console.log("PressReleaseData:", PressReleaseData);
  return (
    <section
      className="pressreleases-section common_section"
      id="press-releases"
    >
      <div className="container-fluid px-lg-5 px-3">
        <div className="row">
          <div className="col-12 d-flex flex-column align-items-center py-lg-5 py-3">
            <h4 className="fs-2 fw-medium bg-light position-relative short-title mb-5">
              Press Releases
            </h4>
            <IpoSectionHead
              title={
                result?.pressReleaseSection?.title
                  ? result?.pressReleaseSection?.title
                  : "Latest Press Releases & Company Updates"
              }
              shortTitle={
                result?.pressReleaseSection?.description
                  ? result?.pressReleaseSection?.description
                  : "Stay informed with our latest announcements, financial disclosures, and industry insights."
              }
            />
          </div>
        </div>
      </div>

      <div className="container-fluid px-lg-5 px-3 mt-5">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row gy-5">
            {/* {PressReleaseData && PressReleaseData.length > 0
              ? PressReleaseData.map((item, index) => (
                  <div className="col-xl-4 col-md-6 col-12" key={index}>
                    <PressReleaseBox pressReleaseData={item} />
                  </div>
                ))
              : DefaultPressReleaseData &&
                DefaultPressReleaseData.map((item, index) => (
                  <div className="col-xl-4 col-md-6 col-12" key={index}>
                    <PressReleaseBox pressReleaseData={item} />
                  </div>
                ))} */}
              <PressreleasesSlider PressReleaseData={PressReleaseData}/>
          </div>
        )}
      </div>
    </section>
  );
}

export default PressReleasesSection;
