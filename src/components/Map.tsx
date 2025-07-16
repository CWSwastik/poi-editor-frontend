"use client";

import React, { useState, useCallback } from "react";
import KeplerGl from "@kepler.gl/components";
import { Provider, useDispatch } from "react-redux";
import store from "../store";
import { addDataToMap } from "@kepler.gl/actions";
import useSwr from "swr";
import useFeatureClick from "../app/hooks/useFeatureClick";
import POIDetails from "./POIDetails"; // Add this import
import { POIData } from "@/types/POIData";

const Map: React.FC = () => (
  <div
    className="overflow-hidden"
    style={{ position: "absolute", width: "100%", height: "100%" }}
  >
    <KeplerGl
      id="map"
      mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
      getState={(state: any) => state.keplerGl}
      width={typeof window !== "undefined" ? window.innerWidth : 800}
      height={typeof window !== "undefined" ? window.innerHeight : 600}
    />
  </div>
);

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

const transformToKeplerFormat = (data: any[]) => {
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

const convertRowToObject = (row: any[]): POIData => {
  const obj: any = {};
  fields.forEach((field, index) => {
    const value = row[index];
    // Parse JSON fields
    if (
      ["poi_type_list", "placeids_within", "google_category_tags"].includes(
        field.name
      )
    ) {
      try {
        obj[field.name] = JSON.parse(value);
      } catch {
        obj[field.name] = value;
      }
    } else {
      obj[field.name] = value;
    }
  });
  return obj;
};

function MapWithData({
  lat,
  lng,
  radius,
}: {
  lat: number;
  lng: number;
  radius: number;
}) {
  const dispatch = useDispatch();
  const [showPOIDetails, setShowPOIDetails] = useState(false);
  const [clickedPOIData, setClickedPOIData] = useState<POIData>();

  const handleFeatureClick = useCallback(
    (index: number, dataset: any) => {
      const poi_data = convertRowToObject(dataset._rows[index]);
      console.log(poi_data);
      setClickedPOIData(poi_data);
      setShowPOIDetails(true);
    },
    [] // no deps, so it never changes
  );

  // Initialize the feature click hook with a callback
  useFeatureClick({ onFeatureClick: handleFeatureClick });

  const { data } = useSwr(`pois-${lat}-${lng}-${radius}`, async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pois/nearby?lat=${lat}&lng=${lng}&h3_disk_radius=${radius}`,
      {
        headers: {
          "Ngrok-Skip-Browser-Warning": "1",
        },
      }
    );
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

          config: {
            visState: {
              layers: [
                {
                  id: "pois-point-layer",
                  type: "point",
                  config: {
                    dataId: "pois",
                    label: "POIs Point Layer",
                    columns: {
                      lat: "latitude",
                      lng: "longitude",
                    },
                    isVisible: true,
                    visConfig: {
                      radius: 10,
                      opacity: 1,
                      colorRange: {
                        name: "Custom",
                        type: "custom",
                        category: "Custom",
                        colors: ["#ff6b00"],
                      },
                      outline: false,
                    },
                  },
                },
              ],
              interactionConfig: {
                tooltip: {
                  enabled: false,
                  fieldsToShow: {},
                  compareMode: false,
                  compareType: "absolute",
                },
              },
            },
          },
        })
      );
    }
  }, [dispatch, data]);

  const handlePOIUpdate = (updatedPOI: any) => {
    // Here you would typically make an API call to update the POI
    console.log("POI updated:", updatedPOI);
  };

  const handleClosePOIDetails = () => {
    setShowPOIDetails(false);
  };

  return (
    <>
      <Map />

      {showPOIDetails && clickedPOIData && (
        <div className="">
          {" "}
          <POIDetails
            poi={clickedPOIData}
            onUpdate={handlePOIUpdate}
            onClose={handleClosePOIDetails}
          />
        </div>
      )}
    </>
  );
}

export default function MapWrapper() {
  const [latStr, setLatStr] = React.useState("0");
  const [lngStr, setLngStr] = React.useState("0");
  const [radiusStr, setRadiusStr] = React.useState("1");

  const [lat, setLat] = React.useState(0);
  const [lng, setLng] = React.useState(0);
  const [radius, setRadius] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [locationError, setLocationError] = React.useState("");
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedLat = parseFloat(latStr);
    const parsedLng = parseFloat(lngStr);
    const parsedRadius = parseInt(radiusStr);

    if (!isNaN(parsedLat) && !isNaN(parsedLng) && !isNaN(parsedRadius)) {
      setLat(parsedLat);
      setLng(parsedLng);
      setRadius(parsedRadius);
      setSubmitted(true);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatStr(latitude.toFixed(6));
        setLngStr(longitude.toFixed(6));
        setIsGettingLocation(false);

        // Optionally auto-submit with current location
        // setLat(latitude);
        // setLng(longitude);
        // setRadius(parseInt(radiusStr));
        // setSubmitted(true);
      },
      (error) => {
        let errorMessage = "Unable to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache location for 1 minute
      }
    );
  };

  return (
    <Provider store={store}>
      <form
        onSubmit={handleSubmit}
        className="fixed top-4 right-4 z-50 bg-black text-white p-4 rounded-lg min-w-[300px] max-w-[90vw]"
      >
        <div className="mb-2 flex flex-wrap gap-2">
          <input
            type="text"
            className="px-2 py-1 text-black border border-gray-400 rounded w-20 bg-white"
            placeholder="Lat"
            value={latStr}
            onChange={(e) => setLatStr(e.target.value)}
          />

          <input
            type="text"
            className="px-2 py-1 text-black border border-gray-400 rounded w-20 bg-white"
            placeholder="Long"
            value={lngStr}
            onChange={(e) => setLngStr(e.target.value)}
          />

          <input
            type="text"
            className="px-2 py-1 text-black border border-gray-400 rounded w-24 bg-white"
            placeholder="Radius (km)"
            value={radiusStr}
            onChange={(e) => setRadiusStr(e.target.value)}
          />
        </div>

        <div className="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
          >
            {isGettingLocation ? "Getting Location..." : "📍 Use My Location"}
          </button>

          <button
            type="submit"
            className="px-4 py-1 bg-white text-black rounded hover:bg-blue-700"
          >
            Update Map
          </button>
        </div>

        {locationError && (
          <div className="text-red-500 text-xs mt-1">{locationError}</div>
        )}
      </form>

      {submitted && <MapWithData lat={lat} lng={lng} radius={radius} />}
    </Provider>
  );
}
