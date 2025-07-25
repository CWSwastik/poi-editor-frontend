import React, { useState, useEffect, useCallback } from "react";
import { POIData } from "@/types/POIData";

interface POIDetailsProps {
  poi: POIData;
  onUpdate: (updatedPOI: POIData) => void;
  onClose: () => void;
}

interface ImageData {
  id: number;
  image_base64: string;
  filename?: string;
  upload_date?: string;
}

const POIDetails: React.FC<POIDetailsProps> = ({ poi, onUpdate, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPOI, setEditedPOI] = useState<POIData>(poi);
  const [openSection, setOpenSection] = useState<string | null>("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Photo-related state
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setEditedPOI(poi);
    setIsEditing(false);
    setOpenSection("basic");
    setError(null);
    setHasUnsavedChanges(false);
    // Load images when POI changes
    loadImages();
  }, [poi]);

  const loadImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pois/${poi.id}/images`,
        {
          headers: {
            "Ngrok-Skip-Browser-Warning": "1",
          },
        }
      );
      if (response.ok) {
        const imageData = await response.json();
        setImages(imageData);
      } else {
        console.error("Failed to load images");
        setImages([]);
      }
    } catch (err) {
      console.error("Error loading images:", err);
      setImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of files) {
        // Check file type
        if (!file.type.startsWith("image/")) {
          setUploadError("Please select only image files");
          continue;
        }

        // Check file size (optional, e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError("File size must be less than 5MB");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pois/${poi.id}/upload_image`,
          {
            method: "POST",
            body: formData,
            headers: {
              "Ngrok-Skip-Browser-Warning": "1",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to upload ${file.name}: ${errorText}`);
        }
      }

      // Reload images after successful upload
      await loadImages();

      // Clear the file input
      event.target.value = "";
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload image"
      );
      console.error("Error uploading image:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
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
      poi_type_list: data.poi_type_list
        ? typeof data.poi_type_list === "string"
          ? data.poi_type_list.split(",").map((s) => s.trim())
          : data.poi_type_list
        : [],
      poi_type: data.poi_type || "",
      poi_name: data.poi_name || "",
      poi_code_secondary: data.poi_code_secondary || "",
      poi_code_old: data.poi_code_old || "",
      placeids_within_count: data.placeids_within_count || 0,
      placeids_within: data.placeids_within
        ? typeof data.placeids_within === "string"
          ? data.placeids_within.split(",").map((s) => s.trim())
          : data.placeids_within
        : [],
      number_of_pois_in_polygon: data.number_of_pois_in_polygon || 0,
      longitude: data.longitude || 0,
      location_status: data.location_status || "",
      latitude: data.latitude || 0,
      h3index: data.h3index || "",
      google_plus_code: data.google_plus_code || "",
      google_category_tags: data.google_category_tags
        ? typeof data.google_category_tags === "string"
          ? data.google_category_tags.split(",").map((s) => s.trim())
          : data.google_category_tags
        : [],
      gmaps_url: data.gmaps_url || "",
      district_code: data.district_code || "",
      district: data.district || "",
      distance_between_point_and_building_polygon:
        data.distance_between_point_and_building_polygon || 0,
      distance_between_point_and_building_centroid:
        data.distance_between_point_and_building_centroid || 0,
      devices_monthly: data.devices_monthly || 0,
      devices_avg_daily: data.devices_avg_daily || 0,
      default_kring: data.default_kring || 0,
      country: data.country || "",
      city: data.city || "",
      brands: data.brands || "",
      average_visit_duration: data.average_visit_duration || 0,
      average_monthly_visitors: data.average_monthly_visitors || 0,
      address: data.address || "",
    };
  };

  // Removed debounced save - using manual save instead

  const handleCancel = () => {
    setEditedPOI(poi);
    setIsEditing(false);
    setError(null);
    setHasUnsavedChanges(false);
    // Reset the parent component back to original POI data
    onUpdate(poi);
  };

  const handleInputChange = (field: keyof POIData, value: string | number) => {
    const updatedPOI = { ...editedPOI, [field]: value };
    setEditedPOI(updatedPOI);
    setHasUnsavedChanges(true);

    // Immediately update the parent component for UI reflection
    onUpdate(updatedPOI);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const apiData = transformDataForAPI(editedPOI);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pois/${poi.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Ngrok-Skip-Browser-Warning": "1",
          },
          body: JSON.stringify(apiData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const updatedData = await response.json();

      // Update the local state with the response data
      setEditedPOI(updatedData);
      onUpdate(updatedData);
      setHasUnsavedChanges(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while saving"
      );
      console.error("Error saving POI:", err);
    } finally {
      setIsSaving(false);
    }
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
          <div className="text-gray-100 break-words text-sm md:text-base">
            {String(value ?? "N/A")}
          </div>
        ) : readOnly ? (
          <input
            type="text"
            value={String(value)}
            disabled
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 text-sm md:text-base"
          />
        ) : type === "textarea" ? (
          <textarea
            value={String(value ?? "")}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 resize-none text-sm md:text-base"
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
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 text-sm md:text-base"
          />
        )}
      </div>
    );
  };

  const renderPhotosSection = () => {
    return (
      <div className="mb-4 border border-gray-600 rounded">
        <button
          onClick={() => toggleSection("photos")}
          className="w-full text-left px-3 md:px-4 py-3 bg-gray-700 hover:bg-gray-600 font-semibold flex justify-between items-center text-gray-100 text-sm md:text-base"
        >
          <span>Photos ({images.length})</span>
          <span>{openSection === "photos" ? "▲" : "▼"}</span>
        </button>
        {openSection === "photos" && (
          <div className="p-3 md:p-4 bg-gray-800">
            {/* Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add Images
              </label>
              <div className="flex flex-col space-y-2">
                {/* Gallery Upload */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {/* Camera Capture */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                  title="Take Photo"
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">
                First input: Select from gallery | Second input: Take photo with
                camera
              </div>
              {isUploading && (
                <p className="text-blue-400 text-sm mt-2">Uploading...</p>
              )}
              {uploadError && (
                <p className="text-red-400 text-sm mt-2 break-words">
                  {uploadError}
                </p>
              )}
            </div>

            {/* Images Display */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                Current Images
              </h4>
              {isLoadingImages ? (
                <p className="text-gray-400">Loading images...</p>
              ) : images.length === 0 ? (
                <p className="text-gray-400">No images uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {images.map((image, index) => (
                    <div key={image.id || index} className="relative group">
                      <img
                        src={image.image_base64}
                        crossOrigin="anonymous"
                        alt={image.filename || `Image ${index + 1}`}
                        className="w-full h-24 sm:h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadImages}
              disabled={isLoadingImages}
              className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {isLoadingImages ? "Loading..." : "Refresh Images"}
            </button>
          </div>
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
        renderField(
          "Average Visit Duration",
          "average_visit_duration",
          "number"
        ),
        renderField(
          "Average Monthly Visitors",
          "average_monthly_visitors",
          "number"
        ),
        renderField("Population Density", "population_density", "number"),
        renderField(
          "Population Density Bucket",
          "population_density_bucket_id"
        ),
        renderField(
          "Number of POIs in Polygon",
          "number_of_pois_in_polygon",
          "number"
        ),
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
        renderField(
          "Polygon Shared/Independent",
          "polygon_shared_or_independent"
        ),
        renderField("Placeids Within", "placeids_within", "textarea"),
        renderField(
          "Distance to Building Centroid",
          "distance_between_point_and_building_centroid",
          "number"
        ),
        renderField(
          "Distance to Building Polygon",
          "distance_between_point_and_building_polygon",
          "number"
        ),
        renderField("Default K-Ring", "default_kring", "number"),
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-50 md:items-center "
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl overflow-y-auto max-h-[90vh] bg-gray-800 shadow-xl rounded-lg">
        {/* Header - Fixed */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-600 p-4 md:p-6 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg md:text-xl font-semibold text-gray-100 truncate pr-4">
              {editedPOI.poi_name || "POI Details"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 text-xl md:text-2xl font-bold min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Status indicators */}
          {isEditing && (
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              {hasUnsavedChanges && (
                <div className="flex items-center text-yellow-400 text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 flex-shrink-0"></div>
                  <span>Unsaved changes</span>
                </div>
              )}
              {error && (
                <div className="flex items-start text-red-400 text-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-1 flex-shrink-0"></div>
                  <span className="break-words">Error: {error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-4 md:p-6 pb-20">
          {/* Photos Section - Added first */}
          {renderPhotosSection()}

          {/* Existing sections */}
          {sections.map((section) => (
            <div
              key={section.key}
              className="mb-4 border border-gray-600 rounded"
            >
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full text-left px-3 md:px-4 py-3 bg-gray-700 hover:bg-gray-600 font-semibold flex justify-between items-center text-gray-100 text-sm md:text-base"
              >
                <span className="truncate pr-2">{section.title}</span>
                <span className="flex-shrink-0">
                  {openSection === section.key ? "▲" : "▼"}
                </span>
              </button>
              {openSection === section.key && (
                <div className="p-3 md:p-4 bg-gray-800">{section.fields}</div>
              )}
            </div>
          ))}
        </div>

        {/* Footer - Fixed */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-600 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm md:text-base"
              >
                Edit POI
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`w-full sm:w-auto px-4 py-2 text-white rounded text-sm md:text-base ${
                    isSaving
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POIDetails;
