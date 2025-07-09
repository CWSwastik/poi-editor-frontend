import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

interface POIData {
  id: number;
  poi_name: string;
  poi_type: string;
  poi_type_list: string;
  poi_code_secondary: string;
  poi_code_old: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  district_code: string;
  state: string;
  country: string;
  h3index: string;
  google_plus_code: string;
  google_category_tags: string;
  gmaps_url: string;
  brands: string;
  location_status: string;
  polygon: string;
  polygon_prefix: string;
  polygon_area_sqm: number;
  polygon_shared_or_independent: string;
  population_density: number;
  population_density_bucket_id: string;
  number_of_pois_in_polygon: number;
  placeids_within: string;
  placeids_within_count: number;
  distance_between_point_and_building_centroid: number;
  distance_between_point_and_building_polygon: number;
  default_kring: number;
  visits_avg_daily: number;
  devices_avg_daily: number;
  devices_monthly: number;
  average_visit_duration: number;
  average_monthly_visitors: number;
  version: string;
  search_string: string;
}

interface POIDetailsProps {
  poisData: POIData[];
  onUpdate: (updatedPOI: POIData) => void;
  onClose: () => void;
}

const POIDetails: React.FC<POIDetailsProps> = ({ poisData, onUpdate, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPOI, setEditedPOI] = useState<POIData | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POIData | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'analytics' | 'technical'>('basic');

  const clickedFeature = useSelector(
    (state: RootState) => state.keplerGl.map?.visState?.clicked
  );

  useEffect(() => {
    if (clickedFeature && poisData.length > 0) {
      const { index } = clickedFeature;
      
      if (index >= 0 && index < poisData.length) {
        const poi = poisData[index];
        setSelectedPOI(poi);
        setEditedPOI(poi);
        setIsEditing(false);
      }
    }
  }, [clickedFeature, poisData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedPOI) {
      onUpdate(editedPOI);
      setSelectedPOI(editedPOI);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedPOI(selectedPOI);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof POIData, value: string | number) => {
    if (editedPOI) {
      setEditedPOI({
        ...editedPOI,
        [field]: value
      });
    }
  };

  const renderField = (label: string, field: keyof POIData, type: 'string' | 'number' | 'textarea' = 'string', readonly = false) => {
    const value = isEditing ? editedPOI?.[field] : selectedPOI?.[field];
    
    return (
      <div className="poi-field">
        <label>{label}:</label>
        {!isEditing ? (
          <span>{value?.toString() || 'N/A'}</span>
        ) : readonly ? (
          <input
            type="text"
            value={value?.toString() || ''}
            disabled
            className="poi-input disabled"
          />
        ) : type === 'textarea' ? (
          <textarea
            value={value?.toString() || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="poi-textarea"
            rows={2}
          />
        ) : (
          <input
            type={type === 'number' ? 'number' : 'text'}
            step={type === 'number' ? 'any' : undefined}
            value={value?.toString() || ''}
            onChange={(e) => handleInputChange(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            className="poi-input"
          />
        )}
      </div>
    );
  };

  const renderBasicInfo = () => (
    <div className="poi-tab-content">
      {renderField('POI ID', 'id', 'number', true)}
      {renderField('POI Name', 'poi_name')}
      {renderField('POI Type', 'poi_type')}
      {renderField('POI Type List', 'poi_type_list', 'textarea')}
      {renderField('Secondary Code', 'poi_code_secondary')}
      {renderField('Old Code', 'poi_code_old')}
      {renderField('Address', 'address', 'textarea')}
      {renderField('Brands', 'brands')}
      {renderField('Location Status', 'location_status')}
      {renderField('Search String', 'search_string')}
    </div>
  );

  const renderLocationInfo = () => (
    <div className="poi-tab-content">
      {renderField('Latitude', 'latitude', 'number')}
      {renderField('Longitude', 'longitude', 'number')}
      {renderField('City', 'city')}
      {renderField('District', 'district')}
      {renderField('District Code', 'district_code')}
      {renderField('State', 'state')}
      {renderField('Country', 'country')}
      {renderField('H3 Index', 'h3index')}
      {renderField('Google Plus Code', 'google_plus_code')}
      {renderField('Google Category Tags', 'google_category_tags', 'textarea')}
      {renderField('Google Maps URL', 'gmaps_url', 'textarea')}
    </div>
  );

  const renderAnalyticsInfo = () => (
    <div className="poi-tab-content">
      {renderField('Average Daily Visits', 'visits_avg_daily', 'number')}
      {renderField('Average Daily Devices', 'devices_avg_daily', 'number')}
      {renderField('Monthly Devices', 'devices_monthly', 'number')}
      {renderField('Average Visit Duration', 'average_visit_duration', 'number')}
      {renderField('Average Monthly Visitors', 'average_monthly_visitors', 'number')}
      {renderField('Population Density', 'population_density', 'number')}
      {renderField('Population Density Bucket', 'population_density_bucket_id')}
      {renderField('Number of POIs in Polygon', 'number_of_pois_in_polygon', 'number')}
      {renderField('Placeids Within Count', 'placeids_within_count', 'number')}
    </div>
  );

  const renderTechnicalInfo = () => (
    <div className="poi-tab-content">
      {renderField('Version', 'version')}
      {renderField('Polygon', 'polygon', 'textarea')}
      {renderField('Polygon Prefix', 'polygon_prefix')}
      {renderField('Polygon Area (sqm)', 'polygon_area_sqm', 'number')}
      {renderField('Polygon Shared/Independent', 'polygon_shared_or_independent')}
      {renderField('Placeids Within', 'placeids_within', 'textarea')}
      {renderField('Distance to Building Centroid', 'distance_between_point_and_building_centroid', 'number')}
      {renderField('Distance to Building Polygon', 'distance_between_point_and_building_polygon', 'number')}
      {renderField('Default K-Ring', 'default_kring', 'number')}
    </div>
  );

  if (!selectedPOI) {
    return null;
  }

  return (
    <div className="poi-details-panel">
      <div className="poi-details-header">
        <h3>{selectedPOI.poi_name || 'POI Details'}</h3>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>

      <div className="poi-tabs">
        <button
          className={`poi-tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic
        </button>
        <button
          className={`poi-tab ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          Location
        </button>
        <button
          className={`poi-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`poi-tab ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          Technical
        </button>
      </div>

      <div className="poi-details-content">
        {activeTab === 'basic' && renderBasicInfo()}
        {activeTab === 'location' && renderLocationInfo()}
        {activeTab === 'analytics' && renderAnalyticsInfo()}
        {activeTab === 'technical' && renderTechnicalInfo()}
        
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