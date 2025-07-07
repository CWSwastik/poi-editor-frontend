"use client";

import React from "react";
import KeplerGl from "@kepler.gl/components";
import { Provider, useDispatch } from "react-redux";
import store from "../store";
import { addDataToMap } from "@kepler.gl/actions";
import useSwr from "swr";

// ✅ Renders the actual Kepler map
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

// ✅ Transforms your POI API response into Kepler-friendly format
const transformToKeplerFormat = (data: any[]) => {
  const fields = [
    { name: "visits_avg_daily", type: "real" },
    { name: "version", type: "string" },
    { name: "state", type: "string" },
    { name: "search_string", type: "string" },
    { name: "population_density_bucket_id", type: "string" },
    { name: "population_density", type: "real" },
    { name: "polygon_shared_or_independent", type: "string" },
    { name: "polygon_prefix", type: "string" },
    { name: "polygon_area_sqm", type: "real" },
    { name: "polygon", type: "string" },
    { name: "poi_type_list", type: "string" },
    { name: "poi_type", type: "string" },
    { name: "poi_name", type: "string" },
    { name: "poi_code_secondary", type: "string" },
    { name: "poi_code_old", type: "string" },
    { name: "placeids_within_count", type: "integer" },
    { name: "placeids_within", type: "string" },
    { name: "number_of_pois_in_polygon", type: "integer" },
    { name: "longitude", type: "real" },
    { name: "location_status", type: "string" },
    { name: "latitude", type: "real" },
    { name: "h3index", type: "string" },
    { name: "google_plus_code", type: "string" },
    { name: "google_category_tags", type: "string" },
    { name: "gmaps_url", type: "string" },
    { name: "district_code", type: "string" },
    { name: "district", type: "string" },
    { name: "distance_between_point_and_building_polygon", type: "real" },
    { name: "distance_between_point_and_building_centroid", type: "real" },
    { name: "devices_monthly", type: "integer" },
    { name: "devices_avg_daily", type: "integer" },
    { name: "default_kring", type: "integer" },
    { name: "country", type: "string" },
    { name: "city", type: "string" },
    { name: "brands", type: "string" },
    { name: "average_visit_duration", type: "real" },
    { name: "average_monthly_visitors", type: "real" },
    { name: "address", type: "string" },
    { name: "id", type: "integer" },
  ];

  const rows = data.map((item) => [
    item.visits_avg_daily,
    item.version,
    item.state,
    item.search_string,
    item.population_density_bucket_id,
    item.population_density,
    item.polygon_shared_or_independent,
    item.polygon_prefix,
    item.polygon_area_sqm,
    item.polygon,
    JSON.stringify(item.poi_type_list),
    item.poi_type,
    item.poi_name,
    item.poi_code_secondary,
    item.poi_code_old,
    item.placeids_within_count,
    JSON.stringify(item.placeids_within),
    item.number_of_pois_in_polygon,
    item.longitude,
    item.location_status,
    item.latitude,
    item.h3index,
    item.google_plus_code,
    JSON.stringify(item.google_category_tags),
    item.gmaps_url,
    item.district_code,
    item.district,
    item.distance_between_point_and_building_polygon,
    item.distance_between_point_and_building_centroid,
    item.devices_monthly,
    item.devices_avg_daily,
    item.default_kring,
    item.country,
    item.city,
    item.brands,
    item.average_visit_duration,
    item.average_monthly_visitors,
    item.address,
    item.id,
  ]);

  return { fields, rows };
};

// ✅ Component that uses Redux + fetches + dispatches
function MapWithData() {
  const dispatch = useDispatch();

  const { data } = useSwr("pois", async () => {
    const response = await fetch("http://127.0.0.1:8000/pois/nearby?lat=19&lng=-99&radius_km=20");
    return await response.json();
  });

  React.useEffect(() => {
    if (data) {
      const keplerData = transformToKeplerFormat(data);
      dispatch(
        addDataToMap({
          datasets: {
            info: {
              label: "Nearby POIs",
              id: "pois",
            },
            data: keplerData,
          },
          options: {
            centerMap: true,
            readOnly: false,
          },
          config: {},
        })
      );
    }
  }, [dispatch, data]);

  return <Map />;
}

// ✅ Top-level: wrap everything in Redux Provider
export default function MapWrapper() {
  return (
    <Provider store={store}>
      <MapWithData />
    </Provider>
  );
}
