"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { motion } from "framer-motion";
import { logout } from "@/lib/auth";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import api, { getApiErrorMessage } from "@/lib/api";
import {
  CustomerReview,
  fetchCustomerReviews,
  formatReviewDate,
} from "@/lib/reviews";
import { getProductDetailUrl } from "@/lib/featured-products";
import Rate from "@/components/Other/Rate";
const MyAccount = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | undefined>("dashboard");
  const [activeAddress, setActiveAddress] = useState<string | null>("billing");
  const [activeOrders, setActiveOrders] = useState<string | undefined>("all");
  const [openDetail, setOpenDetail] = useState<boolean | undefined>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const reviewsPageSize = 10;

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingForgot, setLoadingForgot] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    FullName: "Tony Nguyen",
    PhoneNumber: "345 678 910",
    PhoneCode: "+12",
    Email: "hi.avitex@gmail.com",
    DOB: "2000-01-01",
    Country: "Pakistan",
    Gender: 0,
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "Gender" ? parseInt(value) : value,
    }));
  };
  const handleDeleteAccount = async () => {
    setLoadingProfile(true);
    try {
      const res = await api.delete("/api/v1/Customer/account/delete");

      if (res.status === 200) {
        toast.success(res.data?.Message || "Account deleted successfully!");

        Cookies.remove("api-security-key");
        router.push("/register");
      }
    } catch (error: any) {
      console.error("Delete Error:", error);
      toast.error(error.response?.data?.Message || "Failed to delete account.");
    } finally {
      setLoadingProfile(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    try {
      const payload = {
        FullName: formData.FullName,
        PhoneNumber: formData.PhoneNumber,
        PhoneCode: formData.PhoneCode,
        Email: formData.Email,
        DOB: formData.DOB,
        Country: formData.Country,
        Gender: formData.Gender,
      };

      const res = await api.put("/api/v1/Customer/UpdateProfile", payload, {});

      if (res.status === 200) {
        toast.success("Profile Updated!");

        await getProfile();

        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Profile update failed");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForgot(true);
    try {
      await api.post("/api/v2/Account/SendForgotPasswordEmail", {
        Username: phone,
      });
      setStep(2);
      toast.success("OTP sent successfully!");
    } catch (error) {
      toast.error("Failed to send code.");
    } finally {
      setLoadingForgot(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReset(true);
    try {
      await api.post("/api/v2/Account/ResetPassword", {
        Username: phone,
        Password: newPassword,
        Code: otp,
      });
      toast.success("Password reset successful!");
      router.push("/login");
    } catch (error) {
      toast.error("Reset failed. Please check your OTP or Password.");
    } finally {
      setLoadingReset(false);
    }
  };

  const getProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await api.get("/api/v1/Customer/GetProfile");
      if (res.data?.Data) {
        const p = res.data.Data;

        setUserProfile(p);

        setFormData({
          FullName: p.FullName || "",
          PhoneNumber: p.PhoneNumber || "",
          PhoneCode: p.PhoneCode || "",
          Email: p.Email || "",
          DOB: p.DOB ? p.DOB.split("T")[0] : "",
          Country: p.Country || "",
          Gender: p.Gender ?? 0,
          password: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setLoadingProfile(false);
    }
  };
  useEffect(() => {
    getProfile();
  }, []);

  const getOrders = async () => {
    try {
      const res = await api.get("/api/v1/Customer/orders", {
        params: {
          PageSize: 10,
          PageNumber: 1,
        },
      });
      console.log("API Response:", res.data);
      if (res.data?.Data?.CustomerOrders) {
        setOrders(res.data.Data.CustomerOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Orders fetch karne mein error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const getCustomerReviews = async (pageNumber = 1) => {
    setReviewsLoading(true);
    try {
      const result = await fetchCustomerReviews(pageNumber, reviewsPageSize);
      setCustomerReviews(result.reviews);
      setReviewsTotal(result.totalRecords);
      setReviewsPage(pageNumber);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load your reviews."));
      setCustomerReviews([]);
      setReviewsTotal(0);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews") {
      void getCustomerReviews(1);
    }
  }, [activeTab]);

  useEffect(() => {
    getProfile();
  }, []);
  const handleActiveAddress = (order: string) => {
    setActiveAddress((prevOrder) => (prevOrder === order ? null : order));
  };

  const handleActiveOrders = (order: string) => {
    setActiveOrders(order);
  };
  const totalOrders = orders.length;
  const cancelledOrders = orders.filter(
    (o) => o.OrderStatus === "Canceled",
  ).length;
  const awaitingOrders = orders.filter(
    (o) => o.OrderStatus === "Pending",
  ).length;
  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="My Account" subHeading="My Account" />
      </div>
      <div className="profile-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col w-full">
            <div className="left md:w-1/3 w-full xl:pr-[3.125rem] lg:pr-[28px] md:pr-[16px]">
              <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
                <div className="heading flex flex-col items-center justify-center">
                  <div className="avatar">
                    <div className="md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full bg-gray-300 flex items-center justify-center border border-line">
                      <Icon.UserCircle
                        size={80}
                        className="text-gray-400"
                        weight="light"
                      />
                    </div>
                  </div>
                  <div className="name heading6 mt-4 text-center">
                    {userProfile?.FullName || "Guest User"}
                  </div>
                  <div className="mail heading6 font-normal normal-case text-secondary text-center mt-1">
                    {userProfile?.Email || "No email found"}
                  </div>
                </div>
                <div className="menu-tab w-full max-w-none lg:mt-10 mt-6">
                  <Link
                    href={"#!"}
                    scroll={false}
                    className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white ${activeTab === "dashboard" ? "active" : ""}`}
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <Icon.HouseLine size={20} />
                    <strong className="heading6">Dashboard</strong>
                  </Link>
                  <Link
                    href={"#!"}
                    scroll={false}
                    className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === "orders" ? "active" : ""}`}
                    onClick={() => setActiveTab("orders")}
                  >
                    <Icon.Package size={20} />
                    <strong className="heading6">History Orders</strong>
                  </Link>
                  <Link
                    href={"#!"}
                    scroll={false}
                    className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === "reviews" ? "active" : ""}`}
                    onClick={() => setActiveTab("reviews")}
                  >
                    <Icon.Star size={20} />
                    <strong className="heading6">Reviews</strong>
                  </Link>

                  <Link
                    href={"#!"}
                    scroll={false}
                    className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === "setting" ? "active" : ""}`}
                    onClick={() => setActiveTab("setting")}
                  >
                    <Icon.GearSix size={20} />
                    <strong className="heading6">Setting</strong>
                  </Link>
                  <button
                    type="button"
                    className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Icon.Trash size={20} className="text-red" />
                    <strong className="heading6 text-red">
                      Delete Account
                    </strong>
                  </button>
                </div>
              </div>
            </div>
            <div className="right md:w-2/3 w-full pl-2.5">
              <div
                className={`tab text-content w-full ${activeTab === "dashboard" ? "block" : "hidden"}`}
              >
                <div className="overview grid sm:grid-cols-3 gap-5">
                  <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                    <div className="counter">
                      <span className="text-secondary">Awaiting Pickup</span>
                      <h5 className="heading5 mt-1">
                        {
                          orders.filter((o) => o.OrderStatus === "Pending")
                            .length
                        }
                      </h5>
                    </div>
                    <Icon.HourglassMedium className="text-4xl" />
                  </div>

                  <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                    <div className="counter">
                      <span className="text-secondary">Cancelled Orders</span>
                      <h5 className="heading5 mt-1">
                        {
                          orders.filter((o) => o.OrderStatus === "Canceled")
                            .length
                        }
                      </h5>
                    </div>
                    <Icon.ReceiptX className="text-4xl" />
                  </div>

                  <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                    <div className="counter">
                      <span className="text-secondary">
                        Total Number of Orders
                      </span>
                      <h5 className="heading5 mt-1">{orders.length}</h5>
                    </div>
                    <Icon.Package className="text-4xl" />
                  </div>
                </div>

                <div className="list overflow-x-auto w-full mt-5">
                  <table className="w-full">
                    <thead className="border-b border-line">
                      <tr>
                        <th className="pb-3 text-left text-sm font-bold uppercase text-secondary">
                          Order
                        </th>
                        <th className="pb-3 text-left text-sm font-bold uppercase text-secondary">
                          Details
                        </th>
                        <th className="pb-3 text-left text-sm font-bold uppercase text-secondary">
                          Pricing
                        </th>
                        <th className="pb-3 text-right text-sm font-bold uppercase text-secondary">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <tr
                            key={order.OrderId}
                            className="item duration-300 border-b border-line"
                          >
                            <th scope="row" className="py-3 text-left">
                              <strong className="text-title">
                                {order.OrderNumber}
                              </strong>
                            </th>
                            <td className="py-3">
                              <div className="info flex flex-col">
                                <strong className="product_name text-button">
                                  Order ID: {order.OrderId}
                                </strong>
                                <span className="product_tag caption1 text-secondary">
                                  {order.PaymentMethod}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 price">
                              ${order.Total?.toFixed(2) || "0.00"}
                            </td>
                            <td className="py-3 text-right">
                              <span
                                className={`tag px-4 py-1.5 rounded-full bg-opacity-10 caption1 font-semibold 
                  ${
                    order.OrderStatus === "Pending"
                      ? "bg-yellow text-yellow"
                      : order.OrderStatus === "Completed"
                        ? "bg-success text-success"
                        : "bg-purple text-purple"
                  }`}
                              >
                                {order.OrderStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-10 text-center text-secondary"
                          >
                            No orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className={`tab text-content overflow-hidden w-full p-7 border border-line rounded-xl ${activeTab === "orders" ? "block" : "hidden"}`}
              >
                <h6 className="heading6">Your Orders</h6>

                <div className="w-full overflow-x-auto">
                  <div className="menu-tab grid grid-cols-5 max-lg:w-[500px] border-b border-line mt-3">
                    {[
                      "all",
                      "pending",
                      "delivery",
                      "completed",
                      "canceled",
                    ].map((item) => (
                      <button
                        key={item}
                        className={`item relative px-3 py-2.5 text-secondary text-center duration-300 hover:text-black border-b-2 capitalize ${activeOrders === item ? "active border-black text-black" : "border-transparent"}`}
                        onClick={() => handleActiveOrders(item)}
                      >
                        <span className="relative text-button z-[1]">
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="list_order">
                  {orders
                    .filter((order) => {
                      if (activeOrders === "all") return true;
                      return (
                        order.OrderStatus.toLowerCase() ===
                        activeOrders.toLowerCase()
                      );
                    })
                    .map((order) => (
                      <div
                        key={order.OrderId}
                        className="order_item mt-5 border border-line rounded-lg box-shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
                          <div className="flex items-center gap-2">
                            <strong className="text-title">
                              Order Number:
                            </strong>
                            <strong className="order_number text-button uppercase">
                              {order.OrderNumber}
                            </strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <strong className="text-title">Status:</strong>
                            <span
                              className={`tag px-4 py-1.5 rounded-full bg-opacity-10 caption1 font-semibold
                ${
                  order.OrderStatus === "Pending"
                    ? "bg-yellow text-yellow"
                    : order.OrderStatus === "Completed"
                      ? "bg-success text-success"
                      : "bg-purple text-purple"
                }`}
                            >
                              {order.OrderStatus}
                            </span>
                          </div>
                        </div>

                        <div className="list_prd px-5">
                          <div className="py-5 text-secondary">
                            Total: ${order.Total.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 p-5">
                          <button
                            className="button-main"
                            onClick={() => setOpenDetail(true)}
                          >
                            Order Details
                          </button>
                          <button className="button-main bg-surface border border-line text-black">
                            Cancel Order
                          </button>
                        </div>
                      </div>
                    ))}

                  {orders.length === 0 && (
                    <div className="py-10 text-center text-secondary">
                      No orders history found.
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`tab text-content overflow-hidden w-full p-7 border border-line rounded-xl ${activeTab === "reviews" ? "block" : "hidden"}`}
              >
                <h6 className="heading6">Your Reviews</h6>
                <p className="caption1 text-secondary mt-2">
                  All product reviews you have submitted.
                </p>

                {reviewsLoading ? (
                  <p className="text-secondary text-center py-10">
                    Loading reviews...
                  </p>
                ) : customerReviews.length === 0 ? (
                  <p className="text-secondary text-center py-10">
                    No reviews found.
                  </p>
                ) : (
                  <div className="list_reviews mt-6 flex flex-col gap-5">
                    {customerReviews.map((review, index) => (
                      <div
                        key={`${review.ProductId}-${review.ReviewPostedDate}-${index}`}
                        className="review_item border border-line rounded-xl p-5 box-shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row gap-5">
                          <Link
                            href={getProductDetailUrl(review.ProductId)}
                            className="flex-shrink-0 w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-surface"
                          >
                            <Image
                              src={
                                review.ImagePath ||
                                "/images/product/1000x1000.png"
                              }
                              width={112}
                              height={112}
                              alt={review.ProductName}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <Link
                                  href={getProductDetailUrl(review.ProductId)}
                                  className="text-button font-semibold hover:underline"
                                >
                                  {review.ProductName}
                                </Link>
                                {review.Category?.CategoryName && (
                                  <p className="caption1 text-secondary mt-1">
                                    {review.Category.CategoryName}
                                  </p>
                                )}
                              </div>
                              <span className="caption1 text-secondary whitespace-nowrap">
                                {formatReviewDate(review.ReviewPostedDate)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                              <Rate
                                currentRate={Number(review.Rating) || 0}
                                size={14}
                              />
                              <span className="caption1 text-secondary">
                                {review.Rating} / 5
                              </span>
                            </div>

                            <p className="body1 text-secondary mt-3 whitespace-pre-line">
                              {review.Review}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!reviewsLoading && reviewsTotal > reviewsPageSize && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      type="button"
                      className="button-main bg-white text-black border border-line disabled:opacity-50"
                      disabled={reviewsPage <= 1}
                      onClick={() => void getCustomerReviews(reviewsPage - 1)}
                    >
                      Previous
                    </button>
                    <span className="caption1 text-secondary">
                      Page {reviewsPage} of{" "}
                      {Math.ceil(reviewsTotal / reviewsPageSize)}
                    </span>
                    <button
                      type="button"
                      className="button-main bg-white text-black border border-line disabled:opacity-50"
                      disabled={
                        reviewsPage >= Math.ceil(reviewsTotal / reviewsPageSize)
                      }
                      onClick={() => void getCustomerReviews(reviewsPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <div
                className={`tab text-content w-full p-7 border border-line rounded-xl ${activeTab === "setting" ? "block" : "hidden"}`}
              >
                <div className="flex justify-between items-center pb-4">
                  <div className="heading5">Information</div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 gap-y-5 mt-5">
                  <div className="first-name">
                    <label className="caption1 capitalize">
                      Full Name <span className="text-red">*</span>
                    </label>
                    <input
                      disabled={!isEditing}
                      name="FullName"
                      value={formData.FullName}
                      onChange={handleInputChange}
                      className="border-line mt-2 px-4 py-3 w-full rounded-lg border"
                      type="text"
                    />
                  </div>
                  <div className="phone-number">
                    <label className="caption1 capitalize">
                      Phone Number <span className="text-red">*</span>
                    </label>
                    <input
                      disabled={!isEditing}
                      name="PhoneNumber"
                      value={formData.PhoneNumber}
                      onChange={handleInputChange}
                      className="border-line mt-2 px-4 py-3 w-full rounded-lg border"
                      type="text"
                    />
                  </div>
                  <div className="email">
                    <label className="caption1 capitalize">
                      Email Address <span className="text-red">*</span>
                    </label>
                    <input
                      disabled={!isEditing}
                      name="Email"
                      value={formData.Email}
                      onChange={handleInputChange}
                      className="border-line mt-2 px-4 py-3 w-full rounded-lg border"
                      type="email"
                    />
                  </div>
                  <div className="gender">
                    <label className="caption1 capitalize">
                      Gender <span className="text-red">*</span>
                    </label>
                    <select
                      disabled={!isEditing}
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleInputChange}
                      className="border border-line px-4 py-3 w-full rounded-lg mt-2"
                    >
                      <option value={0}>Male</option>
                      <option value={1}>Female</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    title="Profile Status"
                    type="button"
                    onClick={() =>
                      isEditing ? handleUpdateProfile() : setIsEditing(true)
                    }
                    className="button-main bg-black text-white cursor-pointer hover:text-black transition-all duration-300"
                    disabled={loadingProfile}
                  >
                    {loadingProfile
                      ? "Updating..."
                      : isEditing
                        ? "Save Profile"
                        : "Edit Profile"}
                  </button>

                  {isEditing && (
                    <button
                      title="Cancle"
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="button-main border bg-green border-black text-black"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="forgot-pass md:py-20 py-10">
                  <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-row">
                      <div className="left  w-full  ">
                        <div className="heading4">
                          {step === 1
                            ? "Reset your password"
                            : "Verify & Reset"}
                        </div>

                        {step === 1 ? (
                          <form
                            onSubmit={handleSendOTP}
                            className="md:mt-7 mt-4"
                          >
                            <input
                              className="border-line px-4 pt-3 pb-3 w-full rounded-lg border"
                              type="text"
                              placeholder="Enter username *"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required
                            />
                            <div className="block-button md:mt-7 mt-4">
                              <button
                                title="Submit"
                                className="button-main cursor-pointer"
                                disabled={loadingForgot}
                              >
                                {loadingForgot ? "Sending..." : "Submit"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <form
                            onSubmit={handleResetPassword}
                            className="md:mt-7 mt-4"
                          >
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
                                disabled={loadingReset}
                              >
                                {loadingReset ? "Resetting..." : "Reset"}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <div
        className={`modal-order-detail-block flex items-center justify-center`}
        onClick={() => setOpenDetail(false)}
      >
        <div
          className={`modal-order-detail-main grid grid-cols-2 w-[1160px] bg-white rounded-2xl ${openDetail ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="info p-10 border-r border-line">
            <h5 className="heading5">Order Details</h5>
            <div className="list_info grid grid-cols-2 gap-10 gap-y-8 mt-5">
              <div className="info_item">
                <strong className="text-button-uppercase text-secondary">
                  Contact Information
                </strong>
                <h6 className="heading6 order_name mt-2">Tony nguyen</h6>
                <h6 className="heading6 order_phone mt-2">
                  (+12) 345 - 678910
                </h6>
                <h6 className="heading6 normal-case order_email mt-2">
                  hi.avitex@gmail.com
                </h6>
              </div>
              <div className="info_item">
                <strong className="text-button-uppercase text-secondary">
                  Payment method
                </strong>
                <h6 className="heading6 order_payment mt-2">cash delivery</h6>
              </div>
              <div className="info_item">
                <strong className="text-button-uppercase text-secondary">
                  Shipping address
                </strong>
                <h6 className="heading6 order_shipping_address mt-2">
                  2163 Phillips Gap Rd, West Jefferson, North Carolina, US
                </h6>
              </div>
              <div className="info_item">
                <strong className="text-button-uppercase text-secondary">
                  Billing address
                </strong>
                <h6 className="heading6 order_billing_address mt-2">
                  2163 Phillips Gap Rd, West Jefferson, North Carolina, US
                </h6>
              </div>
              <div className="info_item">
                <strong className="text-button-uppercase text-secondary">
                  Company
                </strong>
                <h6 className="heading6 order_company mt-2">
                  Avitex Technology
                </h6>
              </div>
            </div>
          </div>
          <div className="list p-10">
            <h5 className="heading5">Items</h5>
            <div className="list_prd">
              <div className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                <Link
                  href={"/product/default"}
                  className="flex items-center gap-5"
                >
                  <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={"/images/product/1000x1000.png"}
                      width={1000}
                      height={1000}
                      alt={"Contrasting sheepskin sweatshirt"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="prd_name text-title">
                      Contrasting sheepskin sweatshirt
                    </div>
                    <div className="caption1 text-secondary mt-2">
                      <span className="prd_size uppercase">XL</span>
                      <span>/</span>
                      <span className="prd_color capitalize">Yellow</span>
                    </div>
                  </div>
                </Link>
                <div className="text-title">
                  <span className="prd_quantity">1</span>
                  <span> X </span>
                  <span className="prd_price">$45.00</span>
                </div>
              </div>
              <div className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                <Link
                  href={"/product/default"}
                  className="flex items-center gap-5"
                >
                  <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={"/images/product/1000x1000.png"}
                      width={1000}
                      height={1000}
                      alt={"Contrasting sheepskin sweatshirt"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="prd_name text-title">
                      Contrasting sheepskin sweatshirt
                    </div>
                    <div className="caption1 text-secondary mt-2">
                      <span className="prd_size uppercase">XL</span>
                      <span>/</span>
                      <span className="prd_color capitalize">White</span>
                    </div>
                  </div>
                </Link>
                <div className="text-title">
                  <span className="prd_quantity">2</span>
                  <span> X </span>
                  <span className="prd_price">$70.00</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-5">
              <strong className="text-title">Shipping</strong>
              <strong className="order_ship text-title">Free</strong>
            </div>
            <div className="flex items-center justify-between mt-4">
              <strong className="text-title">Discounts</strong>
              <strong className="order_discounts text-title">-$80.00</strong>
            </div>
            <div className="flex items-center justify-between mt-5 pt-5 border-t border-line">
              <h5 className="heading5">Subtotal</h5>
              <h5 className="order_total heading5">$105.00</h5>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
            <div className="heading5 text-center">Delete Account</div>
            <p className="mt-4 text-secondary text-center">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>

            <div className="flex gap-4 item-center justify-center mt-8">
              <button
                title="Cancle"
                onClick={() => setShowDeleteModal(false)}
                className="button-main border border-line bg-transparent text-black"
              >
                Cancel
              </button>
              <button
                title="Delete Permanently"
                onClick={handleDeleteAccount}
                className="button-main bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyAccount;
