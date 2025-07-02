"use client";
import dynamic from "next/dynamic";
import React from "react";

const MapWrapper = dynamic(() => import("../components/Map"), {
  ssr: false,
});

export default function Home() {
  return <MapWrapper />;
}
