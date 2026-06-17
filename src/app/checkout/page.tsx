"use client";
import React, { useState, useEffect } from "react"; // Added useEffect
import Image from "next/image";
import Link from "next/link";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { ProductType } from "@/type/ProductType";
import productData from "@/data/Product.json";
import Product from "@/components/Product/Product";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";

const Checkout = () => {
  const searchParams = useSearchParams();
  const discount = Number(searchParams.get("discount")) || 0;
  const ship = Number(searchParams.get("ship")) || 0;

  const { cartState } = useCart();
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]); // New
  const [selectedAreaId, setSelectedAreaId] = useState<string>(''); 
const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>(""); // New
  const [selectedStateId, setSelectedStateId] = useState<string>(""); // Ye zaruri hai
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]); // New
  const [selectedCityId, setSelectedCityId] = useState<string>(""); // New
  const [branches, setBranches] = useState<any[]>([]); // New state
  const [loading, setLoading] = useState(true); // Loading state
  const [activePayment, setActivePayment] = useState<string>("credit-card");

  // Clean total calculation
  const totalCart = cartState.cartArray.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Common/countries`,
          {
            headers: {
              "api-security-key": process.env.NEXT_PUBLIC_API_KEY || "",
              "Content-Type": "application/json",
            },
          },
        );

        const result = await res.json();

        // The API returns { Data: [...] }, so we access result.Data
        if (result && Array.isArray(result.Data)) {
          setCountries(result.Data);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);
  // 1. States Fetch (Country select hone par)
  const fetchStates = async (countryId: string) => {
    console.log("Country ID received in fetchStates:", countryId);
    if (!countryId || countryId === "default") return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Common/states?CountryId=${countryId}`,
        {
          headers: {
            "api-security-key": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
        },
      );
      const result = await res.json();
      console.log("States API response:", result); // Yahan check karein kya data aa raha hai

      if (result && Array.isArray(result.Data)) {
        setStates(result.Data);
      } else {
        console.log("No states found or invalid format");
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  // 2. Cities Fetch (State select hone par)
  const fetchCities = async (stateId: string) => {
    console.log("State ID received in fetchCities:", stateId); // Ye print hona chahiye
    if (!stateId || stateId === "default") return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Common/cities?StateId=${stateId}`,
        {
          headers: {
            "api-security-key": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
        },
      );
      const result = await res.json();
      console.log("Cities API response:", result); // Yahan dekhein ki kya cities list mein hain

      if (result && Array.isArray(result.Data)) {
        setCities(result.Data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };
  const fetchAreas = async (cityId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/Common/areas?CityId=${cityId}`,
        {
          headers: {
            "api-security-key": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
        },
      );
      const result = await res.json();

      console.log("Areas API Response:", result);

      if (result && Array.isArray(result.Data)) {
        setAreas(result.Data);
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchBranches = async (cityId: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/Common/branches?CityId=${cityId}`, {
            headers: { 'api-security-key': process.env.NEXT_PUBLIC_API_KEY || '', 'Content-Type': 'application/json' },
        });
        const result = await res.json();
        
        console.log("Branches API Response:", result);
        
        if (result && Array.isArray(result.Data)) {
            setBranches(result.Data);
        } else {
            setBranches([]);
        }
    } catch (error) {
        console.error("Error fetching branches:", error);
    }
};

  const handlePayment = (item: string) => {
    setActivePayment(item);
  };

  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Shopping cart" subHeading="Shopping cart" />
      </div>
      <div className="cart-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex justify-between">
            <div className="left w-1/2">
              <div className="login bg-surface py-3 px-4 flex justify-between rounded-lg">
                <div className="left flex items-center">
                  <span className="text-on-surface-variant1 pr-4">
                    Already have an account?{" "}
                  </span>
                  <span className="text-button text-on-surface hover-underline cursor-pointer">
                    Login
                  </span>
                </div>
                <div className="right">
                  <i className="ph ph-caret-down fs-20 d-block cursor-pointer"></i>
                </div>
              </div>
              <div className="form-login-block mt-3">
                <form className="p-5 border border-line rounded-lg">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="email ">
                      <input
                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                        id="username"
                        type="email"
                        placeholder="Username or email"
                        required
                      />
                    </div>
                    <div className="pass ">
                      <input
                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                        id="password"
                        type="password"
                        placeholder="Password"
                        required
                      />
                    </div>
                  </div>
                  <div className="block-button mt-3">
                    <button className="button-main button-blue-hover">
                      Login
                    </button>
                  </div>
                </form>
              </div>
              <div className="information mt-5">
                <div className="heading5">Information</div>
                <div className="form-checkout mt-5">
                  <form>
                    <div className="grid sm:grid-cols-2 gap-4 gap-y-5 flex-wrap">
                      <div className="">
                        <input
                          className="border-line px-4 py-3 w-full rounded-lg"
                          id="firstName"
                          type="text"
                          placeholder="First Name *"
                          required
                        />
                      </div>
                      <div className="">
                        <input
                          className="border-line px-4 py-3 w-full rounded-lg"
                          id="lastName"
                          type="text"
                          placeholder="Last Name *"
                          required
                        />
                      </div>
                      <div className="">
                        <input
                          className="border-line px-4 py-3 w-full rounded-lg"
                          id="email"
                          type="email"
                          placeholder="Email Address *"
                          required
                        />
                      </div>
                      <div className="">
                        <input
                          className="border-line px-4 py-3 w-full rounded-lg"
                          id="phoneNumber"
                          type="number"
                          placeholder="Phone Numbers *"
                          required
                        />
                      </div>

                      <div className="col-span-full select-block">
                        <select
                          className="border border-line px-4 py-3 w-full rounded-lg"
                          id="region"
                          onChange={(e) => {
                            const countryId = e.target.value;
                            setSelectedCountryId(countryId);
                            setStates([]); // Purane States saaf
                            setCities([]); // Purani Cities saaf
                            setSelectedStateId(""); // State reset
                            fetchStates(countryId);
                          }}
                        >
                          <option value="default" disabled>
                            Choose Country/Region
                          </option>
                          {countries.map((country: any) => (
                            <option key={country.Value} value={country.Value}>
                              {country.Text}
                            </option>
                          ))}
                        </select>
                        <Icon.CaretDown className="arrow-down" />
                      </div>
                      <div className="select-block">
                        {/* State Dropdown */}
                        {/* State Dropdown */}
                        <select
                          className="border border-line px-4 py-3 w-full rounded-lg"
                          id="state"
                          name="state"
                          value={selectedStateId} // Ye line add karein
                          onChange={(e) => {
                            const stateId = e.target.value;
                            setSelectedStateId(stateId); // State update
                            setCities([]); // Purani cities saaf
                            fetchCities(stateId); // Cities fetch
                          }}
                        >
                          <option value="" disabled>
                            Choose State
                          </option>
                          {states.map((state: any) => (
                            <option key={state.Value} value={state.Value}>
                              {state.Text}
                            </option>
                          ))}
                        </select>
                        <Icon.CaretDown className="arrow-down" />
                      </div>
                      {/* City Dropdown */}
                      <div className="select-block">
                        {/* <select
                          className="border border-line px-4 py-3 w-full rounded-lg"
                          id="city"
                          value={selectedCityId}
                          onChange={(e) => {
                            const cityId = e.target.value;
                            setSelectedCityId(cityId);
                            setAreas([]); // Purane areas saaf karein
                            fetchAreas(cityId); // Naye areas fetch karein
                          }}
                        >
                          <option value="" disabled>
                            Choose City
                          </option>
                          {cities.map((city: any) => (
                            <option key={city.Value} value={city.Value}>
                              {city.Text}
                            </option>
                          ))}
                        </select> */}
                        <select 
    className="border border-line px-4 py-3 w-full rounded-lg" 
    id="city" 
    value={selectedCityId}
    onChange={(e) => {
        const cityId = e.target.value;
        setSelectedCityId(cityId);
        
        setAreas([]); // Purane areas saaf
        setBranches([]); // Purani branches saaf
        
        fetchAreas(cityId);    // Areas fetch karein
        fetchBranches(cityId); // Branches fetch karein
    }}
>
    <option value="" disabled>Choose City</option>
    {cities.map((city: any) => (
        <option key={city.Value} value={city.Value}>{city.Text}</option>
    ))}
</select>
                        <Icon.CaretDown className="arrow-down" />
                      </div>

                      <div className="select-block">
                      <select
    className="border border-line px-4 py-3 w-full rounded-lg"
    id="area"
    name="area"
    value={selectedAreaId} // Ye state add karna zaroori hai
    onChange={(e) => setSelectedAreaId(e.target.value)} // State update
>
    <option value="" disabled>
        Choose Area
    </option>
    {areas.length > 0 ? (
        areas.map((area: any) => (
            <option key={area.Value} value={area.Value}>
                {area.Text}
            </option>
        ))
    ) : (
        <option value="" disabled>
            No areas available
        </option>
    )}
</select>
                        <Icon.CaretDown className="arrow-down" />
                      </div>
<div className="select-block mt-4">
   <select className="border border-line px-4 py-3 w-full rounded-lg" id="branch">
    <option value="">Select Branch</option>
    {branches.length > 0 ? (
        branches.map((b) => <option key={b.Value} value={b.Value}>{b.Text}</option>)
    ) : (
        <option disabled>No branches in this city</option>
    )}
</select>
    <Icon.CaretDown className='arrow-down' />
</div>
                      <div className="">
                        <input
                          className="border-line px-4 py-3 w-full rounded-lg"
                          id="apartment"
                          type="text"
                          placeholder="Street,..."
                          required
                        />
                      </div>

                      <div className="">
                        <input
                          className="border-line px-4 py-3 w-full rounded-lg"
                          id="postal"
                          type="text"
                          placeholder="Postal Code *"
                          required
                        />
                      </div>
                      <div className="col-span-full">
                        <textarea
                          className="border border-line px-4 py-3 w-full rounded-lg"
                          id="note"
                          name="note"
                          placeholder="Write note..."
                        ></textarea>
                      </div>
                    </div>
                    <div className="payment-block md:mt-10 mt-6">
                      <div className="heading5">Choose payment Option:</div>
                      <div className="list-payment mt-5">
                        <div
                          className={`type bg-surface p-5 border border-line rounded-lg ${activePayment === "credit-card" ? "open" : ""}`}
                        >
                          <input
                            className="cursor-pointer"
                            type="radio"
                            id="credit"
                            name="payment"
                            checked={activePayment === "credit-card"}
                            onChange={() => handlePayment("credit-card")}
                          />
                          <label
                            className="text-button pl-2 cursor-pointer"
                            htmlFor="credit"
                          >
                            Credit Card
                          </label>
                          <div className="infor">
                            <div className="text-on-surface-variant1 pt-4">
                              Make your payment directly into our bank account.
                              Your order will not be shipped until the funds
                              have cleared in our account.
                            </div>
                            <div className="row">
                              <div className="col-12 mt-3">
                                <label htmlFor="cardNumberCredit">
                                  Card Numbers
                                </label>
                                <input
                                  className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2"
                                  type="text"
                                  id="cardNumberCredit"
                                  placeholder="ex.1234567290"
                                />
                              </div>
                              <div className=" mt-3">
                                <label htmlFor="dateCredit">Date</label>
                                <input
                                  className="border-line px-4 py-3 w-full rounded mt-2"
                                  type="date"
                                  id="dateCredit"
                                  name="date"
                                />
                              </div>
                              <div className=" mt-3">
                                <label htmlFor="ccvCredit">CCV</label>
                                <input
                                  className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2"
                                  type="text"
                                  id="ccvCredit"
                                  placeholder="****"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <input
                                type="checkbox"
                                id="saveCredit"
                                name="save"
                              />
                              <label
                                className="text-button"
                                htmlFor="saveCredit"
                              >
                                Save Card Details
                              </label>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${activePayment === "cash-delivery" ? "open" : ""}`}
                        >
                          <input
                            className="cursor-pointer"
                            type="radio"
                            id="delivery"
                            name="payment"
                            checked={activePayment === "cash-delivery"}
                            onChange={() => handlePayment("cash-delivery")}
                          />
                          <label
                            className="text-button pl-2 cursor-pointer"
                            htmlFor="delivery"
                          >
                            Cash on delivery
                          </label>
                          <div className="infor">
                            <div className="text-on-surface-variant1 pt-4">
                              Make your payment directly into our bank account.
                              Your order will not be shipped until the funds
                              have cleared in our account.
                            </div>
                            <div className="row">
                              <div className="col-12 mt-3">
                                {/* <div className="bg-img"><Image src="assets/images/component/payment.png" alt="" /></div> */}
                                <label htmlFor="cardNumberDelivery">
                                  Card Numbers
                                </label>
                                <input
                                  className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2"
                                  type="text"
                                  id="cardNumberDelivery"
                                  placeholder="ex.1234567290"
                                />
                              </div>
                              <div className=" mt-3">
                                <label htmlFor="dateDelivery">Date</label>
                                <input
                                  className="border-line px-4 py-3 w-full rounded mt-2"
                                  type="date"
                                  id="dateDelivery"
                                  name="date"
                                />
                              </div>
                              <div className=" mt-3">
                                <label htmlFor="ccvDelivery">CCV</label>
                                <input
                                  className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2"
                                  type="text"
                                  id="ccvDelivery"
                                  placeholder="****"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <input
                                type="checkbox"
                                id="saveDelivery"
                                name="save"
                              />
                              <label
                                className="text-button"
                                htmlFor="saveDelivery"
                              >
                                Save Card Details
                              </label>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${activePayment === "apple-pay" ? "open" : ""}`}
                        >
                          <input
                            className="cursor-pointer"
                            type="radio"
                            id="apple"
                            name="payment"
                            checked={activePayment === "apple-pay"}
                            onChange={() => handlePayment("apple-pay")}
                          />
                          <label
                            className="text-button pl-2 cursor-pointer"
                            htmlFor="apple"
                          >
                            Apple Pay
                          </label>
                          <div className="infor">
                            <div className="text-on-surface-variant1 pt-4">
                              Make your payment directly into our bank account.
                              Your order will not be shipped until the funds
                              have cleared in our account.
                            </div>
                            <div className="row">
                              <div className="col-12 mt-3">
                                {/* <div className="bg-img"><Image src="assets/images/component/payment.png" alt="" /></div> */}
                                <label htmlFor="cardNumberApple">
                                  Card Numbers
                                </label>
                                <input
                                  className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2"
                                  type="text"
                                  id="cardNumberApple"
                                  placeholder="ex.1234567290"
                                />
                              </div>
                              <div className=" mt-3">
                                <label htmlFor="dateApple">Date</label>
                                <input
                                  className="border-line px-4 py-3 w-full rounded mt-2"
                                  type="date"
                                  id="dateApple"
                                  name="date"
                                />
                              </div>
                              <div className=" mt-3">
                                <label htmlFor="ccvApple">CCV</label>
                                <input
                                  className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2"
                                  type="text"
                                  id="ccvApple"
                                  placeholder="****"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <input
                                type="checkbox"
                                id="saveApple"
                                name="save"
                              />
                              <label
                                className="text-button"
                                htmlFor="saveApple"
                              >
                                Save Card Details
                              </label>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${activePayment === "paypal" ? "open" : ""}`}
                        >
                          <input
                            className="cursor-pointer"
                            type="radio"
                            id="paypal"
                            name="payment"
                            checked={activePayment === "paypal"}
                            onChange={() => handlePayment("paypal")}
                          />
                          <label
                            className="text-button pl-2 cursor-pointer"
                            htmlFor="paypal"
                          >
                            PayPal
                          </label>
                          <div className="infor">
                            <div className="text-on-surface-variant1 pt-4">
                              Make your payment directly into our bank account.
                              Your order will not be shipped until the funds
                              have cleared in our account.
                            </div>
                            <div className="row">
                              <div className="col-12 mt-3">
                                <label htmlFor="cardNumberPaypal">
                                  Card Numbers
                                </label>
                                <input
                                  className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2"
                                  type="text"
                                  id="cardNumberPaypal"
                                  placeholder="ex.1234567290"
                                />
                              </div>
                              <div className=" mt-3">
                                <label htmlFor="datePaypal">Date</label>
                                <input
                                  className="border-line px-4 py-3 w-full rounded mt-2"
                                  type="date"
                                  id="datePaypal"
                                  name="date"
                                />
                              </div>
                              <div className=" mt-3">
                                <label htmlFor="ccvPaypal">CCV</label>
                                <input
                                  className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2"
                                  type="text"
                                  id="ccvPaypal"
                                  placeholder="****"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <input
                                type="checkbox"
                                id="savePaypal"
                                name="save"
                              />
                              <label
                                className="text-button"
                                htmlFor="savePaypal"
                              >
                                Save Card Details
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="block-button md:mt-10 mt-6">
                      <button className="button-main w-full">Payment</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="right w-5/12">
              <div className="checkout-block">
                <div className="heading5 pb-3">Your Order</div>
                <div className="list-product-checkout">
                  {cartState.cartArray.length < 1 ? (
                    <p className="text-button pt-3">No product in cart</p>
                  ) : (
                    cartState.cartArray.map((product) => (
                      <>
                        <div className="item flex items-center justify-between w-full pb-5 border-b border-line gap-6 mt-5">
                          <div className="bg-img w-[100px] aspect-square flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={product.thumbImage[0]}
                              width={500}
                              height={500}
                              alt="img"
                              className="w-full h-full"
                            />
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="name text-title">
                                {product.name}
                              </div>
                              <div className="caption1 text-secondary mt-2">
                                <span className="size capitalize">
                                  {product.selectedSize || product.sizes[0]}
                                </span>
                                <span>/</span>
                                <span className="color capitalize">
                                  {product.selectedColor ||
                                    product.variation[0].color}
                                </span>
                              </div>
                            </div>
                            <div className="text-title">
                              <span className="quantity">
                                {product.quantity}
                              </span>
                              <span className="px-1">x</span>
                              <span>${product.price}.00</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ))
                  )}
                </div>
                <div className="discount-block py-5 flex justify-between border-b border-line">
                  <div className="text-title">Discounts</div>
                  <div className="text-title">
                    -$<span className="discount">{discount}</span>
                    <span>.00</span>
                  </div>
                </div>
                <div className="ship-block py-5 flex justify-between border-b border-line">
                  <div className="text-title">Shipping</div>
                  <div className="text-title">
                    {Number(ship) === 0 ? "Free" : `$${ship}.00`}
                  </div>
                </div>
                <div className="total-cart-block pt-5 flex justify-between">
                  <div className="heading5">Total</div>
                  <div className="heading5 total-cart">
                    ${totalCart - Number(discount) + Number(ship)}.00
                  </div>
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

export default Checkout;
