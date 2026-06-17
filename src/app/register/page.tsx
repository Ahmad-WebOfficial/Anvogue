"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import PhoneInput, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast from "react-hot-toast";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import api from "@/lib/api";

type SignUpData = {
  clientRole: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  isoCode: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

type RegisterPayload = {
  ClientRole: number;
  UserName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneCode: string;
  ISOCode: string;
  PhoneNumber: string;
  Password: string;
  ConfirmPassword: string;
};

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Register = () => {
  const router = useRouter();
  const [signUpData, setSignUpData] = useState<SignUpData>({
    clientRole: 4,
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "92",
    isoCode: "PK",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (signUpData.password !== signUpData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of User.");
      return;
    }

    if (signUpData.userName.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!signUpData.firstName.trim() || !signUpData.lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!validateEmail(signUpData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const submittedPhone = signUpData.phoneNumber.trim();
    const normalizedPhone = submittedPhone.replace(/[^\d+]/g, "");

    if (!normalizedPhone || normalizedPhone.replace(/^\+/, "").length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (signUpData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const payload: RegisterPayload = {
      ClientRole: signUpData.clientRole,
      UserName: signUpData.userName,
      FirstName: signUpData.firstName,
      LastName: signUpData.lastName,
      Email: signUpData.email,
      PhoneCode: signUpData.phoneCode,
      ISOCode: signUpData.isoCode,
      PhoneNumber: normalizedPhone.startsWith("+")
        ? normalizedPhone.slice(1)
        : normalizedPhone,
      Password: signUpData.password,
      ConfirmPassword: signUpData.confirmPassword,
    };
    console.log("SENDING THIS PAYLOAD:", JSON.stringify(payload, null, 2));
    setLoading(true);
    try {
      const response = await api.post("/api/v1/Account/Register", payload);
      console.log(response);
      Cookies.set(
        "userRegData",
        JSON.stringify({
          username: payload.UserName,
          phoneNumber: payload.PhoneNumber,
          phoneCode: parseInt(payload.PhoneCode),
        }),
        { expires: 1, secure: true, sameSite: "Strict" },
      );
      await api.post("/api/v1/Account/SendOTP", {
        PhoneNumber: payload.PhoneNumber,
        PhoneCode: parseInt(payload.PhoneCode),
      });
      toast.success("Registration successful! OTP sent on Email.");
      if (typeof window !== "undefined") {
        Cookies.set("registerEmail", payload.Email, { expires: 1 });
      }

      setTimeout(() => {
        router.push(
          `/register/verify-otp?email=${encodeURIComponent(payload.Email)}`,
        );
      }, 1000);
    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        errorMessage =
          (typeof data === "string" && data) || data?.message || errorMessage;
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb
          heading="Create An Account"
          subHeading="Create An Account"
        />
      </div>
      <div className="register-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Register</div>
              <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 text-green-600 text-sm">
                    {success}
                  </div>
                )}

                <div className="username mb-5">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="userName"
                    type="text"
                    placeholder="Username *"
                    required
                    value={signUpData.userName}
                    onChange={(e) => {
                      setSignUpData((prev) => ({
                        ...prev,
                        userName: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="firstName"
                    type="text"
                    placeholder="First Name *"
                    required
                    value={signUpData.firstName}
                    onChange={(e) => {
                      setSignUpData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }));
                    }}
                  />
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="lastName"
                    type="text"
                    placeholder="Last Name *"
                    required
                    value={signUpData.lastName}
                    onChange={(e) => {
                      setSignUpData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div className="email mt-5">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="email"
                    type="email"
                    placeholder="Email address *"
                    required
                    value={signUpData.email}
                    onChange={(e) => {
                      setSignUpData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div className="phone mt-5">
                  <label className="text-secondary2 text-sm mb-2 block">
                    Phone Number *
                  </label>
                  <PhoneInput
                    country={signUpData.isoCode.toLowerCase()}
                    value={signUpData.phoneNumber}
                    onChange={(value, country) => {
                      if (!("dialCode" in country)) return;
                      const data = country as CountryData;
                      setSignUpData((prev) => ({
                        ...prev,
                        phoneCode: data.dialCode,
                        isoCode: data.countryCode.toUpperCase(),
                        phoneNumber: value || "",
                      }));
                    }}
                    inputProps={{
                      name: "phoneNumber",
                      required: true,
                    }}
                    containerClass="w-full"
                    inputClass="!w-full !border !border-line !px-13 !pt-3 !pb-3 !rounded-lg !h-[48px] !text-base"
                    buttonClass="!border !border-line !rounded-l-lg !bg-white"
                    dropdownClass="!rounded-lg !shadow-lg"
                    enableSearch
                    disableSearchIcon
                    searchPlaceholder="Search country"
                  />
                </div>

                <div className="pass mt-5">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="password"
                    type="password"
                    placeholder="Password *"
                    required
                    value={signUpData.password}
                    onChange={(e) => {
                      setSignUpData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div className="confirm-pass mt-5">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm Password *"
                    required
                    value={signUpData.confirmPassword}
                    onChange={(e) => {
                      setSignUpData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div className="flex items-center mt-5">
                  <div className="block-input">
                    <input
                      type="checkbox"
                      name="remember"
                      id="remember"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <Icon.CheckSquare
                      size={20}
                      weight="fill"
                      className="icon-checkbox"
                    />
                  </div>
                  <label
                    htmlFor="remember"
                    className="pl-2 cursor-pointer text-secondary2"
                  >
                    I agree to the
                    <Link
                      href={"#!"}
                      className="text-black hover:underline pl-1"
                    >
                      Terms of User
                    </Link>
                  </label>
                </div>

                <div className="block-button md:mt-7 mt-4">
                  <button
                    title="Register your Account"
                    type="submit"
                    className="button-main bg-black text-white cursor-pointer hover:text-black transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register"}
                  </button>
                </div>
              </form>
            </div>

            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content">
                <div className="heading4">Already have an account?</div>
                <div className="mt-2 text-secondary">
                  Welcome back. Sign in to access your personalized experience.
                </div>
                <div className="block-button cursor-pointer md:mt-7 mt-4">
                  <Link href={"/login"} className="button-main">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
