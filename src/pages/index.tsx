import React from "react";
import dynamic from "next/dynamic";

const HomePage = dynamic(
  () => import("@/components/pages/HomePage/HomePage"),
  { ssr: false }
);

export default function IndexPage() {
  return (
    <HomePage />
  );
}
