"use client";

import React, { Suspense, useEffect, useState } from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import ApiBlogItem from "@/components/Blog/ApiBlogItem";
import Footer from "@/components/Footer/Footer";
import HandlePagination from "@/components/Other/HandlePagination";
import { fetchNewsEvents, NewsEvent } from "@/lib/blog";
import { getApiErrorMessage } from "@/lib/api";

const PAGE_SIZE = 9;

const BlogGridContent = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [blogs, setBlogs] = useState<NewsEvent[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBlogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const pageData = await fetchNewsEvents(currentPage + 1, PAGE_SIZE);
        if (cancelled) return;

        setBlogs(pageData.items);
        setTotalRecords(pageData.totalRecords);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load blogs."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadBlogs();

    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const pageCount = Math.ceil(totalRecords / PAGE_SIZE);

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="blog grid md:py-20 py-10">
      <div className="container">
        {error && (
          <p className="text-red text-center mb-6">{error}</p>
        )}

        {loading ? (
          <p className="text-secondary text-center py-10">Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p className="text-secondary text-center py-10">No blog posts found.</p>
        ) : (
          <div className="list-blog grid lg:grid-cols-3 sm:grid-cols-2 md:gap-[42px] gap-8">
            {blogs.map((item) => (
              <ApiBlogItem
                key={item.NewsEventsId}
                data={item}
                type="style-one"
              />
            ))}
          </div>
        )}

        {!loading && pageCount > 1 && (
          <div className="list-pagination w-full flex items-center justify-center md:mt-10 mt-6">
            <HandlePagination
              pageCount={pageCount}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const BlogGrid = () => {
  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Blog Grid" subHeading="Blog Grid" />
      </div>

      <Suspense
        fallback={
          <div className="container py-20 text-center text-secondary">
            Loading blogs...
          </div>
        }
      >
        <BlogGridContent />
      </Suspense>

      <Footer />
    </>
  );
};

export default BlogGrid;
