"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY } from "@/lib/auth-keys";
import api, { getApiErrorMessage } from "@/lib/api";
const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams?.get("verified") === "1") {
      setSuccess("Email verified successfully! ");
      toast.success("Email verified!");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/oauth/token", {
        UserName: username.trim(),
        Password: password.trim(),
      });

      const token =
        response.data.AccessToken || response.data.Data?.AccessToken;

      if (token) {
        Cookies.set(AUTH_TOKEN_KEY, token, { expires: 1, path: "/" }); // "authToken" ki jagah AUTH_TOKEN_KEY
        toast.success("Login successful!");
        window.location.href = "/"; // Refresh zaroori hai
      } else {
        throw new Error("Token nahi mila!");
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const exceptionType = errorData?.ExceptionType;

      setUsername("");
      setPassword("");

      if (exceptionType === "UserNotFoundException") {
        toast.error("User does not exist!");
      } else if (exceptionType === "IncorrectPasswordException") {
        toast.error("Incorrect password!");
      } else {
        toast.error(errorData?.Message || "Login failed.");
      }

      setError(errorData?.Message || "Login failed.");
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
        <Breadcrumb heading="Login" subHeading="Login" />
      </div>
      <div className="login-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Login</div>
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
                <div className="email ">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="username"
                    type="text"
                    placeholder="Username *"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="pass mt-5">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="password"
                    type="password"
                    placeholder="Password *"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end mt-5">
                  <button
                    title="Forgot Your Password?"
                    type="button"
                    onClick={() => {
                      router.push("/forgot-password");
                    }}
                    className="font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Forgot Your Password?
                  </button>
                </div>
                <div className="block-button md:mt-7 mt-4">
                  <button
                    title="Login Your Account"
                    type="submit"
                    className="button-main bg-black text-white cursor-pointer hover:text-black transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>
            </div>
            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content">
                <div className="heading4">New Customer</div>
                <div className="mt-2 text-secondary">
                  Be part of our growing family of new customers! Join us today
                  and unlock a world of exclusive benefits, offers, and
                  personalized experiences.
                </div>
                <div className="block-button md:mt-7 mt-4">
                  <button
                    title="Go to Registration Page"
                    type="button"
                    className="button-main bg-black text-white cursor-pointer hover:text-black transition-all duration-300"
                    onClick={() => router.push("/register")}
                  >
                    Register
                  </button>
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

export default Login;
