function IpoSectionHead({title, shortTitle}) {
    return (
        <div className="d-flex flex-column align-items-center py-lg-5 py-3 mb-5">
            <h2 className="fw-medium section-title mb-xl-4 mb-lg-4 mb-3">
              {title}
            </h2>
            <p className="fw-medium section-para">
              {shortTitle}
            </p>
        </div>
    )
}

export default IpoSectionHead
