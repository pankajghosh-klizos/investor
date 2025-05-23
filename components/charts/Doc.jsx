import Link from 'next/link';
import { TbFileDownload } from "react-icons/tb";

function GovDoc({ govDocData }) {
  return (
    <div className="col-lg-6 col-12">
      <li className="mb-3">
        <div className="mx-auto d-flex justify-content-between align-items-center py-sm-4 py-3 px-lg-5 px-4">
          <Link
            href={govDocData.document_file}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="fw-medium m-0">{govDocData.document_title}</p>
          </Link>
          <Link
            href={govDocData.document_file}
            target="_blank"
            rel="noopener noreferrer"
          >
            <TbFileDownload size={30} />
          </Link>
        </div>
      </li>
    </div>
  );
}

function AnnouncementDoc({ AnnouncementData }) {
  return (
    <li className="d-flex justify-content-between align-items-center py-sm-4 py-3 px-lg-5 px-4 mb-3">
      <p className="fw-medium m-0">{AnnouncementData?.document_title}</p>
      <p className="fw-small m-0">
        {AnnouncementData?.document_date} at{" "}
        {(() => {
          const timeStr = AnnouncementData?.document_time;
          if (!timeStr) return null;

          const hour = parseInt(timeStr.split(":")[0], 10);
          const isPM = hour >= 12;

          return `${timeStr} ${isPM ? "PM" : "AM"}`;
        })()}
      </p>
      <Link href={AnnouncementData?.document_file} target="_blank"><TbFileDownload size={30} /></Link>
    </li>
  );
}

export { GovDoc, AnnouncementDoc };
