"use client";

import React from "react";
import Link from "next/link";
import {
  Category,
  getCategoryNavigationUrl,
  getVisibleChildren,
} from "@/lib/categories";
import { useCategoryTree } from "@/hooks/useCategoryTree";

const CategoryNavColumn = ({ category }: { category: Category }) => {
  const children = getVisibleChildren(category);

  return (
    <div className="nav-item flex h-full min-h-[180px] flex-col">
      <Link
        href={getCategoryNavigationUrl(category)}
        className="text-button-uppercase pb-3 inline-block hover:text-black duration-300"
      >
        {category.Name}
      </Link>

      <ul className="flex flex-1 flex-col">
        {children.map((child) => {
          const grandchildren = getVisibleChildren(child);

          return (
            <React.Fragment key={child.CategoryId}>
              <li>
                <Link
                  href={getCategoryNavigationUrl(child)}
                  className="link text-secondary duration-300"
                >
                  {child.Name}
                </Link>
              </li>
              {grandchildren.map((grandchild) => (
                <li key={grandchild.CategoryId} className="pl-3">
                  <Link
                    href={getCategoryNavigationUrl(grandchild)}
                    className="link text-secondary duration-300"
                  >
                    {grandchild.Name}
                  </Link>
                </li>
              ))}
            </React.Fragment>
          );
        })}

        {children.length === 0 && (
          <li>
            <Link
              href={getCategoryNavigationUrl(category)}
              className="link text-secondary duration-300"
            >
              {category.Name}
            </Link>
          </li>
        )}

        <li className="mt-auto pt-2">
          <Link
            href={getCategoryNavigationUrl(category)}
            className="link text-secondary duration-300 view-all-btn"
          >
            View All
          </Link>
        </li>
      </ul>
    </div>
  );
};

const DynamicCategoryMegaMenu = () => {
  const { rootCategories, loading, error } = useCategoryTree();

  if (loading) {
    return (
      <div className="mega-menu absolute top-[74px] left-0 w-screen bg-white">
        <div className="container py-10 text-secondary">Loading categories...</div>
      </div>
    );
  }

  if (error || rootCategories.length === 0) {
    return (
      <div className="mega-menu absolute top-[74px] left-0 w-screen bg-white">
        <div className="container py-10 text-secondary">
          {error || "No categories available."}
        </div>
      </div>
    );
  }

  return (
    <div className="mega-menu absolute top-[74px] left-0 w-screen bg-white">
      <div className="container">
        <div className="py-8 md:py-10">
          <div className="nav-link grid w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr">
            {rootCategories.map((category) => (
              <CategoryNavColumn key={category.CategoryId} category={category} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicCategoryMegaMenu;
