"use client";
import React, { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const SECURITY_KEY = process.env.NEXT_PUBLIC_SECURITY_KEY;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(
        "/api/v1/Account/SendOTP",
        { PhoneNumber: phone, PhoneCode: 92 },
        { headers: { "api-security-key": SECURITY_KEY } },
      );
      toast.success("OTP sent successfully!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.Message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setLoading(true);
    try {
      await api.post(
        "/api/v1/Account/ResetPassword",
        { Username: phone, Password: newPassword, Code: otp },
        { headers: { "api-security-key": SECURITY_KEY } },
      );
      toast.success("Password reset successfully!");
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(err.response?.data?.Message || "Invalid OTP or data");
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
          heading="Forget your password"
          subHeading="Forget your password"
        />
      </div>

      <div className="forgot-pass md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">
                {step === 1 ? "Reset your password" : "Verify & Reset"}
              </div>

              {step === 1 ? (
                <form onSubmit={handleSendOTP} className="md:mt-7 mt-4">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg border"
                    type="text"
                    placeholder="Enter Phone Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <div className="block-button md:mt-7 mt-4">
                    <button
                      title="Submit"
                      className="button-main cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Submit"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="md:mt-7 mt-4">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg border mb-4"
                    type="text"
                    placeholder="Enter OTP *"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg border"
                    type="password"
                    placeholder="New Password *"
                    required
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="flex gap-4 md:mt-7 mt-4">
                    <button
                      title="Reset Password"
                      className="button-main cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Reset"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content">
                <div className="heading4">New Customer</div>
                <div className="mt-2 text-secondary">
                  Be part of our growing family of new customers! Join us today.
                </div>
                <div className="block-button md:mt-7 mt-4">
                  <Link href={"/register"} className="button-main" title="Back">
                    Register
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

export default ForgotPassword;
