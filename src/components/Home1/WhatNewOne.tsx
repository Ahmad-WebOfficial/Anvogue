"use client";

import React, { useState, useEffect } from "react";
import Product from "../Product/Product";
import { motion } from "framer-motion";
import api from "@/lib/api";

const WhatNewOne = () => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const res = await api.get("/api/v1/Product/landing-page");
        if (res.data?.Data) {
          setCategories(res.data.Data);
          console.log("Fetched categories:", res.data.Data);
          if (res.data.Data.length > 0) {
            setActiveTab(res.data.Data[0].Category?.CategoryName);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchLandingData();
  }, []);

  const activeCategory = categories.find(
    (item) => item.Category?.CategoryName === activeTab,
  );
  const products = activeCategory ? activeCategory.ProductList : [];

  return (
    <div className="whate-new-block md:pt-20 pt-10">
      <div className="container">
        <div className="heading flex flex-col items-center text-center">
<div className="heading3">What&apos;s new</div>
          <div className="menu-tab flex flex-wrap justify-center items-center gap-2 p-1 bg-surface rounded-2xl mt-6">
            {categories.map((item, index) => (
              <div
                key={index}
                className={`tab-item relative text-secondary text-button-uppercase py-2 px-5 cursor-pointer duration-500 hover:text-black ${activeTab === item.Category?.CategoryName ? "active" : ""}`}
                onClick={() => setActiveTab(item.Category?.CategoryName)}
              >
                {activeTab === item.Category?.CategoryName && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-2xl bg-white"
                  ></motion.div>
                )}
                <span className="relative text-button-uppercase z-[1]">
                  {item.Category?.CategoryName}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="list-product grid lg:grid-cols-4 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6">
          {products.length > 0 ? (
            products.map((prd: any) => {
              console.log("Single Product =>", prd);

              const image =
                prd.ThumbnailImagePath ||
                prd.IconImagePath ||
                "/placeholder.jpg";

              return (
                <Product
                  key={prd.ProductId}
                  type="grid"
                  style="style-1"
                  data={{
                    id: prd.ProductId,
                    productDetailId: prd.ProductDetailId,
                    name: prd.ProductName,

                    price: prd.MinPrice ?? 0,
                    originPrice: prd.MaxPrice ?? 0,

                    description: prd.Description,

                    thumbImage: [image],

                    new: prd.IsNewProduct,

                    sale: prd.Discount > 0 || prd.MinPrice < prd.MaxPrice,

                    variation: [],
                    sizes: [],
                    quantity: 100,
                    sold: 0,
                    action: "add to cart",
                    rate: 5,
                    quantityPurchase: 1,
                  }}
                />
              );
            })
          ) : (
            <p className="col-span-full text-center py-10">
              No products found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatNewOne;
