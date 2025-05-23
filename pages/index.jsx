import Link from "next/link";
import Head from "next/head";
import {
  leadership,
  pressReleases1,
  pressReleases2,
  pressReleases3,
} from "../constants/images.js";
import { FaBarsStaggered, FaRegClock, FaXmark } from "react-icons/fa6";
import { IoIosCall, IoIosMail } from "react-icons/io";
import { IoEyeOutline } from "react-icons/io5";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import EmailAlertSection from "@/components/charts/IpoComponent/EmailAlertSection.jsx";
import {
  OverviewSlider,
  ManagementSlider,
  EventSlider,
} from "@/components/charts/SwiperSlider.jsx";
import { GovDoc, AnnouncementDoc } from "@/components/charts/Doc.jsx";
import IpoSectionHead from "@/components/charts/IpoSectionHead.jsx";
import OurvisionSection from "@/components/charts/IpoComponent/OurVisionSection.jsx";
import OverviewSection from "@/components/charts/IpoComponent/OverviewSection.jsx";
import PressReleasesSection from "@/components/charts/IpoComponent/PressReleasesSection.jsx";
import RequestModl from "@/components/charts/RequestModl.jsx";
import LeadPopUp from "@/components/charts/LeadPopUp.jsx";
import PageLoader from "@/components/charts/PageLoader.jsx";

const API_BASE_URI = process.env.NEXT_PUBLIC_API_BASE_URI;

const fallbackMetadata = {
  title: "Investor Relations",
  description: "Investor Relations description.",
  ogTitle: "Investor Relations",
  ogDescription: "Investor Relations description.",
  ogUrl: "https://athr.investor.klizos.com",
  ogSiteName: "Investor Relations",
  ogImage:
    "https://res.cloudinary.com/dad2aebqt/image/upload/v1747226009/image__3__720_wop1ln.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "Investor Relations Preview",
  ogType: "website",
};

function Investor() {
  const { quotes } = useSelector((state) => state?.stock);

  const isuser = true;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState([]);
  const [secfiling, setSecFilings] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [tickerSymbol, setTickerSymbol] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filteredFilings, setFilteredFilings] = useState([]);
  const [pressReleases, setPressReleases] = useState([]);
  const [brandingResult, setBrandingResult] = useState(null);
  const [isLead, setIsLead] = useState(false);
  const [domain, setDomain] = useState("");
  const menuRef = useRef();
  const navigate = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#1b2e67");
  const [secondaryColor, setSecondaryColor] = useState("#171725");

  const formatSmartDecimal = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "N/A";

    // Convert to a fixed precision string to handle float issues
    const fixedStr = num.toFixed(10); // Gives something like '0.0012000000'
    const [intPart, decPart] = fixedStr.split(".");

    // Count leading zeros in the decimal part
    const leadingZerosMatch = decPart.match(/^0+/);
    const leadingZerosCount = leadingZerosMatch
      ? leadingZerosMatch[0].length
      : 0;

    let result;

    if (leadingZerosCount >= 2) {
      // Keep more decimal places if many leading zeros
      result = parseFloat(num.toFixed(8)); // Convert back to remove trailing zeroes
    } else {
      result = parseFloat(num.toFixed(2)); // Round to 2 decimals and strip trailing zeros
    }

    return result.toString();
  };

  // for fetching content details
  useEffect(() => {
    const fetchContentManagementDetails = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URI}/manage-content/get-content-management-details/${window.location.hostname}`
        );

        if (res.data?.isLeadUser === "lead access granted") {
          setTimeout(() => setIsLead(true), 5000);
        }

        console.log(res?.data);
        setDomain(res.data?.domain);
        setResult(res.data?.investorResponse);
        setBrandingResult(
          res.data?.investorResponse?.brandingId?.brandingSection
        );
        setTickerSymbol(res.data?.symbol);
        setPrimaryColor(
          res.data?.investorResponse?.brandingId?.brandingSection
            ?.branding_primary_color
        );
        setSecondaryColor(
          res.data?.investorResponse?.brandingId?.brandingSection
            ?.branding_secondary_color
        );

        if (res.data?.symbol) {
          await fetchFilings(res.data?.symbol);
        }
      } catch (err) {
        if (!err.response?.data?.success) {
          console.log("Investor content not found");
          navigate.push("/page-not-found");
          return;
        }
        console.error("Error fetching content area:", err);
      } finally {
        setTimeout(() => {
          setPageLoading(false);
        }, 1200);
      }
    };

    const fetchFilings = async (symbol) => {
      setLoading(true);

      try {
        const queryParams = new URLSearchParams();
        if (typeFilter) queryParams.append("type", typeFilter);

        const response = await axios.get(
          `${API_BASE_URI}/sec-filings/${symbol}?${queryParams}`
        );

        setSecFilings(response.data?.data);
        setFilteredFilings(response.data?.data);
      } catch (err) {
        console.log("error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContentManagementDetails();
  }, []);

  // for fetching press releases
  useEffect(() => {
    const fetchPressReleases = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          `${API_BASE_URI}/press-release/investor-press-page/${window.location.hostname}`
        );

        if (response.data?.success) {
          setPressReleases(response.data?.press);
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPressReleases();
  }, []);

  useEffect(() => {
    if (typeFilter === "") {
      setFilteredFilings(secfiling);
    } else {
      setFilteredFilings(
        secfiling.filter((filing) => filing.form === typeFilter)
      );
    }
  }, [typeFilter, secfiling]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (window.scrollY > 1) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // using usa timestamp
  const formatDate = () => {
    const now = new Date();
    return (
      now.toLocaleString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }) + " EST"
    );
  };

  const navMenu = [
    { id: "overview", slug: "overview", label: "Overview", isActtive: true },
    {
      id: "press-releases",
      slug: "press-releases",
      label: "Press Releases",
      isActtive: true,
    },
    { id: "resources", slug: "resources", label: "Resources", isActtive: true },
  ];

  const activeNavMenu = [
    {
      id: "overview",
      slug: "overview",
      label: "Overview",
      color: primaryColor ? primaryColor : "#6c5ce7",
      isActtive: true,
    },
    {
      id: "press-releases",
      slug: "press-releases",
      label: "Press Releases",
      color: primaryColor ? primaryColor : "#6c5ce7",
      isActtive: true,
    },
    {
      id: "corporate-governance",
      slug: "corporate-governance",
      label: "Corporate Governance",
      color: primaryColor ? primaryColor : "#6c5ce7",
      isActtive: true,
    },
    {
      id: "sec-filings",
      slug: "sec-filings",
      label: "SEC Filings",
      color: primaryColor ? primaryColor : "#6c5ce7",
      isActtive: true,
    },
    {
      id: "resources",
      slug: "resources",
      label: "Resources",
      color: primaryColor ? primaryColor : "#6c5ce7",
      isActtive: true,
    },
  ];

  const footerMenu = [
    { id: "home", slug: "main", label: "IR Home", isActtive: true },
    {
      id: "press-release",
      slug: "press-release",
      label: "Press Release",
      isActtive: true,
    },
    { id: "resources", slug: "resources", label: "Resources", isActtive: true },
  ];

  const activefooterMenu = [
    { id: "home", slug: "main", label: "IR Home", isActtive: true },
    {
      id: "press-releases",
      slug: "press-releases",
      label: "Press Releases",
      isActtive: true,
    },
    {
      id: "corporate-governance",
      slug: "corporate-governance",
      label: "Corporate Governance",
      isActtive: true,
    },
    {
      id: "sec-filings",
      slug: "sec-filings",
      label: "SEC Filings",
      isActtive: true,
    },
    { id: "resources", slug: "resources", label: "Resources", isActtive: true },
  ];

  const PressReleaseData = [
    {
      img: pressReleases2,
      slug: "/",
      date: "Jan 09",
      title: "Welcomes New Chief Financial Officer",
      desc: "Knowledge fuels confident investing. At our articles offer actionable insights and comprehensive analyses, showcasing how AI and sentiment analysis revolutionize investing and trading, helping you make informed decisions and optimize strategies with confidence.",
    },
    {
      img: pressReleases1,
      slug: "/",
      date: "Jan 09",
      title: "Welcomes New Chief Financial Officer",
      desc: "Knowledge fuels confident investing. At our articles offer actionable insights and comprehensive analyses, showcasing how AI and sentiment analysis revolutionize investing and trading, helping you make informed decisions and optimize strategies with confidence.",
    },
    {
      img: pressReleases3,
      slug: "/",
      date: "Jan 09",
      title: "Welcomes New Chief Financial Officer",
      desc: "Knowledge fuels confident investing. At our articles offer actionable insights and comprehensive analyses, showcasing how AI and sentiment analysis revolutionize investing and trading, helping you make informed decisions and optimize strategies with confidence.",
    },
  ];

  const GovDocData = [
    {
      document_title: "Aether Code of Business Conduct and Ethics",
      document_file: "../aether-code-of-business-conduct-and-ethics.pdf",
    },
    {
      document_title: "Committee Charters",
      document_file: "../audit-committee-charter.pdf",
    },
    {
      document_title: "Whistleblower Policy",
      document_file: "../whistle-blower-policy.pdf",
    },
    {
      document_title: "Nomination and Compensation",
      document_file: "../nomination-and-compensation.pdf",
    },
  ];

  const menuData = isuser ? activeNavMenu : navMenu;
  const footerMenuData = isuser ? activefooterMenu : footerMenu;

  if (pageLoading) {
    return <PageLoader primaryColor={primaryColor} />;
  }

  return (
    <>
      <Head>
        <title>{fallbackMetadata.title}</title>
        <meta name="description" content={fallbackMetadata.description} />

        {/* Open Graph meta tags */}
        <meta property="og:title" content={fallbackMetadata.ogTitle} />
        <meta
          property="og:description"
          content={fallbackMetadata.ogDescription}
        />
        <meta property="og:url" content={fallbackMetadata.ogUrl} />
        <meta property="og:site_name" content={fallbackMetadata.ogSiteName} />
        <meta property="og:image" content={fallbackMetadata.ogImage} />
        <meta
          property="og:image:width"
          content={fallbackMetadata.ogImageWidth.toString()}
        />
        <meta
          property="og:image:height"
          content={fallbackMetadata.ogImageHeight.toString()}
        />
        <meta property="og:image:alt" content={fallbackMetadata.ogImageAlt} />
        <meta property="og:type" content={fallbackMetadata.ogType} />

        {/* Twitter card (optional but recommended) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fallbackMetadata.ogTitle} />
        <meta
          name="twitter:description"
          content={fallbackMetadata.ogDescription}
        />
        <meta name="twitter:image" content={fallbackMetadata.ogImage} />
      </Head>

      <main className="ipo-container" style={{ overflowX: "hidden" }}>
        {/* <section className="position-relative z-1" id="main"> */}
        <section
          id="main"
          className="position-relative"
          style={{
            background: `radial-gradient(${primaryColor}, ${secondaryColor})`,
          }}
        >
          <header className="pb-sm-5 pb-4 pt-sm-4 pt-3 bg-transparent">
            <div className="container-fluid">
              <div className="row">
                <div className="d-flex justify-content-lg-between align-items-center px-sm-5 p-3">
                  {brandingResult?.branding_logo && (
                    <Link
                      className="header_logo"
                      href={`https://${domain}` || `http://${domain}`}
                      target="_blank"
                    >
                      <img
                        src={brandingResult?.branding_logo}
                        alt="header logo"
                      />
                    </Link>
                  )}

                  <div className="menu-btn d-lg-none d-table text-end ms-lg-0 ms-auto me-lg-0 me-4">
                    <button
                      className="menu-toggle border-0 bg-transparent text-light"
                      onClick={toggleMenu}
                    >
                      {isMenuOpen ? (
                        <FaXmark size={28} />
                      ) : (
                        <FaBarsStaggered size={28} />
                      )}
                    </button>
                  </div>

                  <ul
                    className={`mb-0 navMenu ${isMenuOpen ? "open" : ""}`}
                    ref={menuRef}
                  >
                    {menuData?.map((item, index) => {
                      const uniqueClass = `nav-link-${item.slug}`;
                      const underlineColor = item.color || "#6c5ce7";

                      return (
                        <li
                          className="nave-item d-lg-inline-block d-block px-xl-4 px-3 py-3"
                          key={item.id}
                        >
                          <a
                            href={`#${item.slug}`}
                            className={`nave-link d-block fw-normal me-xl-3 me-0 position-relative ${uniqueClass}`}
                            style={{ textDecoration: "none" }}
                          >
                            {console.log("color" + underlineColor)}
                            {item.label}
                            <span style={{ background: underlineColor }}></span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </header>

          <section className="banner position-relative">
            <div className="container-md px-md-0 px-3">
              <div className="row">
                <div className="col-lg-7 col-12 py-5 d-flex flex-column justify-content-center">
                  {/* <h1 className="fw-medium text-uppercase text-lg-start text-center">
                    {result?.headerSection?.title
                      ? result?.headerSection?.title
                      : "Investor Relations"}
                  </h1> */}
                  <h1 className="fw-medium text-uppercase text-lg-start text-center">
                    Investor Relations
                  </h1>
                </div>

                <div className="col-lg-5 col-12 py-5 ps-lg-5 px-3">
                  <div className="ipo_box">
                    <div className="inner">
                      {quotes ? (
                        <table className="table bg-transparent">
                          <thead>
                            <tr>
                              <th className="py-3">
                                <img src="/nasdaq.png" alt="nasdaq logo" />
                              </th>
                              <th>
                                <h3 className="text-light">{tickerSymbol}</h3>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-3">
                                <h2>
                                  <b>
                                    $
                                    {quotes?.["05. price"] !== undefined
                                      ? formatSmartDecimal(
                                          parseFloat(quotes["05. price"])
                                        )
                                      : "0"}
                                  </b>
                                </h2>
                              </td>
                              <td className="py-3">
                                <h3 className="text-light">
                                  {quotes?.["10. change percent"] !== undefined
                                    ? formatSmartDecimal(
                                        parseFloat(quotes["10. change percent"])
                                      ) + "%"
                                    : "0%"}{" "}
                                  <br /> ($
                                  {quotes?.["09. change"] !== undefined
                                    ? formatSmartDecimal(
                                        parseFloat(quotes["09. change"])
                                      )
                                    : "0"}
                                  )
                                </h3>
                              </td>
                            </tr>

                            <tr>
                              <td className="py-3">
                                <h3 className="text-light">Market Cap:</h3>
                              </td>
                              <td className="py-3">
                                <h3 className="text-light">
                                  $
                                  {quotes?.["11. market cap (intraday)"] !==
                                  undefined
                                    ? quotes["11. market cap (intraday)"]
                                    : "N/A"}
                                </h3>
                              </td>
                            </tr>

                            <tr>
                              <td className="py-4" colSpan={2}>
                                <p className="fs-4 fw-normal text-light mb-0">
                                  {formatDate()}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td className="border-0 py-4" colSpan={2}>
                                <div className="d-flex align-items-center">
                                  <FaRegClock size={18} color="#fff" />
                                  <p className="fs-4 fw-normal text-light ms-3 mb-0">
                                    Open Monday to Friday, from 9:30 AM to 4:00
                                    PM EST
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      ) : (
                        <table
                          className="table bg-transparent border-0 m-0"
                          style={{ height: "300px" }}
                        >
                          <tbody>
                            <tr>
                              <td
                                colSpan={2}
                                className="text-center align-middle border-0"
                                style={{ height: "100%", padding: 0 }}
                              >
                                <div
                                  className="d-flex justify-content-center align-items-center"
                                  style={{ height: "100%" }}
                                >
                                  <div
                                    className="spinner-border"
                                    style={{
                                      color: "#A855F7",
                                      width: "3rem",
                                      height: "3rem",
                                    }}
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                      {/* <div className="coming-ipoempty"></div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* <img
            src={ipoBanner}
            className="banner_background position-absolute top-0 start-0 w-100 h-100 object-fit-cover z-n1"
            alt=""
          /> */}
        </section>

        <OverviewSection
          isuser={isuser}
          result={result}
          tickerSymbol={tickerSymbol}
          brandingResult={brandingResult}
        />

        {result?.discoveredSection?.status === "active" ? (
          <OurvisionSection result={result} />
        ) : null}

        {result?.pressReleaseSection?.status === "active" &&
        pressReleases?.length > 0 ? (
          <>
            <PressReleasesSection
              PressReleaseData={pressReleases}
              DefaultPressReleaseData={PressReleaseData}
              result={result}
            />
          </>
        ) : null}

        {isuser && (
          <>
            {/* Governance Section */}
            {result?.governanceSection?.status === "active" && (
              <section
                className="leadership-section common_section "
                id="corporate-governance"
              >
                <div className="container-fluid">
                  <div className="row">
                    <IpoSectionHead
                      title={
                        result?.governanceSection?.title ??
                        "Strong Governance, Trusted Leadership"
                      }
                      shortTitle={
                        result?.governanceSection?.description ??
                        "Ensuring Transparency, Accountability, and Sustainable Growth Through Ethical Practices"
                      }
                    />
                  </div>
                </div>

                <div className="container-fluid mt-5 rounded-4 overflow-hidden">
                  <img
                    src={result?.governanceSection?.image ?? leadership}
                    className="h-100 w-100 rounded-4"
                    alt="leadership image"
                  />
                </div>
              </section>
            )}

            {/* Board of Members Section */}
            {result?.boardOfMembersSection?.status === "active" && (
              <>
                {result?.boardOfMembersSection?.member?.length > 0 && (
                  <>
                    <div className="container-fluid mt-5 pt-5">
                      <div className="col-12">
                        <h3 className="fw-bold h4font text-lg-start text-center mb-lg-0 mb-4">
                          {result?.boardOfMembersSection?.title ??
                            "Board of Directors"}
                        </h3>
                      </div>
                    </div>
                    <div className="container-fluid mt-5 pt-5">
                      <OverviewSlider result={result} />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Management Section */}
            {result?.boardOfManagementSection?.status === "active" && (
              <>
                {result?.boardOfManagementSection?.boardManagment?.length >
                  0 && (
                  <>
                    <div className="container-fluid mt-5 pt-5">
                      <div className="col-12">
                        <h3 className="fw-bold h4font text-lg-start text-center mb-lg-0 mb-4">
                          {result?.boardOfManagementSection?.title ??
                            "Managements"}
                        </h3>
                      </div>
                    </div>
                    <div className="container-fluid mt-5 pt-5">
                      <ManagementSlider result={result} />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Governance Documents Section */}
            {result?.governmentDocumentationSection?.status === "active" &&
              (result?.governmentDocumentationSection?.gov_doc_details?.length >
              0 ? (
                <div className="container-fluid mt-5 pt-5 governance-documents">
                  <div className="row">
                    <h3 className="h4font fw-bold mb-5">
                      {result?.governmentDocumentationSection?.title ??
                        "Governance Documents"}
                    </h3>
                    <p className="fw-medium para2 lh-base text-lg-start text-center me-5">
                      {result?.governmentDocumentationSection?.description ??
                        "The Board of Directors of the Company values the importance of sound corporate governance practices. It is the duty of the Board of Directors to serve as a prudent fiduciary for shareholders and to oversee the management of the Company's business. To fulfill its responsibilities and to discharge its duty, the Board of Directors follows the procedures and standards that are set forth in these policies and charters. These documents are subject to modification from time to time as the Board of Directors deems appropriate and in the best interests of the Company or as required by applicable laws and regulations."}
                    </p>

                    <div className="col-12 mt-4">
                      <ul className="p-0 m-0 row gx-4">
                        {result?.governmentDocumentationSection?.gov_doc_details
                          ?.length > 0
                          ? result.governmentDocumentationSection.gov_doc_details.map(
                              (item, index) => (
                                <GovDoc govDocData={item} key={index} />
                              )
                            )
                          : null}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null)}

            {/* Events & Insights Section */}
            {result?.eventAndInsightSection?.status === "active" &&
              result?.eventAndInsightSection?.event_details?.length > 0 && (
                <div className="leadership-section common_section">
                  <div className="container-fluid">
                    <div className="row">
                      <IpoSectionHead
                        title={
                          result?.eventAndInsightSection?.title ??
                          "Latest Events & Investor Insights"
                        }
                        shortTitle={
                          result?.eventAndInsightSection?.description ??
                          "Stay informed with our latest announcements, financial disclosures, and industry insights."
                        }
                      />
                    </div>
                  </div>

                  <div className="container-fluid mt-5 pt-5">
                    <EventSlider
                      // EventData={EventData}
                      result={result}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  </div>
                </div>
              )}

            {/* SEC Filings Section */}
            {result?.secFilingSection?.status === "active" && (
              <section
                className="leadership-section common_section"
                id="sec-filings"
              >
                <div className="container-fluid">
                  <div className="row">
                    <IpoSectionHead
                      title={result?.secFilingSection?.title ?? "SEC Filings"}
                      shortTitle={
                        result?.secFilingSection?.description ??
                        "Stay up to date with our latest SEC filings, financial reports, and regulatory disclosures."
                      }
                    />
                  </div>
                </div>

                <div className="container-fluid secfilings-table mt-5 pt-5">
                  {/* Dropdown Filter */}
                  <div className="col-xl-2 col-md-3 col-sm-5 col-6">
                    <select
                      className="fw-medium form-select rounded-4 border-black mb-5 px-4 pe-5 sec-options"
                      aria-label="Filter Filings Type"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="">Filter Filings Type</option>
                      {[...new Set(secfiling.map((filing) => filing.form))].map(
                        (uniqueForm, index) => (
                          <option key={index} value={uniqueForm}>
                            {uniqueForm}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* SEC Filings Table */}
                  <div className="secfilings-inner">
                    {loading ? (
                      <p className="text-center py-5">Loading SEC Filings...</p>
                    ) : error ? (
                      <p className="text-danger">{error}</p>
                    ) : (
                      <div className="table-container">
                        <table className="table rounded-4">
                          <thead>
                            <tr>
                              <th scope="col">Year</th>
                              <th scope="col">Form</th>
                              <th scope="col">Description</th>
                              <th scope="col">Filed Date</th>
                              <th scope="col">View</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredFilings.length > 0 ? (
                              filteredFilings.map((filing, index) => (
                                <tr key={index}>
                                  <td>{filing.year}</td>
                                  <td>{filing.form}</td>
                                  <td className="w-25">
                                    <p>{filing.description}</p>
                                  </td>
                                  <td>
                                    {
                                      new Date(filing.filedDate)
                                        .toISOString()
                                        .split("T")[0]
                                    }
                                  </td>
                                  <td>
                                    <a
                                      href={filing.documentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <button className="py-2 px-3 rounded-2 border-0 view me-3">
                                        <IoEyeOutline size={22} />
                                      </button>
                                    </a>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center py-5">
                                  No filings found for the selected type
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {result?.announcementSection?.status === "active"
          ? result?.announcementSection?.announce_doc_details?.length > 0 && (
              <div className="container-fluid mt-5 pt-5 governance-documents">
                <div className="row">
                  <h3 className="h4font fw-bold mb-5">
                    {result?.announcementSection?.title
                      ? result?.announcementSection?.title
                      : "Announcements"}
                  </h3>
                  <div className="col-12 mt-4">
                    <ul className="p-0 m-0">
                      {result?.announcementSection?.announce_doc_details
                        ?.length > 0
                        ? result?.announcementSection?.announce_doc_details?.map(
                            (item, index) => (
                              <AnnouncementDoc
                                AnnouncementData={item}
                                key={index}
                              />
                            )
                          )
                        : null}
                    </ul>
                  </div>
                </div>
              </div>
            )
          : null}

        <EmailAlertSection
          activeNavMenu={activeNavMenu}
          result={result}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />

        <footer className="common_section pb-0">
          <div className="top_footer">
            <div className="container-fluid mt-5">
              <div className="row">
                <div className="col-lg-4 col-md-5 col-sm-7 col-8">
                  {brandingResult?.branding_footer_logo && (
                    <a href="#main">
                      <img
                        src={brandingResult?.branding_footer_logo}
                        className="footerLogo img-fluid"
                        alt="footer logo"
                      />
                    </a>
                  )}
                </div>
              </div>
              <div className="row gy-lg-0 gy-5">
                <div className="col-lg-5 col-sm-6">
                  <ul className="p-0">
                    {footerMenuData?.map((item, index) => (
                      <li key={item.id}>
                        <a href={`#${item.slug}`}>{item.label}</a>
                        {/* <NavLink to={item.slug}>{item.label}</NavLink> */}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-lg-4 col-md-6 col-sm-6">
                  <h3 className="display-4 fw-medium mb-4">
                    <Link href={`https://${domain}/`} target="_blank">
                      {result?.companyname
                        ?.split(" ")
                        .map(
                          (word, index) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </Link>
                  </h3>
                  <h5 className="para2 fw-medium">
                    {result?.footerSection?.address
                      ? result?.footerSection?.address
                      : ""}
                  </h5>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6">
                  <h3 className="display-4 fw-medium mb-4">
                    Contact Information
                  </h3>
                  <h5 className="para2 fw-medium">
                    {result?.footerSection?.email &&
                    result.footerSection.email.length > 0
                      ? result.footerSection.email.map((email, index) => (
                          <Link
                            key={`email-${index}`}
                            href={`mailto:${email}`}
                            className="text-decoration-underline d-block mb-3"
                          >
                            <IoIosMail className="me-3" />
                            {email}
                          </Link>
                        ))
                      : ""}
                  </h5>

                  <h5 className="para2 fw-medium">
                    {result?.footerSection?.phone &&
                    result.footerSection.phone.length > 0
                      ? result.footerSection.phone.map((phone, index) => (
                          <Link
                            key={`phone-${index}`}
                            href={`tel:${phone}`}
                            className="text-decoration-underline d-block"
                          >
                            <IoIosCall className="me-3" />
                            {phone}
                          </Link>
                        ))
                      : ""}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          <div className="bottom_footer py-5">
            <div className="container-fluid mt-5">
              <div className="row">
                <div className="col-md-6 col-12">
                  <p className="text-md-start text-center para2 fw-medium">
                    {new Date().getFullYear()} GetIRNow. All Rights Reserved
                    {brandingResult?.privacy_policy ? (
                      <Link
                        href={brandingResult?.privacy_policy}
                        target="_blank"
                        className="text-decoration-underline ms-3"
                      >
                        Privacy Policy
                      </Link>
                    ) : (
                      ""
                    )}
                  </p>
                </div>

                <div className="col-md-6 col-12">
                  <p className="text-md-end text-center para2 fw-medium mb-0">
                    Powered By{" "}
                    <Link
                      href="https://getirnow.com/"
                      target="_blank"
                      className="fw-bold"
                    >
                      GetIRNow
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* RequestModl */}
        <RequestModl />
        {isLead && <LeadPopUp hide={isLead} setHide={setIsLead} />}
      </main>
    </>
  );
}
export default Investor;
