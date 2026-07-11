"use client";
import React, { useState, useEffect } from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import api from "@/lib/api";

const StoreList = () => {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setLoading(true);
                const res = await api.get("/api/v1/TenantLanding/branches", {
                    params: { PageNumber: 1, PageSize: 10 },
                });

                if (res?.data?.Data?.Branches) {
                    setBranches(res.data.Data.Branches);
                }
            } catch (err: any) {
                console.error("API Error:", err);
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, []);

    return (
        <>
            <TopNavOne
                props="style-one bg-black"
                slogan="New customers save 10% with the code GET10"
            />
            <div id="header" className="relative w-full">
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading="Store list" subHeading="Store list" />
            </div>

            <div className="store-list md:py-20 py-10">
                <div className="container">
                    {loading ? (
                        <div className="text-center">Loading stores...</div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : (
                        branches.map((branch, index) => (
                            <div
                                key={index}
                                className="item bg-surface overflow-hidden rounded-[20px] p-8 md:mt-20 mt-10 shadow-sm"
                            >
                                <div className="text-content">
                                    <div className="heading3 mb-6">{branch.Name}</div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="heading6">Address:</div>
                                            <div className="text-secondary">{branch.Address}</div>
                                            <div className="heading6 mt-4">City:</div>
                                            <div className="text-secondary">{branch.City}</div>
                                        </div>
                                        <div>
                                            <div className="heading6">Timing:</div>
                                            <div className="text-secondary">{branch.Timing}</div>
                                            <div className="heading6 mt-4">Phone:</div>
                                            <div className="text-secondary">{branch.Phone}</div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="heading6">Email:</div>
                                        <div className="text-secondary">{branch.Email}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default StoreList;
