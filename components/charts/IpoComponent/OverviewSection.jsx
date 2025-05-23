import React from "react";
import StockChart from "../StockChart";
import StaticChart from "../StaticChart";
import { overviewBackground } from "@/constants/images";



function OverviewSection({ isuser, result, tickerSymbol, brandingResult }) {

  return (
    <section className="overview-section common_section">
      <div className="top_chart">
        <div className="container-md position-relative px-md-0 px-3">
          <div className="chart_main rounded-5 position-relative w-100 p-0" >
            <span className="chart_main_after" style={{background:`linear-gradient(180deg, ${brandingResult?.branding_secondary_color} 0%, ${brandingResult?.branding_primary_color} 100%)`}}></span>
            {isuser ? (
              <StockChart
                tickerSymbol={tickerSymbol}
                brandingResult={brandingResult}
              />
            ) : (
              <StaticChart />
            )}
          </div>
        </div>
      </div>
      <div className="overview_container" id="overview">
        <div className="container-fluid px-lg-5 px-3">
          <div className="overview_main">
            <div className="row gy-lg-0 gy-5 gx-5">
              <div className="col-lg-6 col-12 content d-flex flex-column justify-content-center">
                <h2 className="fw-bold mb-3 h4font text-lg-start text-center">
                  Overview
                </h2>
                <p
                  className="fw-medium " style={{textAlign: "justify"}}
                  dangerouslySetInnerHTML={{
                    __html: result?.overviewSection?.description
                      ? result?.overviewSection?.description
                      : "We are an emerging financial technology platform company that offers proprietary research analytics, data and tools for both institutional and retail equity traders through our flagship platform, SentimenTrader.com. By integrating advanced technologies, including artificial intelligence AI tools, with the critical thinking and analytical abilities of our team of evidenced-based trading veterans, we aim to provide our Users with a powerful combination of technology and expertise, enabling them to make informed decisions to level-up their trading in the markets. Our platform is powered by an advanced data collection system that operates utilizing API calls and web scraping, fetching raw data 24/7 from a wide array of authoritative sources, including industry leaders like Bloomberg, Chicago Board Options Exchange, Consensus, Commodity Futures Trading Commission,",
                  }}
                />
              </div>

              <div className="col-lg-6 col-12">
                <div className="row gy-4 gx-4">
                  <div className="col-12">
                    <div className="overview_box f1 py-5 px-5 position-relative z-1">
                      <h3 className="display-5 fw-medium">
                        {result?.overviewSection?.overviewSection1_title
                          ? result?.overviewSection?.overviewSection1_title
                          : "Innovative Technology"}
                      </h3>
                      <p className="fs-4 fw-normal">
                        {result?.overviewSection?.overviewSection1_description
                          ? result?.overviewSection
                              ?.overviewSection1_description
                          : "AI models that decode market sentiment"}
                      </p>
                      <img
                        src={overviewBackground}
                        className="position-absolute end-0 bottom-0"
                        alt=""
                      />
                    </div>
                  </div>

                  <div className="col-sm-6 col-12">
                    <div className="overview_box h-100 f2 py-5 px-5"  style={{background:`linear-gradient(224.26deg, ${brandingResult?.branding_primary_color} 0%,${brandingResult?.branding_secondary_color} 99.81%)`}}>
                      <h3 className="display-5 fw-medium text-light">
                        {result?.overviewSection?.overviewSection2_title
                          ? result?.overviewSection?.overviewSection2_title
                          : "Proven Platform"}
                      </h3>
                      <p className="fs-4 fw-normal text-light">
                        {result?.overviewSection?.overviewSection2_description
                          ? result?.overviewSection
                              ?.overviewSection2_description
                          : "A growing, loyal user base and positive feedback"}
                      </p>
                    </div>
                  </div>

                  <div className="col-sm-6 col-12">
                    <div className="overview_box h-100 f3 py-5 px-5">
                      <h3 className="display-5 fw-medium">
                        {result?.overviewSection?.overviewSection3_title
                          ? result?.overviewSection?.overviewSection3_title
                          : "Expert Leadership"}
                      </h3>
                      <p className="fs-4 fw-normal">
                        {result?.overviewSection?.overviewSection3_description
                          ? result?.overviewSection
                              ?.overviewSection3_description
                          : "A team committed to innovation and market growth"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OverviewSection;
