"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import ApiBlogItem from "@/components/Blog/ApiBlogItem";
import BlogSidebar from "@/components/Blog/BlogSidebar";
import Footer from "@/components/Footer/Footer";
import HandlePagination from "@/components/Other/HandlePagination";
import { fetchNewsEvents, NewsEvent } from "@/lib/blog";
import { getApiErrorMessage } from "@/lib/api";

const PAGE_SIZE = 4;

const BlogListContent = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [blogs, setBlogs] = useState<NewsEvent[]>([]);
  const [recentPosts, setRecentPosts] = useState<NewsEvent[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBlogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const [pageData, recentData] = await Promise.all([
          fetchNewsEvents(currentPage + 1, PAGE_SIZE),
          fetchNewsEvents(1, 5),
        ]);

        if (cancelled) return;

        setBlogs(pageData.items);
        setTotalRecords(pageData.totalRecords);
        setRecentPosts(recentData.items);
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

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return blogs;

    return blogs.filter(
      (item) =>
        item.Title.toLowerCase().includes(query) ||
        item.Description.toLowerCase().includes(query),
    );
  }, [blogs, searchQuery]);

  const pageCount = Math.ceil(totalRecords / PAGE_SIZE);

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="blog list md:py-20 py-10">
      <div className="container">
        {error && (
          <p className="text-red text-center mb-6">{error}</p>
        )}

        <div className="flex justify-between max-xl:flex-col gap-y-12">
          <div className="left xl:w-3/4 xl:pr-2">
            {loading ? (
              <p className="text-secondary text-center py-10">Loading blogs...</p>
            ) : filteredBlogs.length === 0 ? (
              <p className="text-secondary text-center py-10">No blog posts found.</p>
            ) : (
              <div className="list-blog flex flex-col xl:gap-10 gap-8">
                {filteredBlogs.map((item) => (
                  <ApiBlogItem
                    key={item.NewsEventsId}
                    data={item}
                    type="style-list"
                  />
                ))}
              </div>
            )}

            {!loading && pageCount > 1 && (
              <div className="list-pagination w-full flex items-center md:mt-10 mt-6">
                <HandlePagination
                  pageCount={pageCount}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          <BlogSidebar
            recentPosts={recentPosts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>
    </div>
  );
};

const BlogList = () => {
  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Blog List" subHeading="Blog List" />
      </div>

      <Suspense
        fallback={
          <div className="container py-20 text-center text-secondary">
            Loading blogs...
          </div>
        }
      >
        <BlogListContent />
      </Suspense>

      <Footer />
    </>
  );
};

export default BlogList;
