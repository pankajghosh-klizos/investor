function Input({
  idN,
  label,
  type,
  classN = "from-control",
  required = false,
  placeholder,
  ragister = "",
  autocomplete = "on",
  ...rest
}) {
  return (
    <>
      <label htmlFor={idN} className="from-label mb-xxl-3 mb-2">
        {label} <span className="text-danger">{required && "*"}</span>
      </label>
      <input
        type={type}
        className={classN}
        id={idN}
        name={idN}
        {...ragister}
        placeholder={placeholder}
        autoComplete={autocomplete}
        {...rest}
      />
    </>
  );
}

export default Input;
