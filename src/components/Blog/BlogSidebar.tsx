"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  formatBlogDate,
  getBlogDetailUrl,
  getBlogImage,
  NewsEvent,
} from "@/lib/blog";

interface BlogSidebarProps {
  recentPosts: NewsEvent[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({
  recentPosts,
  searchQuery,
  onSearchChange,
}) => {
  const router = useRouter();

  return (
    <div className="right xl:w-1/4 md:w-1/3 xl:pl-[52px] md:pl-8">
      <form
        className="form-search relative w-full h-12"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          className="py-2 px-4 w-full h-full border border-line rounded-lg"
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </form>

      {recentPosts.length > 0 && (
        <div className="recent md:mt-10 mt-6 pb-8 border-b border-line">
          <div className="heading6">Recent Posts</div>
          <div className="list-recent pt-1">
            {recentPosts.map((item) => (
              <div
                className="item flex gap-4 mt-5 cursor-pointer"
                key={item.NewsEventsId}
                onClick={() => router.push(getBlogDetailUrl(item))}
              >
                <Image
                  src={getBlogImage(item)}
                  width={500}
                  height={400}
                  alt={item.Title}
                  unoptimized
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div>
                  <div className="blog-tag whitespace-nowrap bg-green py-0.5 px-2 rounded-full text-button-uppercase text-xs inline-block">
                    Blog
                  </div>
                  <div className="text-title mt-1 line-clamp-2">{item.Title}</div>
                  <div className="caption2 text-secondary mt-1">
                    {formatBlogDate(item.NewsEventsDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSidebar;
