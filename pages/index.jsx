import Link from "next/link";
import Head from "next/head";
import {
  DavidHo,
  davidMandel,
  Edison,
  footerLogo,
  Francis,
  Hao,
  ipoBanner,
  ipoLogo,
  jacklynWu,
  Justin,
  leadership,
  nasdaq,
  nicLin,
  pressReleases1,
  pressReleases2,
  pressReleases3,
  Suresh,
  Timothy,
} from "../constants/images.js";
import {
  FaBarsStaggered,
  FaRegClock,
  FaXmark,
  FaMapLocationDot,
  FaAnglesRight,
} from "react-icons/fa6";
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

export async function getServerSideProps(context) {
  // const origin = context.req.headers.host;
  const origin = "ehvvf.investor.klizos.com";

  const fallbackMetadata = {
    title: "Investor Relations",
    description: "Investor Relations description.",
    ogTitle: "Investor Relations",
    ogDescription: "Investor Relations description.",
    ogUrl: `https://${origin}`,
    ogSiteName: "Investor Relations",
    ogImage:
      "https://res.cloudinary.com/dad2aebqt/image/upload/v1747226009/image__3__720_wop1ln.png",
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: "Investor Relations Preview",
    ogType: "website",
  };

  try {
    const res = await axios.get(
      `${API_BASE_URI}/manage-content/get-content-management-details/${"ehvvf.investor.klizos.com"}`,
      {
        headers: {
          Accept: "application/json",
        },
        timeout: 5000,
      }
    );

    if (!res?.data?.success || !res?.data?.investorResponse) {
      console.error("Error:: Failed to fetch meta info", res?.data);
      return {
        props: {
          metadata: fallbackMetadata,
        },
      };
    }

    const metaData = res.data.investorResponse;
    const baseUrl = `https://${origin}`;
    const fallbackOgImage =
      "https://res.cloudinary.com/dad2aebqt/image/upload/v1747226009/image__3__720_wop1ln.png";

    const ogImage =
      metaData.brandingId?.brandingSection?.og_image ??
      metaData.brandingId?.brandingSection?.branding_logo ??
      fallbackOgImage;

    const absoluteOgImage = ogImage.startsWith("http")
      ? ogImage
      : `${baseUrl}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;

    const pageTitle = metaData.page_title ?? "Investor Relations";
    const description =
      metaData.overviewSection?.description ??
      "Investor Relations description.";

    return {
      props: {
        metadata: {
          title: pageTitle,
          description,
          ogTitle: pageTitle,
          ogDescription: description,
          ogUrl: baseUrl,
          ogSiteName: "Investor Relations",
          ogImage: absoluteOgImage,
          ogImageWidth: 1200,
          ogImageHeight: 630,
          ogImageAlt: pageTitle,
          ogType: "website",
        },
      },
    };
  } catch (error) {
    console.error("Error:: getMetaInfo: ", error);
    return {
      props: {
        metadata: fallbackMetadata,
      },
    };
  }
}

function Investor({ metadata }) {
  const { overview, quotes } = useSelector((state) => state?.stock);

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
          `${API_BASE_URI}/manage-content/get-content-management-details/${"ehvvf.investor.klizos.com"}`
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

        // console.log("response", response);

        setSecFilings(response.data?.data);
        setFilteredFilings(response.data?.data);
      } catch (err) {
        console.log("error", err);
        // setError(err?.response?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContentManagementDetails();
  }, []);

  // for set title
  // useEffect(() => {
  //   document.title = title;
  // }, [title]);

  // for fetching press releases
  useEffect(() => {
    const fetchPressReleases = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          `${API_BASE_URI}/press-release/investor-press-page/${"ehvvf.investor.klizos.com"}`
        );
        // console.log("press-releases response", response);

        if (response.data?.success) {
          setPressReleases(response.data?.press);
        }
      } catch (error) {
        console.log("error", error);

        // setError("Error while fetching press release data");
      } finally {
        setLoading(false);
      }
    };

    fetchPressReleases();
  }, []);

  useEffect(() => {
    // console.log(secfiling);
    // console.log(typeFilter);

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

  const formatMarketCap = (value) => {
    if (!value) return "N/A"; // Handle missing values
    const num = parseFloat(value);

    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"; // Trillion
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"; // Billion
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"; // Million
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"; // Thousand

    return num.toString(); // Return as-is if less than 1000
  };

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

  const OverviewData = [
    {
      key_members_image: nicLin,
      key_members_name: "Nicolas Lin",
      key_members_designation: "Chairman and Interim Chief Executive Officer",
      key_members_info:
        "Nicolas corporate brings a finance decade of acumen, specializing in U.S. transactions and often representing Asian clientele. His board experiences span from companies like Moxian, Inc. (NASDAQ: MOXC), Flewber Global, Inc. (NASDAQ: FLYF) and St James Gold Corp. (TSX-V: LORD; OTCQB: LRDJF), underscoring his expertise in guiding both U.S. and Canadian markets.",
    },
    {
      key_members_image: jacklynWu,
      key_members_name: "Jaclyn Wu",
      key_members_designation: "Executive Director",
      key_members_info:
        "Jaclyn holds over 15 years in finance, marked by her engagement in 100+ seminars that empowered investors. A member of the PCMA Dealing Representative Advisory Committee and a distinguished qualifier of the MDRT Association, she co-founded Monic Financial, emphasizing her leadership in the sector.",
    },

    {
      key_members_image: Justin,
      key_members_name: "Justin Peter Molander",
      key_members_designation: "Independent Director",
      key_members_info:
        "Justin holds over 20 years of experience in financial analysis, market research, and financing high-growth companies assuming prominent positions in the mining industry and academia. Since 2014, he has been the Founder and Managing Director of Trading Post Investments Ltd. and has been teaching business and accounting at various institutions since 2021.",
    },
    {
      key_members_image: davidMandel,
      key_members_name: "David Mandel",
      key_members_designation: "Independent Director",
      key_members_info:
        "David Mandel is the co-founder and Chairman of Bitvore Corp, an AI and machine learning company serving major Wall Street firms since 2014. He was a seed investor in a number of very successful companies such as Broadcom and Fulcrum Microsystems. David holds a degree in Mathematics from the University of Pennsylvania, and brings  extensive experience in technology and finance to Aether's board.",
    },
    {
      key_members_image: Timothy,
      key_members_name: "Timothy Murphy",
      key_members_designation: "Independent Director",
      key_members_info:
        "Timothy  is the Founding Partner of Murphy & Company, LLP, a leading business law firm in Vancouver, Canada, established in January 2011. With over 15 years of experience advising high-growth companies on acquisitions, mergers technology, and and finance matters, he has also served as a CEO and board member for numerous public and private companies.",
    },
  ];

  const ManagementData = [
    {
      key_members_image: Suresh,
      key_members_name: "Suresh R. Iyer",
      key_members_designation: "Chief Finanacial Officer",
      key_members_info:
        "Suresh R. Iyer was appointed as Chief Financial Officer on May 16, 2024. With over 25 years of international finance experience, he is a CPA and ACA credentialed professional who excels in US GAAP, IFRS, SEC Reporting, and IPO readiness, having led financial strategy and audits for major firms, including BDO USA LLP and PricewaterhouseCoopers LLP.",
    },
    {
      key_members_image: nicLin,
      key_members_name: "Nicolas Lin",
      key_members_designation: "Chairman and Interim Chief Executive Officer",
      key_members_info:
        "Nicolas corporate brings a finance decade of acumen, specializing in U.S. transactions and often representing Asian clientele. His board experiences span from companies like Moxian, Inc. (NASDAQ: MOXC), Flewber Global, Inc. (NASDAQ: FLYF) and St James Gold Corp. (TSX-V: LORD; OTCQB: LRDJF), underscoring his expertise in guiding both U.S. and Canadian markets.",
    },
    {
      key_members_image: DavidHo,
      key_members_name: "David Chi Ching Ho",
      key_members_designation: "Chief Strategy Officer",
      key_members_info:
        "Mr. Ho has been the Chief Strategy Officer since April 2024, bringing over 25 years of expertise in corporate strategy, mergers and acquisitions, and joint venture partnerships. He has advised the Hoovest Group on investments and strategic alliances since July 2020 and previously led corporate development at Lai Sun Development. As a co-founder and executive director at Pergill Internationally Holdings Inc., he successfully completed acquisitions totaling US$280 million.",
    },
    {
      key_members_image: Hao,
      key_members_name: "Hao Hu",
      key_members_designation: "Chief Technology Officer",
      key_members_info:
        "Mr. Hu has over 20 years of rich software development and management experience. He served as CTO at several technology companies in domestic and overseas in the past 10 years with huge contributions and improved innovative technology. During his career, he has been exploring the advanced technology, and guides the application of innovative technology approaches, machine learning and integrating artificial intelligence to create novel signals and systematic strategies.",
    },
    {
      key_members_image: Francis,
      key_members_name: "Francis Cid",
      key_members_designation: "Business Development",
      key_members_info:
        "Frank Cid, an accomplished investment banker with over 25 years of experience in capital formation and advisory services, known for his sector-neutral approach, adeptly supports clients ranging from pre-revenue startups to nano and micro-cap public companies. His vast expertise spans diverse industries, solidifying his reputation as a trusted advisor in financial strategy.",
    },
    {
      key_members_image: Edison,
      key_members_name: "Edison Feng",
      key_members_designation: "Business Unit Director",
      key_members_info:
        "Edison brings on years of experience in real estate management, corporate strategies and capital fund-raising. Since 2020, Edison has been managing multi-million construction real estate overseeing from inception through completion of development for the past decade. At the same time, he also has vast experiences in managing real estate portfolios for real estate developers such as 3T Construction, NYVA Group and NYC Vision Development, position as managing Director. Edison graduated from Baruch College Zicklin School of Business, majoring in Real Estate Investment.",
    },
  ];

  const EventData = [
    {
      event_unique_id: 0,
      event_title: "Welcome to the IPO Launch Webniar",
      event_short_tag: "IPO Launch Webniar",
      event_description:
        "Be part of this milestone event as we unveil the journey to our Initial Public Offering (IPO). Gain exclusive insights into the strategies, market opportunities, and leadership vision driving this transformative moment.",
      event_date: "March 02,2025",
      event_time: "3:00 PM EST",
      speaker_name: "Niclos Lin",
      speaker_image: nicLin,
      speaker_designation: "Chief Executive Officer",
      key_points: ["Market insights", "Product Launches", "Executive speeches"],
    },
    {
      event_unique_id: 1,
      event_title: "Welcome to the IPO Launch Webniar II",
      event_short_tag: "IPO Launch Webniar II",
      event_description:
        "Be part of this milestone event as we unveil the journey to our Initial Public Offering (IPO). Gain exclusive insights into the strategies, market opportunities, and leadership vision driving this transformative moment.",
      event_date: "March 02,2025",
      event_time: "3:00 PM EST",
      speaker_image: jacklynWu,
      speaker_name: "Jacklyn Wu",
      speaker_designation: "Executive Director 1",
      key_points: ["Market insights", "Product Launches"],
    },
  ];

  const AnnouncementData = [
    {
      document_title: "2nd Annual General Meeting",
      document_date: "Thursday, April 24, 2025",
      document_time: "4:30 PM",
      document_file: "/",
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
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.ogTitle} />
        <meta property="og:description" content={metadata.ogDescription} />
        <meta property="og:url" content={metadata.ogUrl} />
        <meta property="og:site_name" content={metadata.ogSiteName} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta property="og:image:width" content={metadata.ogImageWidth} />
        <meta property="og:image:height" content={metadata.ogImageHeight} />
        <meta property="og:image:alt" content={metadata.ogImageAlt} />
        <meta property="og:type" content={metadata.ogType} />
        <link
          rel="icon"
          type="image/x-icon"
          href={
            "https://res.cloudinary.com/dad2aebqt/image/upload/v1747227521/favicon_zgyqdj.ico"
          }
        />
        <link
          rel="icon"
          type="image/png"
          href={
            "https://res.cloudinary.com/dad2aebqt/image/upload/v1747227521/favicon_zgyqdj.ico"
          }
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={
            "https://res.cloudinary.com/dad2aebqt/image/upload/v1747227521/favicon_zgyqdj.ico"
          }
        />
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
