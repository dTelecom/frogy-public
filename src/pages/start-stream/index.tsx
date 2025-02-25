import React from "react";
import dynamic from "next/dynamic";
const StartStreamPage = dynamic(
  () => import("@/components/pages/StartStreamPage/StartStreamPage"),
  { ssr: false }
);

export default function IndexPage() {
  return (
    <StartStreamPage />
  );
}
