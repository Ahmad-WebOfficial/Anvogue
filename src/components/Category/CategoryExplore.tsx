"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import {
  Category,
  fetchCategoryTree,
  findCategoryById,
  getCategoryBreadcrumb,
  getVisibleChildren,
} from "@/lib/categories";
import { getApiErrorMessage } from "@/lib/api";
import CategoryDetailCard from "@/components/Home1/CategoryDetailCard";
import CategoryProducts from "@/components/Category/CategoryProducts";

interface CategoryExploreProps {
  categoryId: number;
}

const CategoryExplore: React.FC<CategoryExploreProps> = ({ categoryId }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchCategoryTree();
        if (!cancelled) setCategories(data);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load categories."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentCategory = findCategoryById(categories, categoryId);
  const breadcrumb = getCategoryBreadcrumb(categories, categoryId);
  const childCategories = currentCategory
    ? getVisibleChildren(currentCategory)
    : [];
  const showProducts = Boolean(currentCategory && childCategories.length === 0);

  if (loading) {
    return (
      <div className="category-explore md:py-20 py-10">
        <div className="container text-center text-secondary">
          Loading category...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-explore md:py-20 py-10">
        <div className="container text-center">
          <p className="text-red">{error}</p>
          <button
            type="button"
            className="button-main mt-6"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="category-explore md:py-20 py-10">
        <div className="container text-center">
          <div className="heading3">Category not found</div>
          <p className="body1 text-secondary mt-2">
            This category may have been removed or the link is invalid.
          </p>
          <Link href="/" className="button-main mt-6 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="category-explore md:py-20 py-10">
      <div className="container">
        <nav className="flex flex-wrap items-center gap-2 text-secondary mb-8">
          <Link href="/" className="hover:text-black duration-300">
            Home
          </Link>
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;
            return (
              <React.Fragment key={item.CategoryId}>
                <Icon.CaretRight size={14} />
                {isLast ? (
                  <span className="text-black">{item.Name}</span>
                ) : (
                  <Link
                    href={`/category/${item.CategoryId}`}
                    className="hover:text-black duration-300"
                  >
                    {item.Name}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        <CategoryDetailCard category={currentCategory} variant="hero" />

        {childCategories.length > 0 && (
          <div id="category-subcategories" className="md:mt-14 mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="heading4">Subcategories</div>
                <p className="body1 text-secondary mt-2">
                  Select a subcategory to continue exploring.
                </p>
              </div>
              <span className="caption1 text-secondary">
                {childCategories.length} available
              </span>
            </div>
            <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-6 md:mt-8 mt-6">
              {childCategories.map((child) => (
                <CategoryDetailCard
                  key={child.CategoryId}
                  category={child}
                  variant="grid"
                />
              ))}
            </div>
          </div>
        )}

        {showProducts && (
          <div id="category-products" className="md:mt-14 mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 md:mb-8">
              <div>
                <div className="heading4">Products</div>
                <p className="body1 text-secondary mt-2">
                  Browse products in {currentCategory.Name}. Click a product to
                  view details and add to cart.
                </p>
              </div>
            </div>
            <CategoryProducts
              categoryId={currentCategory.CategoryId}
              categoryName={currentCategory.Name}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryExplore;
