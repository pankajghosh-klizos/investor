const NEXT_PUBLIC_ENV = process.env.NEXT_PUBLIC_ENV;

function ErrorContentManagementPage() {
  return (
    <div className="text-center mt-5">
      <h1 className="text-success-emphasis mb-5">
        Your account is pending/disabled! Please wait for admin approval.
      </h1>
      <p className="text-danger mb-3 fs-3">
        Due to some unusual activity, we have temporarily pending/disabled your
        account
      </p>
      <p className="text-secondary mb-3 fs-3">
        If you believe this is a mistake, please contact our support team for
        further assistance..
      </p>

      {/* External link (add target and rel) */}
      <a
        href={
          NEXT_PUBLIC_ENV === "development"
            ? "https://getirnow.klizos.com/"
            : "https://getirnow.com/"
        }
        className="text-primary mt-5 fs-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        Go to Homepage
      </a>
    </div>
  );
}

export default ErrorContentManagementPage;
