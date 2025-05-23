import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import IpoSectionHead from "../IpoSectionHead";

const API_BASE_URI = process.env.NEXT_PUBLIC_API_BASE_URI;

function EmailAlertSection({ activeNavMenu, result, primaryColor, secondaryColor }) {
  const [email, setEmail] = useState("");
  const [alertTypes, setAlertTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const alertOptions = [
    "All",
    "Press Release",
    "Events",
    "Presentations",
    "SEC Filings",
    "Financial Reports",
  ];
  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    const allTypes = [
      "All",
      "Press Release",
      "Events",
      "Presentations",
      "SEC Filings",
      "Financial Reports",
    ];
    console.log(id);
    if (id === "All") {
      if (checked) {
        setAlertTypes(allTypes);
      } else {
        setAlertTypes([]);
      }
    } else {
      setAlertTypes((prev) => {
        const updated = checked
          ? [...new Set([...prev, id])]
          : prev.filter((item) => item !== id);

        // Auto-remove "all" if any individual option is unchecked
        if (updated.includes("All") && id !== "All") {
          return updated.filter((item) => item !== "All");
        }

        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URI}/investor-email-subscription/${window.location.hostname}`,
        {
          email,
          alert_types: alertTypes,
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setEmail("");
        setAlertTypes([]);
      } else {
        toast.error("Something went wrong. Try again later.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
    {result?.InformationRequestSection?.status==="active" || result?.InvestorEmailAlertsSection?.status === "active"? <section className="email-alert-section common_section">
      {result?.InformationRequestSection?.status === "active" ? (
        <div
          className="container-fluid px-lg-5 px-3 mb-5"
          id={activeNavMenu[4]?.id}
        >
          <div className="row">
            <IpoSectionHead
              // title="How Investors Can Submit an Information Request"
              title={`${
                result?.InformationRequestSection?.title
                  ? result?.InformationRequestSection?.title
                  : "How Investors Can Submit an Information Request"
              }`}
              // shortTitle="The Investor Resources section is your go to destination for all essential information about the company’s financial performance, strategic vision, and shareholder updates."
              shortTitle={
                result?.InformationRequestSection?.description
                  ? result?.InformationRequestSection?.description
                  : "The Investor Resources section is your go to destination for all essential information about the company’s financial performance, strategic vision, and shareholder updates."
              }
            />
            <a
              className="register_btn d-table mx-auto mb-5 text-decoration-none"
              style={{ cursor: "pointer", width:"fit-content" }}
              data-bs-toggle="modal"
              data-bs-target="#requestInformation"
            >
              Request Information Now
            </a>
          </div>
        </div>
      ) : null}

      {result?.InvestorEmailAlertsSection?.status === "active" ? (
        <div className="container-fluid">
          <div className="overflow-hidden rounded-5 position-relative mx-3 email-section-main z-1" style={{background: `radial-gradient(${primaryColor}, ${secondaryColor})`}}>
            <div className="row">
              <div className="col-12 d-flex flex-column align-items-center py-lg-5 py-3">
                <h2 className="fw-medium section-title mb-xl-5 mb-lg-4 mb-3 text-light">
                  {result?.InvestorEmailAlertsSection?.title
                    ? result?.InvestorEmailAlertsSection?.title
                    : "Investor Email Alerts"}
                  {/* Investor Email Alerts */}
                </h2>
                <p className="para2 fw-medium text-center text-light">
                  {result?.InvestorEmailAlertsSection?.description
                    ? result?.InvestorEmailAlertsSection?.description
                    : "Stay informed with the latest updates by subscribing to our investor email alerts. Simply enter your email address below and select your preferred alert options."}
                  {/* Stay informed with the latest updates from Aether Holdings
                  Inc. by subscribing to our investor email alerts. Simply enter
                  your email address below and select your preferred alert
                  options. */}
                </p>
              </div>
            </div>
            <div className="row pt-5">
              <div className="col-lg-9 col-12 mx-auto">
                <form onSubmit={handleSubmit}>
                  <div className="mb-5">
                    <label
                      htmlFor="email"
                      className="form-label fs-2 fw-medium"
                    >
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-wrapper d-block">
                      <input
                        type="email"
                        className="form-control position-relative d-block w-100"
                        placeholder="Your email address"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="all" className="form-label fs-2 fw-medium">
                      Mailing List <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex flex-wrap row-gap-3 column-gap-5 fs-4">
                      {alertOptions.map((alert) => (
                        <div className="form-check" key={alert}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={alert}
                            checked={alertTypes.includes(alert)}
                            onChange={handleCheckboxChange}
                          />
                          <label className="form-check-label" htmlFor={alert}>
                            {alert
                              .replace(/([A-Z])/g, "$1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="fs-2 fw-medium position-relative signup_btn mt-5 mx-auto d-table mb-5"
                  >
                    Sign Up
                    {loading && (
                      <div
                        className="spinner-border text-success"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>:null}
    </>
  );
}
export default EmailAlertSection;
