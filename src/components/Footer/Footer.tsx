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

const Footer = () => {
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
      setSuccessMessage(message);
      setEmail("");
      toast.success(message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to subscribe. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (        <>
            <div id="footer" className='footer'>
                <div className="footer-main bg-surface">
                    <div className="container">
                        <LandingFooterImage />
                        <div className="content-footer py-[60px] flex justify-between flex-wrap gap-y-8">
                            <div className="company-infor basis-1/4 max-lg:basis-full pr-7">
                                <TenantLogo className="logo" />
                                <div className='flex gap-3 mt-3'>
                                    <div className="flex flex-col ">
                                        <span className="text-button">Mail:</span>
                                        <span className="text-button mt-3">Phone:</span>
                                        <span className="text-button mt-3">Address:</span>
                                    </div>
                                    <div className="flex flex-col ">
                                        <span className=''>hi.avitex@gmail.com</span>
                                        <span className='mt-3'>1-333-345-6868</span>
                                        <span className='mt-3 pt-px'>549 Oak St.Crystal Lake, IL 60014</span>
                                    </div>
                                </div>
                            </div>
                            <div className="right-content flex flex-wrap gap-y-8 basis-3/4 max-lg:basis-full">
                                <div className="list-nav flex justify-between basis-2/3 max-md:basis-full gap-4">
                                    <div className="item flex flex-col basis-1/3 ">
                                        <div className="text-button-uppercase pb-3">Infomation</div>
                                        <Link className='caption1 has-line-before duration-300 w-fit' href={'/pages/contact'}>Contact us</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'#!'}>Career</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/my-account'}>My Account</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/order-tracking'}>Order  & Returns</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/pages/faqs'}>FAQs</Link>
                                    </div>
                                    <div className="item flex flex-col basis-1/3 ">
                                        <div className="text-button-uppercase pb-3">Quick Shop</div>
                                        <Link className='caption1 has-line-before duration-300 w-fit' href={'/shop/breadcrumb1'}>Women</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1'}>Men</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1'}>Clothes</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1'}>Accessories</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/blog'}>Blog</Link>
                                    </div>
                                    <div className="item flex flex-col basis-1/3 ">
                                        <div className="text-button-uppercase pb-3">Customer Services</div>
                                        <Link className='caption1 has-line-before duration-300 w-fit' href={'/pages/faqs'}>Orders FAQs</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/pages/faqs'}>Shipping</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/pages/terms-and-conditions'}>Terms & Conditions</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/pages/privacy-policy'}>Privacy Policy</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/order-tracking'}>Return & Refund</Link>
                                    </div>
                                </div>
                                <div className="newsletter basis-1/3 pl-7 max-md:basis-full max-md:pl-0">
                                    <div className="text-button-uppercase">Newletter</div>
                                    <div className="caption1 mt-3">Sign up for our newsletter and get 10% off your first purchase</div>
                                    <div className="input-block w-full h-[52px] mt-4">
                                        <form className="w-full h-full relative" onSubmit={handleSubscribe}>
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
                                        <p className="caption1 text-green mt-3">{successMessage}</p>
                                    )}                                    <div className="list-social flex items-center gap-6 mt-4">
                                        <Link href={'https://www.facebook.com/'} target='_blank'>
                                            <div className="icon-facebook text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.instagram.com/'} target='_blank'>
                                            <div className="icon-instagram text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.twitter.com/'} target='_blank'>
                                            <div className="icon-twitter text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.youtube.com/'} target='_blank'>
                                            <div className="icon-youtube text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.pinterest.com/'} target='_blank'>
                                            <div className="icon-pinterest text-2xl text-black"></div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer-bottom py-3 flex items-center justify-between gap-5 max-lg:justify-center max-lg:flex-col border-t border-line">
                            <div className="left flex items-center gap-8">
                                <div className="copyright caption1 text-secondary">©2023 Anvogue. All Rights Reserved.</div>
                                <div className="select-block flex items-center gap-5 max-md:hidden">
                                    <div className="choose-language flex items-center gap-1.5">
                                        <select name="language" id="chooseLanguageFooter" className='caption2 bg-transparent'>
                                            <option value="English">English</option>
                                            <option value="Espana">Espana</option>
                                            <option value="France">France</option>
                                        </select>
                                        <Icon.CaretDown size={12} color='#1F1F1F' />
                                    </div>
                                    <div className="choose-currency flex items-center gap-1.5">
                                        <select name="currency" id="chooseCurrencyFooter" className='caption2 bg-transparent'>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                        <Icon.CaretDown size={12} color='#1F1F1F' />
                                    </div>
                                </div>
                            </div>
                            <div className="right flex items-center gap-2">
                                <div className="caption1 text-secondary">Payment:</div>
                                <div className="payment-img">
                                    <Image
                                        src={'/images/payment/Frame-0.png'}
                                        width={500}
                                        height={500}
                                        alt={'payment'}
                                        className='w-9'
                                    />
                                </div>
                                <div className="payment-img">
                                    <Image
                                        src={'/images/payment/Frame-1.png'}
                                        width={500}
                                        height={500}
                                        alt={'payment'}
                                        className='w-9'
                                    />
                                </div>
                                <div className="payment-img">
                                    <Image
                                        src={'/images/payment/Frame-2.png'}
                                        width={500}
                                        height={500}
                                        alt={'payment'}
                                        className='w-9'
                                    />
                                </div>
                                <div className="payment-img">
                                    <Image
                                        src={'/images/payment/Frame-3.png'}
                                        width={500}
                                        height={500}
                                        alt={'payment'}
                                        className='w-9'
                                    />
                                </div>
                                <div className="payment-img">
                                    <Image
                                        src={'/images/payment/Frame-4.png'}
                                        width={500}
                                        height={500}
                                        alt={'payment'}
                                        className='w-9'
                                    />
                                </div>
                                <div className="payment-img">
                                    <Image
                                        src={'/images/payment/Frame-5.png'}
                                        width={500}
                                        height={500}
                                        alt={'payment'}
                                        className='w-9'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Footer