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
  const [activeTab, setActiveTab] = useState<
    "basic" | "location" | "analytics" | "technical"
  >("basic");

  console.log("poi editor opened");
  // Reset state whenever a new POI is passed in
  useEffect(() => {
    setEditedPOI(poi);
    setIsEditing(false);
    setActiveTab("basic");
  }, [poi]);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    onUpdate(editedPOI);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedPOI(poi);
    setIsEditing(false);
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
      <div className="poi-field">
        <label>{label}:</label>
        {!isEditing ? (
          <span>{String(value ?? "N/A")}</span>
        ) : readOnly ? (
          <input
            type="text"
            value={String(value)}
            disabled
            className="poi-input disabled"
          />
        ) : type === "textarea" ? (
          <textarea
            value={String(value ?? "")}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="poi-textarea"
            rows={2}
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
            className="poi-input"
          />
        )}
      </div>
    );
  };

  const renderBasicInfo = () => (
    <div className="poi-tab-content">
      {renderField("POI ID", "id", "number", true)}
      {renderField("POI Name", "poi_name")}
      {renderField("POI Type", "poi_type")}
      {renderField("POI Type List", "poi_type_list", "textarea")}
      {renderField("Secondary Code", "poi_code_secondary")}
      {renderField("Old Code", "poi_code_old")}
      {renderField("Address", "address", "textarea")}
      {renderField("Brands", "brands")}
      {renderField("Location Status", "location_status")}
      {renderField("Search String", "search_string")}
    </div>
  );

  const renderLocationInfo = () => (
    <div className="poi-tab-content">
      {renderField("Latitude", "latitude", "number")}
      {renderField("Longitude", "longitude", "number")}
      {renderField("City", "city")}
      {renderField("District", "district")}
      {renderField("District Code", "district_code")}
      {renderField("State", "state")}
      {renderField("Country", "country")}
      {renderField("H3 Index", "h3index")}
      {renderField("Google Plus Code", "google_plus_code")}
      {renderField("Google Category Tags", "google_category_tags", "textarea")}
      {renderField("Google Maps URL", "gmaps_url", "textarea")}
    </div>
  );

  const renderAnalyticsInfo = () => (
    <div className="poi-tab-content">
      {renderField("Average Daily Visits", "visits_avg_daily", "number")}
      {renderField("Average Daily Devices", "devices_avg_daily", "number")}
      {renderField("Monthly Devices", "devices_monthly", "number")}
      {renderField(
        "Average Visit Duration",
        "average_visit_duration",
        "number"
      )}
      {renderField(
        "Average Monthly Visitors",
        "average_monthly_visitors",
        "number"
      )}
      {renderField("Population Density", "population_density", "number")}
      {renderField("Population Density Bucket", "population_density_bucket_id")}
      {renderField(
        "Number of POIs in Polygon",
        "number_of_pois_in_polygon",
        "number"
      )}
      {renderField("Placeids Within Count", "placeids_within_count", "number")}
    </div>
  );

  const renderTechnicalInfo = () => (
    <div className="poi-tab-content">
      {renderField("Version", "version")}
      {renderField("Polygon", "polygon", "textarea")}
      {renderField("Polygon Prefix", "polygon_prefix")}
      {renderField("Polygon Area (sqm)", "polygon_area_sqm", "number")}
      {renderField(
        "Polygon Shared/Independent",
        "polygon_shared_or_independent"
      )}
      {renderField("Placeids Within", "placeids_within", "textarea")}
      {renderField(
        "Distance to Building Centroid",
        "distance_between_point_and_building_centroid",
        "number"
      )}
      {renderField(
        "Distance to Building Polygon",
        "distance_between_point_and_building_polygon",
        "number"
      )}
      {renderField("Default K-Ring", "default_kring", "number")}
    </div>
  );

  return (
    <div className="poi-details-panel">
      <div className="poi-details-header">
        <h3>{editedPOI.poi_name || "POI Details"}</h3>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>

      <div className="poi-tabs">
        <button
          className={`poi-tab ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic
        </button>
        <button
          className={`poi-tab ${activeTab === "location" ? "active" : ""}`}
          onClick={() => setActiveTab("location")}
        >
          Location
        </button>
        <button
          className={`poi-tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button
          className={`poi-tab ${activeTab === "technical" ? "active" : ""}`}
          onClick={() => setActiveTab("technical")}
        >
          Technical
        </button>
      </div>

      <div className="poi-details-content">
        {activeTab === "basic" && renderBasicInfo()}
        {activeTab === "location" && renderLocationInfo()}
        {activeTab === "analytics" && renderAnalyticsInfo()}
        {activeTab === "technical" && renderTechnicalInfo()}

        <div className="poi-actions">
          {!isEditing ? (
            <button onClick={handleEdit} className="edit-button">
              Edit POI
            </button>
          ) : (
            <>
              <button onClick={handleSave} className="save-button">
                Save Changes
              </button>
              <button onClick={handleCancel} className="cancel-button">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default POIDetails;
