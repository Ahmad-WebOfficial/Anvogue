import React, { Suspense } from "react";
import ProductDefault from "./ProductDefault";

export default function ProductDefaultPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center">Loading product...</div>
      }
    >
      <ProductDefault />
    </Suspense>
  );
}
