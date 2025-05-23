import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Input from "./Input";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
const API_BASE_URI = process.env.NEXT_PUBLIC_API_BASE_URI;

function LeadPopUp({ hide, setHide }) {
  const [passwordShow, setPasswordShow] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
  });

  const handleRegister = async (data) => {
    try {
      const response = await axios.put(
        `${API_BASE_URI}/lead-tenant/create-lead-user/${window.location.hostname}`,
        data
      );

      console.log(data)

      if (response.data.success === true) {
        toast.success(
          response.data.message ||
            "Account created successfully! 🎉 Your account is Pending. Please wait for admin approval."
        );
        setTimeout(() => setHide(false), 5000);
      }
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <div
      id="requestInformation2"
      className={`modal fade ${hide ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden={!hide}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0 d-block position-relative">
            <h1
              className="modal-title text-center fw-bold mb-3 mt-3 pt-3"
              id="exampleModalLabel"
            >
              Complete the Registration Process and Explore the Available
              Features
            </h1>
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 mt-3 me-3"
              aria-label="Close"
              onClick={() => setHide(false)}
            ></button>
          </div>

          <div className="model-body2 px-5">
            <form className="px-3" onSubmit={handleSubmit(handleRegister)}>
              <div className="col gx-sm-5 gx-3">
                {/* Email Address */}
                <div className="from-group mb-4 col-12">
                  <Input
                    idN="email"
                    label="Email Address"
                    type="email"
                    classN="form-control"
                    placeholder="Enter email address"
                    autocomplete="email"
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                    ragister={{
                      ...register("email", {
                        required: "Email is required",
                        pattern: {
                          value:
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Enter a valid email format",
                        },
                        validate: {
                          notNumericOnlyPrefix: (value) => {
                            const [username] = value.split("@");
                            return (
                              !/^\d+$/.test(username) ||
                              "Email username cannot be only numbers"
                            );
                          },
                          notGibberish: (value) => {
                            const [username] = value.split("@");
                            return (
                              username.length > 1 ||
                              "Email prefix is too short or unrealistic"
                            );
                          },
                        },
                      }),
                    }}
                  />
                  {errors.email && (
                    <p className="error" id="emailError" aria-live="polite">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="from-group mb-xxl-4 mb-3">
                  <label htmlFor="phone" className="form-label mb-2">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <Controller
                    name="phone"
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
                  {errors.phone && (
                    <p className="error">{errors.phone.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="from-group mb-4 col-12">
                  <div className="password_input">
                    <Input
                      idN="password"
                      label="Password"
                      type={passwordShow ? "text" : "password"}
                      classN="form-control"
                      placeholder="Enter password"
                      onKeyDown={(e) => {
                        if (e.key === " ") {
                          e.preventDefault();
                        }
                      }}
                      ragister={{
                        ...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Minimum 8 characters required",
                          },
                          pattern: {
                            value:
                              /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[?,*!@#$%^&+=]).{8,}$/,
                            message:
                              "Must include uppercase, lowercase, number, and special character",
                          },
                        }),
                      }}
                    />

                    {passwordShow ? (
                      <BsEye
                        size={20}
                        color="#8B8B8B"
                        className="password_icon text-white"
                        onClick={() => setPasswordShow(false)}
                      />
                    ) : (
                      <BsEyeSlash
                        size={20}
                        color="#8B8B8B"
                        className="password_icon text-white"
                        onClick={() => setPasswordShow(true)}
                      />
                    )}
                  </div>

                  {errors.password && (
                    <p className="error">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}

              <button
                type="submit"
                className="common_btn_active d-block w-50 mb-3 mt-4 icon-clickable mx-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadPopUp;
