import Link from 'next/link'
import { FaAnglesRight } from "react-icons/fa6";

function PressReleaseBox({ pressReleaseData }) {
  return (
    <div className="card press-releases-box rounded-5 overflow-hidden border-0">
      <Link href={pressReleaseData?.pressReleaseUrl}>
        <img
          src={
            pressReleaseData?.pressReleaseImage
              ? pressReleaseData?.pressReleaseImage
              : pressReleaseData?.img
          }
          className="card-img-top hover-effect"
          alt="..."
        />
      </Link>

      <div className="card-body py-5 px-5 pb-2">
        <div className="tag rounded-5 py-2 px-3 fs-4 fw-normal d-flex align-items-center mb-3">
          <span className="d-inline-block rounded-circle me-3"></span>
          Investment Articles
        </div>
        <h3 className="card-title fs-1 fw-bold mb-3">
          {pressReleaseData?.pressReleaseTitle}
        </h3>
        <ul className="d-flex gap-5 p-0 fw-medium fs-5">
          <li>
            {new Date(pressReleaseData?.pressReleaseDate).toLocaleString(
              "en-US",
              {
                timeZone: "America/New_York",
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
            )}
          </li>
          <li>10 min read</li>
        </ul>
        <p
          className="card-text fw-medium mb-4"
          style={{ textAlign: "justify" }}
        >
          {pressReleaseData?.pressReleaseDescription}
        </p>
        
      </div>
      <div className="card-footer pb-5 px-5 bg-transparent border-0">
        <Link
          href={pressReleaseData?.pressReleaseUrl}
          className="read-more fw-medium fs-2"
        >
          Read More <FaAnglesRight size={18} className="ms-2" />
        </Link>
      </div>
    </div>
  );
}

export default PressReleaseBox;
