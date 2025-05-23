import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { useState, useEffect } from "react";
import Input from "./Input";
import { toast } from "react-toastify";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import parsePhoneNumberFromString from "libphonenumber-js";

const API_BASE_URI = process.env.NEXT_PUBLIC_API_BASE_URI;

function RequestModl() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
      mode: "all"
    });

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  console.log(errorMsg); 
  

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(`${API_BASE_URI}/user/countries`);
        const data = response?.data?.countries;

        const sortedCountries = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);


  const onSubmit = async (data) => {
    setLoading(true);
    console.log(data);
    
    if (!data.document_request.AnnualProxy && !data.document_request.AnnualReport) {
      setErrorMsg("Please select at least one document request");
      setLoading(false);
      return;
    }

    setErrorMsg("");
    try {
      const response = await axios.post(
        `${API_BASE_URI}/request-informations/static/${window.location.hostname}`,
        data
      );
      toast.success(response.data?.message || "Request submitted successfully");
      setTimeout(() => {
        reset();
        setSelectedCode(null);
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade"
      id="requestInformation"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header border-0 d-block position-relative">
            <h5
              className="modal-title text-center fw-bold"
              id="exampleModalLabel"
            >
              Request Information Form
            </h5>
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row gx-sm-5 gx-3">
                {/* First Name */}
                <div className="from-group mb-4 col-sm-6 col-12">
                  <Input
                    idN="firstname"
                    label="First Name"
                    type="text"
                    required={true}
                    classN="form-control"
                    placeholder="Enter first name"
                    ragister={{
                      ...register("first_name", {
                        required: "First Name is required",
                      }),
                    }}
                  />
                  {errors.first_name && (
                    <p className="error">{errors.first_name.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="from-group mb-4 col-sm-6 col-12">
                  <Input
                    idN="lastname"
                    label="Last Name"
                    type="text"
                    required={true}
                    classN="form-control"
                    placeholder="Enter last name"
                    ragister={{
                      ...register("last_name", {
                        required: "Last Name is required",
                      }),
                    }}
                  />
                  {errors.last_name && (
                    <p className="error">{errors.last_name.message}</p>
                  )}
                </div>

                {/* Company Name */}
                <div className="from-group mb-4 col-sm-6 col-12">
                  <Input
                    idN="companyName"
                    label="Company Name"
                    type="text"
                    required={true}
                    classN="form-control"
                    placeholder="Enter company name"
                    ragister={{
                      ...register("company_name", {
                        required: "Company Name is required",
                      }),
                    }}
                  />
                  {errors.company_name && (
                    <p className="error">{errors.company_name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="from-group mb-4 col-sm-6 col-12">
                  <Input
                    idN="email"
                    label="Email Address"
                    type="email"
                    required={true}
                    classN="form-control"
                    placeholder="Enter email address"
                    ragister={{
                      ...register("email_address", {
                        required: "Email is required",
                        pattern: {
                          value:
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/,
                          message: "Invalid email address",
                        },
                      }),
                    }}
                  />
                  {errors.email_address && (
                    <p className="error">{errors.email_address.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="from-group mb-4 col-sm-6 col-12">
                  <label htmlFor="phone" className="form-label mb-2">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <Controller
                    id="phone"
                    name="phone_number"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Phone number is required",
                      validate: (value) => {
                        if (!value || value.trim().length <= 4) {
                          return "Phone number is required";
                        }
                        try {
                          const pn = parsePhoneNumberFromString("+" + value);
                          if (!pn || !pn.isValid()) {
                            return "Invalid phone number";
                          }
                          return true;
                        } catch {
                          return "Invalid phone number";
                        }
                      },
                    }}
                    render={({ field }) => (
                      <PhoneInput
                        country="us"
                        value={field.value}
                        enableSearch
                        onChange={field.onChange}
                        inputProps={{
                          name: field.name,
                          required: true,
                          ref: field.ref,
                        }}
                        placeholder="Enter phone number"
                        containerStyle={{ position: "relative" }}
                        inputStyle={{
                          width: "100%",
                          paddingLeft: "55px",
                          height: "40px",
                          fontSize: "16px",
                          borderRadius: "8px",
                        }}
                        buttonStyle={{
                          border: "none",
                          background: "transparent",
                        }}
                      />
                    )}
                  />
                  {errors.phone_number && (
                    <p className="error">{errors.phone_number.message}</p>
                  )}
                </div>

                {/* Country */}
                <div className="from-group mb-4 col-sm-6 col-12">
                  <label htmlFor="country" className="from-label mb-2">
                    Country <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="country"
                    name="country"
                    aria-label="Select country"
                    defaultValue=""
                    autoComplete="country"
                    {...register("country", {
                      required: "Country is required",
                    })}
                  >
                    <option value="" disabled>
                      Select a country
                    </option>
                    {countries?.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>

                  {errors.country && (
                    <div className="error">
                      {errors.country.message}
                    </div>
                  )}
                </div>

                {/* State */}
                <div className="from-group mb-4 col-sm-6 col-12">
                  <Input
                    idN="state"
                    label="State/Province"
                    type="text"
                    required={true}
                    classN="form-control"
                    placeholder="State name"
                    ragister={{
                      ...register("state", { required: "State is required" }),
                    }}
                  />
                  {errors.state && (
                    <p className="error">{errors.state.message}</p>
                  )}
                </div>

                <div className="d-flex gap-5 mt-3 flex-sm-row flex-column">
                  {/* Document Request */}
                  <div className="mb-3">
                    <label id="documentRequestLabel" className="form-label fs-2 fw-medium">
                      Document Request <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex flex-column row-gap-3 column-gap-5 fs-4" role="group" aria-labelledby="documentRequestLabel">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="AnnualReport"
                          name="document_request.AnnualReport"
                          {...register("document_request.AnnualReport")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="AnnualReport"
                        >
                          Annual Report
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="AnnualProxy"
                          name="document_request.AnnualProxy"
                          {...register("document_request.AnnualProxy")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="AnnualProxy"
                        >
                          Annual Proxy
                        </label>
                      </div>
                    </div>
                    {errorMsg && (
                      <p className="error">{errorMsg}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label id="investorGroupLabel" className="form-label fs-3 fw-medium">
                      Are you an investor?{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex flex-column row-gap-3 column-gap-5 fs-4" role="radiogroup" aria-labelledby="investorGroupLabel">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          value={true}
                          id="investor"
                          name="isInvestor"
                          {...register("isInvestor", {
                            required: "Please select an option",
                          })}
                        />
                        <label className="form-check-label" htmlFor="investor">
                          I am an investor
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          value={false}
                          id="notInvestor"
                          name="isInvestor"
                          {...register("isInvestor", {
                            required: "Please select an option",
                          })}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="notInvestor"
                        >
                          I am not an investor
                        </label>
                      </div>
                    </div>
                    {errors.isInvestor && (
                      <p className="error">{errors.isInvestor.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="fs-2 fw-medium position-relative mb-5 signup_btn mt-5 d-table"
                disabled={loading}
              >
                Submit
                {loading && (
                  <div
                    className="spinner-border text-success ms-2"
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
  );
}

export default RequestModl;
