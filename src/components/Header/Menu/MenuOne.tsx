"use client";
import { getAuthToken, logout } from "@/lib/auth";
import { jwtDecode } from "jwt-decode"; // Import add karein
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { usePathname } from "next/navigation";
import useLoginPopup from "@/store/useLoginPopup";
import useMenuMobile from "@/store/useMenuMobile";
import { useModalCartContext } from "@/context/ModalCartContext";
import { useModalWishlistContext } from "@/context/ModalWishlistContext";
import { useModalSearchContext } from "@/context/ModalSearchContext";
import { useCart } from "@/context/CartContext";
import TenantLogo from "@/components/Common/TenantLogo";
import DynamicCategoryMegaMenu from "@/components/Category/DynamicCategoryMegaMenu";
import DynamicCategoryMobileNav from "@/components/Category/DynamicCategoryMobileNav";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  props: string;
}

const MenuOne: React.FC<Props> = ({ props }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { openLoginPopup, handleLoginPopup } = useLoginPopup();
  const { openMenuMobile, handleMenuMobile } = useMenuMobile();
  const [openSubNavMobile, setOpenSubNavMobile] = useState<number | null>(null);
  const { openModalCart } = useModalCartContext();
  const { cartState } = useCart();
  const { openModalWishlist } = useModalWishlistContext();
  const { openModalSearch } = useModalSearchContext();

  const handleOpenSubNavMobile = (index: number) => {
    setOpenSubNavMobile(openSubNavMobile === index ? null : index);
  };
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [fixedHeader, setFixedHeader] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null); // State add ki
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const email = decoded.email || "";

        setUser({
          email: email,
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Token decode error:", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);
  const handleLogout = async () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setFixedHeader(scrollPosition > 0 && scrollPosition < lastScrollPosition);
      setLastScrollPosition(scrollPosition);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollPosition]);

  return (
    <>
      <div
        className={`header-menu style-one ${fixedHeader ? "fixed" : "absolute"} top-0 left-0 right-0 w-full  md:h-[55px] h-[56px] ${props}`}
      >
        <div className="container mx-auto  h-full">
          <div className="header-main flex items-center justify-between h-full">
            <div className="left flex items-center gap-4">
              <div
                className="menu-mobile-icon lg:hidden flex items-center"
                onClick={handleMenuMobile}
              >
                <i className="icon-category text-2xl"></i>
              </div>
              <div className="flex items-center">
                {isLoggedIn ? (
                  <Link href={"/"} className="flex items-center">
                    <div className="heading4 text-xl">Welcome Back!</div>
                  </Link>
                ) : (
                  <TenantLogo />
                )}
              </div>
            </div>
            <div className="left flex items-center gap-16">
              <div className="menu-main h-full max-lg:hidden">
                <ul className="flex items-center gap-8 h-full">
                  <li className="h-full">
                    <Link
                      href="/"
                      className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname === "/" ? "active" : ""}`}
                    >
                      Home
                    </Link>
                  </li>
                  <li className="h-full">
                    <Link
                      href="/categories"
                      className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname.includes("/category") ? "active" : ""}`}
                    >
                      Categories
                    </Link>
                    <DynamicCategoryMegaMenu />
                  </li>
                  <li className="h-full relative">
                    <Link
                      href="#!"
                      className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname === "/cart" || pathname === "/checkout" || pathname === "/wishlist" ? "active" : ""}`}
                    >
                      Shop
                    </Link>
                    <div className="sub-menu py-3 px-5 -left-10 absolute bg-white rounded-b-xl">
                      <ul className="w-full">
                        <li>
                          <Link
                            href="/categories"
                            className="link text-secondary duration-300"
                          >
                            All Categories
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/cart"
                            className={`link text-secondary duration-300 ${pathname === "/cart" ? "active" : ""}`}
                          >
                            Shopping Cart
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/checkout"
                            className={`link text-secondary duration-300 ${pathname === "/checkout" ? "active" : ""}`}
                          >
                            Checkout
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/wishlist"
                            className={`link text-secondary duration-300 ${pathname === "/wishlist" ? "active" : ""}`}
                          >
                            Wishlist
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/my-account"
                            className={`link text-secondary duration-300 ${pathname === "/my-account" ? "active" : ""}`}
                          >
                            My Account
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li className="h-full relative">
                    <Link
                      href="/blog/list"
                      className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname.includes("/blog") ? "active" : ""}`}
                    >
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className=" flex items-center gap-5">
              <div
                className="hidden md:flex cursor-pointer hover:scale-110 duration-300"
                onClick={() => router.push("/search-result")}
                title="Search"
              >
                <Icon.MagnifyingGlass size={26} color="black" />
              </div>

              <div
                className="relative user-icon cursor-pointer hover:scale-110 duration-300"
                title="Account"
              >
                <Icon.User
                  size={26}
                  color="black"
                  onClick={() =>
                    setOpenSubNavMobile((prev) => (prev === 99 ? null : 99))
                  }
                />

                <div
                  className="relative"
                  onMouseEnter={() => setOpenSubNavMobile(99)}
                  onMouseLeave={() => setOpenSubNavMobile(0)}
                >
                  <div
                    className={`login-popup absolute top-[3px] -right-8 w-[220px] p-5 rounded-xl bg-white shadow-lg border border-line transition-all duration-300 ${
                      openSubNavMobile === 99
                        ? "opacity-100 visible"
                        : "opacity-0 invisible"
                    }`}
                  >
                    {isLoggedIn ? (
                      <div className="flex flex-col gap-4">
                        <Link
                          href={"/my-account"}
                          className="flex items-center hover:scale-110 gap-3 font-medium hover:text-blue-600 transition-all"
                        >
                          <Icon.User size={20} /> Dashboard
                        </Link>
                        <Link
                          href={"/wishlist"}
                          className="flex items-center hover:scale-110 gap-3 font-medium hover:text-blue-600 transition-all"
                        >
                          <Icon.Heart size={20} /> Wishlist
                        </Link>
                        <button
                          onClick={() => setShowLogoutModal(true)}
                          className="flex items-center gap-3 font-medium hover:scale-110 text-red-600 hover:text-red-800 transition-all"
                        >
                          <Icon.SignOut size={20} /> Logout
                        </button>
                        <div className="pt-3 border-t text-center border-line mt-2">
                          <p className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Icon.Envelope size={14} />
                            {user?.email || "email@example.com"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <Link
                          href={"/login"}
                          title="Login Account"
                          className="flex items-center gap-3 font-medium hover:text-blue-600 transition-transform duration-200 hover:scale-105"
                        >
                          <Icon.SignIn size={20} /> Login
                        </Link>
                        <Link
                          href={"/register"}
                          title="Register Account"
                          className="flex items-center gap-3 font-medium hover:text-blue-600 transition-transform duration-200 hover:scale-105"
                        >
                          <Icon.UserPlus size={20} /> Register
                        </Link>
                        <Link
                          href={"/wishlist"}
                          title="Add to Wishlist"
                          className="flex items-center gap-3 font-medium hover:text-blue-600 transition-transform duration-200 hover:scale-105"
                        >
                          <Icon.Heart size={20} /> Wishlist
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="cart-icon flex items-center relative cursor-pointer hover:scale-110 duration-300"
                onClick={openModalCart}
                title="Cart"
              >
                <Icon.Handbag size={26} color="black" />
                <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">
                  {cartState.cartArray.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="menu-mobile" className={`${openMenuMobile ? "open" : ""}`}>
        <div className="menu-container bg-white h-full">
          <div className="container h-full">
            <div className="menu-main h-full overflow-hidden">
              <div className="heading py-2 relative flex items-center justify-center">
                <div
                  className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center cursor-pointer"
                  onClick={handleMenuMobile}
                >
                  <Icon.X size={14} />
                </div>
                <TenantLogo
                  className="justify-center"
                  textClassName="text-3xl font-semibold"
                  imageClassName="h-10 w-10 object-contain"
                />
              </div>

              <div className="list-nav mt-6">
                <ul>
                  <li>
                    <Link
                      href="/"
                      className="text-xl font-semibold flex items-center justify-between mt-5"
                    >
                      Home
                    </Link>
                  </li>

                  <li className={`${openSubNavMobile === 2 ? "open" : ""}`}>
                    <div
                      className="text-xl font-semibold flex items-center justify-between mt-5 cursor-pointer"
                      onClick={() => handleOpenSubNavMobile(2)}
                    >
                      Categories
                      <span className="text-right">
                        <Icon.CaretRight size={20} />
                      </span>
                    </div>
                    <DynamicCategoryMobileNav
                      onBack={() => handleOpenSubNavMobile(2)}
                    />
                  </li>

                  <li className={`${openSubNavMobile === 3 ? "open" : ""}`}>
                    <div
                      className="text-xl font-semibold flex items-center justify-between mt-5 cursor-pointer"
                      onClick={() => handleOpenSubNavMobile(3)}
                    >
                      Shop
                      <span className="text-right">
                        <Icon.CaretRight size={20} />
                      </span>
                    </div>
                    <div className="sub-nav-mobile">
                      <div
                        className="back-btn flex items-center gap-3 cursor-pointer"
                        onClick={() => handleOpenSubNavMobile(3)}
                      >
                        <Icon.CaretLeft />
                        Back
                      </div>
                      <div className="list-nav-item w-full pt-2 pb-6">
                        <ul className="w-full">
                          <li>
                            <Link
                              href="/categories"
                              className="nav-item-mobile"
                            >
                              All Categories
                            </Link>
                          </li>
                          <li>
                            <Link href="/cart" className="nav-item-mobile">
                              Shopping Cart
                            </Link>
                          </li>
                          <li>
                            <Link href="/checkout" className="nav-item-mobile">
                              Checkout
                            </Link>
                          </li>
                          <li>
                            <Link href="/wishlist" className="nav-item-mobile">
                              Wishlist
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/my-account"
                              className="nav-item-mobile"
                            >
                              My Account
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>

                  <li className={`${openSubNavMobile === 5 ? "open" : ""}`}>
                    <div
                      className="text-xl font-semibold flex items-center justify-between mt-5 cursor-pointer"
                      onClick={() => handleOpenSubNavMobile(5)}
                    >
                      Blog
                      <span className="text-right">
                        <Icon.CaretRight size={20} />
                      </span>
                    </div>
                    <div className="sub-nav-mobile">
                      <div
                        className="back-btn flex items-center gap-3 cursor-pointer"
                        onClick={() => handleOpenSubNavMobile(5)}
                      >
                        <Icon.CaretLeft />
                        Back
                      </div>
                      <div className="list-nav-item w-full pt-2 pb-6">
                        <ul className="w-full">
                          <li>
                            <Link href="/blog/list" className="nav-item-mobile">
                              Blog List
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="menu_bar fixed bg-white bottom-0 left-0 w-full h-[70px] sm:hidden z-[101]">
        <div className="menu_bar-inner grid grid-cols-4 items-center h-full">
          <Link
            href={"/"}
            className="menu_bar-link flex flex-col items-center gap-1"
          >
            <Icon.House weight="bold" className="text-2xl" />
            <span className="menu_bar-title caption2 font-semibold">Home</span>
          </Link>
          <Link
            href={"/categories"}
            className="menu_bar-link flex flex-col items-center gap-1"
          >
            <Icon.List weight="bold" className="text-2xl" />
            <span className="menu_bar-title caption2 font-semibold">
              Category
            </span>
          </Link>
          <Link
            href={"/search-result"}
            className="menu_bar-link flex flex-col items-center gap-1"
          >
            <Icon.MagnifyingGlass weight="bold" className="text-2xl" />
            <span className="menu_bar-title caption2 font-semibold">
              Search
            </span>
          </Link>
          <Link
            href={"/cart"}
            className="menu_bar-link flex flex-col items-center gap-1"
          >
            <div className="icon relative">
              <Icon.Handbag weight="bold" className="text-2xl" />
              <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">
                {cartState.cartArray.length}
              </span>
            </div>
            <span className="menu_bar-title caption2 font-semibold">Cart</span>
          </Link>
        </div>
      </div>
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30  backdrop-blur-[2px]">
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-[350px] text-center border border-white/50">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Are you sure?
            </h3>
            <p className="mb-8 text-sm text-gray-600">
              You want to logout of your account?
            </p>

            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2 border border-black text-black rounded-lg font-medium  hover:scale-105 transition-all duration-300 shadow-md"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-black text-white rounded-lg font-semibold h hover:scale-105 transition-all duration-300 shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuOne;
