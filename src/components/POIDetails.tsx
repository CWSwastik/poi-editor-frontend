import React, { useState, useEffect } from "react";
import { POIData } from "@/types/POIData";

interface POIDetailsProps {
  poi: POIData;
  onUpdate: (updatedPOI: POIData) => void;
  onClose: () => void;
}

const POIDetails: React.FC<POIDetailsProps> = ({ poi, onUpdate, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPOI, setEditedPOI] = useState<POIData>(poi);
  const [openSection, setOpenSection] = useState<string | null>("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedPOI(poi);
    setIsEditing(false);
    setOpenSection("basic");
    setError(null);
  }, [poi]);

  const toggleSection = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const handleEdit = () => setIsEditing(true);

  const transformDataForAPI = (data: POIData) => {
    return {
      visits_avg_daily: data.visits_avg_daily || 0,
      version: data.version || "",
      state: data.state || "",
      search_string: data.search_string || "",
      population_density_bucket_id: data.population_density_bucket_id || "",
      population_density: data.population_density || 0,
      polygon_shared_or_independent: data.polygon_shared_or_independent || "",
      polygon_prefix: data.polygon_prefix || "",
      polygon_area_sqm: data.polygon_area_sqm || 0,
      polygon: data.polygon || "",
      poi_type_list: data.poi_type_list ? 
        (typeof data.poi_type_list === 'string' ? 
          data.poi_type_list.split(',').map(s => s.trim()) : 
          data.poi_type_list) : [],
      poi_type: data.poi_type || "",
      poi_name: data.poi_name || "",
      poi_code_secondary: data.poi_code_secondary || "",
      poi_code_old: data.poi_code_old || "",
      placeids_within_count: data.placeids_within_count || 0,
      placeids_within: data.placeids_within ? 
        (typeof data.placeids_within === 'string' ? 
          data.placeids_within.split(',').map(s => s.trim()) : 
          data.placeids_within) : [],
      number_of_pois_in_polygon: data.number_of_pois_in_polygon || 0,
      longitude: data.longitude || 0,
      location_status: data.location_status || "",
      latitude: data.latitude || 0,
      h3index: data.h3index || "",
      google_plus_code: data.google_plus_code || "",
      google_category_tags: data.google_category_tags ? 
        (typeof data.google_category_tags === 'string' ? 
          data.google_category_tags.split(',').map(s => s.trim()) : 
          data.google_category_tags) : [],
      gmaps_url: data.gmaps_url || "",
      district_code: data.district_code || "",
      district: data.district || "",
      distance_between_point_and_building_polygon: data.distance_between_point_and_building_polygon || 0,
      distance_between_point_and_building_centroid: data.distance_between_point_and_building_centroid || 0,
      devices_monthly: data.devices_monthly || 0,
      devices_avg_daily: data.devices_avg_daily || 0,
      default_kring: data.default_kring || 0,
      country: data.country || "",
      city: data.city || "",
      brands: data.brands || "",
      average_visit_duration: data.average_visit_duration || 0,
      average_monthly_visitors: data.average_monthly_visitors || 0,
      address: data.address || ""
    };
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const apiData = transformDataForAPI(editedPOI);
      
      const response = await fetch(`http://127.0.0.1:8000/pois/${poi.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const updatedData = await response.json();
      
      // Update the local state with the response data
      onUpdate(updatedData);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
      console.error('Error saving POI:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedPOI(poi);
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (field: keyof POIData, value: string | number) => {
    setEditedPOI((prev) => ({ ...prev, [field]: value }));
  };

  const renderField = (
    label: string,
    field: keyof POIData,
    type: "string" | "number" | "textarea" = "string",
    readOnly = false
  ) => {
    const value = editedPOI[field];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
        {!isEditing ? (
          <div className="text-gray-100 truncate w-full">{String(value ?? "N/A")}</div>
        ) : readOnly ? (
          <input
            type="text"
            value={String(value)}
            disabled
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
          />
        ) : type === "textarea" ? (
          <textarea
            value={String(value ?? "")}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
            rows={3}
          />
        ) : (
          <input
            type={type === "number" ? "number" : "text"}
            step={type === "number" ? "any" : undefined}
            value={String(value ?? "")}
            onChange={(e) =>
              handleInputChange(
                field,
                type === "number"
                  ? parseFloat(e.target.value) || 0
                  : e.target.value
              )
            }
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
          />
        )}
      </div>
    );
  };

  const sections: {
    title: string;
    key: string;
    fields: JSX.Element[];
  }[] = [
    {
      title: "Basic Information",
      key: "basic",
      fields: [
        renderField("POI ID", "id", "number", true),
        renderField("POI Name", "poi_name"),
        renderField("POI Type", "poi_type"),
        renderField("POI Type List", "poi_type_list", "textarea"),
        renderField("Secondary Code", "poi_code_secondary"),
        renderField("Old Code", "poi_code_old"),
        renderField("Address", "address", "textarea"),
        renderField("Brands", "brands"),
        renderField("Location Status", "location_status"),
        renderField("Search String", "search_string"),
      ],
    },
    {
      title: "Location Details",
      key: "location",
      fields: [
        renderField("Latitude", "latitude", "number"),
        renderField("Longitude", "longitude", "number"),
        renderField("City", "city"),
        renderField("District", "district"),
        renderField("District Code", "district_code"),
        renderField("State", "state"),
        renderField("Country", "country"),
        renderField("H3 Index", "h3index"),
        renderField("Google Plus Code", "google_plus_code"),
        renderField("Google Category Tags", "google_category_tags", "textarea"),
        renderField("Google Maps URL", "gmaps_url", "textarea"),
      ],
    },
    {
      title: "Analytics",
      key: "analytics",
      fields: [
        renderField("Average Daily Visits", "visits_avg_daily", "number"),
        renderField("Average Daily Devices", "devices_avg_daily", "number"),
        renderField("Monthly Devices", "devices_monthly", "number"),
        renderField("Average Visit Duration", "average_visit_duration", "number"),
        renderField("Average Monthly Visitors", "average_monthly_visitors", "number"),
        renderField("Population Density", "population_density", "number"),
        renderField("Population Density Bucket", "population_density_bucket_id"),
        renderField("Number of POIs in Polygon", "number_of_pois_in_polygon", "number"),
        renderField("Placeids Within Count", "placeids_within_count", "number"),
      ],
    },
    {
      title: "Technical Details",
      key: "technical",
      fields: [
        renderField("Version", "version"),
        renderField("Polygon", "polygon", "textarea"),
        renderField("Polygon Prefix", "polygon_prefix"),
        renderField("Polygon Area (sqm)", "polygon_area_sqm", "number"),
        renderField("Polygon Shared/Independent", "polygon_shared_or_independent"),
        renderField("Placeids Within", "placeids_within", "textarea"),
        renderField("Distance to Building Centroid", "distance_between_point_and_building_centroid", "number"),
        renderField("Distance to Building Polygon", "distance_between_point_and_building_polygon", "number"),
        renderField("Default K-Ring", "default_kring", "number"),
      ],
    },
  ];

  return (
    <div className="bg-gray-800 shadow-xl rounded-lg p-6 w-full max-w-3xl mx-auto mt-4 overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center border-b border-gray-600 pb-3 mb-4">
        <h3 className="text-xl font-semibold text-gray-100">
          {editedPOI.poi_name || "POI Details"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-400 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-600 text-white rounded-lg">
          <p className="font-medium">Error saving POI:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.key} className="mb-4 border border-gray-600 rounded">
          <button
            onClick={() => toggleSection(section.key)}
            className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 font-semibold flex justify-between items-center text-gray-100"
          >
            <span>{section.title}</span>
            <span>{openSection === section.key ? "▲" : "▼"}</span>
          </button>
          {openSection === section.key && (
            <div className="p-4 bg-gray-800">{section.fields}</div>
          )}
        </div>
      ))}

      <div className="mt-6 flex justify-end space-x-4">
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit POI
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 text-white rounded ${
                isSaving 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default POIDetails;