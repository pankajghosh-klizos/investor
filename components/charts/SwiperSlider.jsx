import { FaArrowLeft, FaArrowRight, FaRegClock } from "react-icons/fa6";
import { LuCalendar } from "react-icons/lu";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import required modules
import { EffectFade, Navigation, Pagination } from "swiper/modules";

import PressReleaseBox from "./PressReleaseBox";
import { grow } from "@/constants/images";

function OverviewSlider({ result }) {
  return (
    <div className="position-relative overview-slider-container">
      <Swiper
        spaceBetween={30}
        effect={"fade"}
        navigation={{
          prevEl: ".custom-prev-overview",
          nextEl: ".custom-next-overview",
        }}
        pagination={{ clickable: true }}
        modules={[EffectFade, Navigation, Pagination]}
        className="overview-slider"
      >
        {(result?.boardOfMembersSection?.member?.length > 0
          ? result?.boardOfMembersSection?.member
          : null
        )?.map((item) => (
          <SwiperSlide key={item.member_unique_id ? item.member_unique_id : ""}>
            <div className="row gy-5">
              <div className="col-lg-5 order-lg-1 order-2">
                <div className="content position-relative z-1 ">
                  <p>
                    {item.member_description ? item.member_description : ""}
                  </p>

                  <div className="pulse_div">
                    <div className="pulse-icon">
                      <div className="elements">
                        <div className="pulse pulse-1"></div>
                        <div className="pulse pulse-2"></div>
                        <div className="pulse pulse-3"></div>
                        <div className="pulse pulse-4"></div>
                        <div className="pulse pulse-5"></div>
                        <div className="pulse pulse-6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-7 order-lg-2 order-1">
                <div className="user-det position-relative">
                  <img
                    src={item.member_image ? item.member_image : ""}
                    alt={item.member_name ? item.member_name : ""}
                    className="mx-auto d-table h-100"
                  />
                  <div className="bottom-user-info position-absolute bottom-0 start-0 z-1 w-100 py-4 px-sm-5 px-3">
                    <h2 className="fw-bold text-center text-light mb-0">
                      {item.member_name ? item.member_name : ""} -{" "}
                      <span className="fw-normal">
                        {item.member_designation ? item.member_designation : ""}
                      </span>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons with Icons */}
      {result?.boardOfMembersSection?.member?.length > 0 && (
        <>
          <div className="custom-prev-overview navigation-button d-flex justify-content-center align-items-center">
            <FaArrowLeft size={30} />
          </div>
          <div className="custom-next-overview navigation-button d-flex justify-content-center align-items-center">
            <FaArrowRight size={30} />
          </div>
        </>
      )}
    </div>
  );
}

function ManagementSlider({ result }) {
  return (
    <div className="position-relative management-slider-container">
      <Swiper
        spaceBetween={30}
        effect={"fade"}
        navigation={{
          prevEl: ".custom-prev-management",
          nextEl: ".custom-next-management",
        }}
        pagination={{ clickable: true }}
        modules={[EffectFade, Navigation, Pagination]}
        className="management-slider"
      >
        {(result?.boardOfManagementSection?.boardManagment?.length > 0
          ? result?.boardOfManagementSection?.boardManagment
          : null
        )?.map((item) => (
          <SwiperSlide key={item.member_unique_id ? item.member_unique_id : ""}>
            <div className="row gy-5">
              <div className="col-lg-5 order-lg-1 order-2">
                <div className="content position-relative z-1 ">
                  <p>
                    {item.member_description ? item.member_description : ""}
                  </p>

                  <div className="pulse_div">
                    <div className="pulse-icon">
                      <div className="elements">
                        <div className="pulse pulse-1"></div>
                        <div className="pulse pulse-2"></div>
                        <div className="pulse pulse-3"></div>
                        <div className="pulse pulse-4"></div>
                        <div className="pulse pulse-5"></div>
                        <div className="pulse pulse-6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-7 order-lg-2 order-1">
                <div className="user-det position-relative">
                  <img
                    src={item.member_image ? item.member_image : ""}
                    alt={item.member_name ? item.member_name : ""}
                    className="mx-auto d-table h-100"
                  />
                  <div className="bottom-user-info position-absolute bottom-0 start-0 z-1 w-100 py-4 px-sm-5 px-3">
                    <h2 className="fw-bold text-center text-light mb-0">
                      {item.member_name ? item.member_name : ""} -{" "}
                      <span className="fw-normal">
                        {item.member_designation ? item.member_designation : ""}
                      </span>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons with Icons */}
      {result?.boardOfManagementSection?.boardManagment?.length > 0 && (
        <>
          <div className="custom-prev-management navigation-button d-flex justify-content-center align-items-center">
            <FaArrowLeft size={30} />
          </div>
          <div className="custom-next-management navigation-button d-flex justify-content-center align-items-center">
            <FaArrowRight size={30} />
          </div>
        </>
      )}
    </div>
  );
}

function PressreleasesSlider({ PressReleaseData }) {
  return (
    <div className="position-relative pressreleases-slider-container">
      <Swiper
        slidesPerView={1}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 26,
          },
        }}
        spaceBetween={30}
        effect={"fade"}
        navigation={{
          prevEl: ".pressreleases-prev",
          nextEl: ".pressreleases-next",
        }}
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
        className="pressreleases-slider pb-5"
      >
        {PressReleaseData?.map((item, index) => (
          <SwiperSlide key={index}>
            <PressReleaseBox pressReleaseData={item} />
          </SwiperSlide>
        ))}
      </Swiper>

      {PressReleaseData?.length > 3 && (
        <>
          <div className="pressreleases-prev navigation-button d-flex justify-content-center align-items-center">
            <FaArrowLeft size={30} />
          </div>
          <div className="pressreleases-next navigation-button d-flex justify-content-center align-items-center">
            <FaArrowRight size={30} />
          </div>
        </>
      )}
    </div>
  );
}

function EventSlider({ result, primaryColor, secondaryColor }) {
  return (
    <div className="position-relative event-slider-container">
      <Swiper
        spaceBetween={30}
        effect={"fade"}
        navigation={{
          prevEl: ".custom-prev",
          nextEl: ".custom-next",
        }}
        pagination={{ clickable: true }}
        modules={[EffectFade, Navigation, Pagination]}
        className="overview-slider event-slider"
      >
        {(result?.eventAndInsightSection?.event_details?.length > 0
          ? result?.eventAndInsightSection?.event_details
          : null
        )?.map((item) => (
          <SwiperSlide key={item?.event_unique_id ?? item?.event_unique_id}>
            <div className="row gy-5">
              <div className="col-lg-7 order-lg-1 order-2">
                <div
                  className="event-left-box position-relative"
                  style={{
                    background: `radial-gradient(${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  <h4 className="text-light mb-5">{item?.event_title}</h4>
                  <p className="text-light mb-5">{item?.event_description}</p>
                  <h4 className="text-light fw-normal mb-3">
                    Mark Your Calendar!
                  </h4>
                  <ul className="text-light d-flex p-0 mb-5">
                    <li className="d-flex align-items-center">
                      <LuCalendar size={18} className="me-3" />
                      {item?.event_date}
                    </li>
                    <li className="d-flex align-items-center">
                      <FaRegClock size={18} className="me-3" />
                      {item?.event_time}
                    </li>
                  </ul>
                  <p className="text-light">Speaker</p>
                  <h3 className="text-light p-info fw-bold mb-5">
                    {item?.speaker_name}{" "}
                    <span className="fw-normal">
                      {item?.speaker_designation}
                    </span>
                  </h3>
                </div>
              </div>

              <div className="col-lg-5 order-lg-2 order-1">
                <div
                  className="event-right-box z-1"
                  style={{
                    background: `radial-gradient(${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  <h3 className="p-info fw-bold">
                    {item?.speaker_name}{" "}
                    <span className="fw-normal">
                      {item?.speaker_designation}
                    </span>
                  </h3>
                  <h2 className="fw-medium text-light">
                    {item?.event_short_tag}
                  </h2>

                  <p className="text-light fw-normal mb-5">Key Points</p>
                  <ul className="p-0">
                    {item?.key_points?.map((data, index) => (
                      <li className="mb-3" key={index}>
                        <img src={grow} alt="" /> <span>{data}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="user-image position-absolute end-0">
                    <img src={item?.speaker_image} alt="" className="h-100" />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {result?.eventAndInsightSection?.event_details?.length > 0 && (
        <>
          <div className="custom-prev navigation-button d-flex justify-content-center align-items-center">
            <FaArrowLeft size={30} />
          </div>
          <div className="custom-next navigation-button d-flex justify-content-center align-items-center">
            <FaArrowRight size={30} />
          </div>
        </>
      )}
    </div>
  );
}

export { OverviewSlider, EventSlider, ManagementSlider, PressreleasesSlider };
