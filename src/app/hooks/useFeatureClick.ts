import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface UseFeatureClickProps {
  onFeatureClick?: (index: number) => void;
  showAlert?: boolean;
}

const useFeatureClick = (props: UseFeatureClickProps = {}) => {
  const { onFeatureClick, showAlert = false } = props;
  const clickedFeature = useSelector(
    (state: RootState) => state.keplerGl.map?.visState?.clicked
  );

  useEffect(() => {
    console.log("useEffect triggered, clickedFeature:", clickedFeature);
    
    if (clickedFeature) {
      console.log("clickedFeature exists:", clickedFeature);
      
      // The index is directly on the clickedFeature object, not nested in picked.object
      const { index } = clickedFeature;
      console.log("POI index:", index);
      
      if (showAlert) {
        alert(`Index: ${index}`);
      }
      
      // Call the callback function if provided
      if (onFeatureClick) {
        onFeatureClick(index);
      }
    } else {
      console.log("No clickedFeature");
    }
  }, [clickedFeature, onFeatureClick, showAlert]);

  return {
    clickedFeature,
    clickedIndex: clickedFeature?.index || null
  };
};

export default useFeatureClick;