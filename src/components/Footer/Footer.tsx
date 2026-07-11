"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { toast } from "react-hot-toast";
import LandingFooterImage from "@/components/Home1/LandingFooterImage";
import TenantLogo from "@/components/Common/TenantLogo";
import { subscribeNewsletter } from "@/lib/tenant-landing";
import { getApiErrorMessage } from "@/lib/api";
import { usePathname } from "next/navigation"; // Import yahan rakhein
const Footer = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const message = await subscribeNewsletter(trimmedEmail);
      setEmail("");
      toast.success(message);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to subscribe. Please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div id="footer" className="footer">
        <div className="footer-main bg-surface">
          <div className="container">
            <LandingFooterImage />
            <div className="content-footer py-[60px] flex justify-between flex-wrap gap-y-8">
              <div className="company-infor basis-1/4 max-lg:basis-full pr-7">
                <TenantLogo className="logo" />
                <div className="flex gap-3 mt-3">
                  <div className="flex flex-col ">
                    <span className="text-button">Mail:</span>
                    <span className="text-button mt-3">Phone:</span>
                    <span className="text-button mt-3">Address:</span>
                  </div>
                  <div className="flex flex-col ">
                    <span className="">hi.avitex@gmail.com</span>
                    <span className="mt-3">1-333-345-6868</span>
                    <span className="mt-3 pt-px">
                      549 Oak St.Crystal Lake, IL 60014
                    </span>
                  </div>
                </div>
              </div>
              <div className="right-content flex flex-wrap gap-y-8 basis-3/4 max-lg:basis-full">
                <div className="list-nav flex justify-between basis-2/3 max-md:basis-full gap-4">
                  <div className="item flex flex-col basis-1/3">
                    <div className="text-button-uppercase pb-3">Support</div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href="/pages/about"
                        className="caption1 has-line-before duration-300 w-fit"
                      >
                        About Us
                      </Link>
                      <Link
                        href="/pages/contact"
                        className="caption1 has-line-before duration-300 w-fit"
                      >
                        Contact Us
                      </Link>
                      <Link
                        href="/my-account"
                        className="caption1 has-line-before duration-300 w-fit"
                      >
                        My Account
                      </Link>
                      <Link
                        href="blog/list"
                        className="caption1 has-line-before duration-300 w-fit"
                      >
                        Blog
                      </Link>
                    </div>
                  </div>
                  <div className="item flex flex-col basis-1/3 gap-2 ">
                    <div className="text-button-uppercase pb-3 gap-3">
                      Quick Shop
                    </div>

                    <Link
                      href="/cart"
                      className="caption1 has-line-before duration-300 w-fit"
                    >
                      Cart
                    </Link>

                    <Link
                      href="/checkout"
                      className="caption1 has-line-before duration-300 w-fit"
                    >
                      Checkout
                    </Link>

                    <Link
                      href="/wishlist"
                      className="caption1 has-line-before duration-300 w-fit"
                    >
                      Wishlist
                    </Link>

                    <Link
                      href="/pages/store-list"
                      className="caption1 has-line-before duration-300 w-fit"
                    >
                      Store List
                    </Link>
                  </div>

                  <div className="item flex flex-col basis-1/3 gap-2">
                    <div className="text-button-uppercase pb-3">Legal</div>
                    <ul className="flex flex-col gap-2">
                      <li>
                        <Link
                          href="/pages/faqs"
                          className="caption1 has-line-before duration-300 w-fit"
                        >
                          FAQs
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/pages/terms-and-conditions"
                          className="caption1 has-line-before duration-300 w-fit"
                        >
                          Terms & Conditions
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/pages/privacy-policy"
                          className="caption1 has-line-before duration-300 w-fit"
                        >
                          Privacy Policy
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="newsletter basis-1/3 pl-7 max-md:basis-full max-md:pl-0">
                  <div className="text-button-uppercase">Newletter</div>
                  <div className="caption1 mt-3">
                    Sign up for our newsletter and get 10% off your first
                    purchase
                  </div>
                  <div className="input-block w-full h-[52px] mt-4">
                    <form
                      className="w-full h-full relative"
                      onSubmit={handleSubscribe}
                    >
                      <input
                        type="email"
                        placeholder="Enter your e-mail"
                        className="caption1 w-full h-full pl-4 pr-14 rounded-xl border border-line"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={submitting}
                        required
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-[44px] h-[44px] bg-black flex items-center justify-center rounded-xl absolute top-1 right-1 disabled:opacity-60"
                      >
                        <Icon.ArrowRight size={24} color="#fff" />
                      </button>
                    </form>
                  </div>
                  {successMessage && (
                    <p className="caption1 text-blue mt-3">{successMessage}</p>
                  )}{" "}
                  <div className="list-social flex items-center gap-6 mt-4">
                    <Link href={"https://www.facebook.com/"} target="_blank">
                      <div className="icon-facebook text-2xl text-black"></div>
                    </Link>
                    <Link href={"https://www.instagram.com/"} target="_blank">
                      <div className="icon-instagram text-2xl text-black"></div>
                    </Link>
                    <Link href={"https://www.twitter.com/"} target="_blank">
                      <div className="icon-twitter text-2xl text-black"></div>
                    </Link>
                    <Link href={"https://www.youtube.com/"} target="_blank">
                      <div className="icon-youtube text-2xl text-black"></div>
                    </Link>
                    <Link href={"https://www.pinterest.com/"} target="_blank">
                      <div className="icon-pinterest text-2xl text-black"></div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-bottom py-6 flex items-center justify-center border-t border-line">
              <div className="copyright caption1 text-secondary">
                © {new Date().getFullYear()} Anvogue.All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
