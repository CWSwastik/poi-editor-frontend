"use client";
import React from "react";
import KeplerGl from "@kepler.gl/components";
import { Provider } from "react-redux";
import store from "../store";

const Map: React.FC = () => (
  <div style={{ position: "absolute", width: "100%", height: "100%" }}>
    <KeplerGl
      id="map"
      mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
      getState={(state: any) => state.keplerGl}
      width={typeof window !== "undefined" ? window.innerWidth : 800}
      height={typeof window !== "undefined" ? window.innerHeight : 600}
    />
  </div>
);

export default function MapWrapper() {
  return (
    <Provider store={store}>
      <Map />
    </Provider>
  );
}
