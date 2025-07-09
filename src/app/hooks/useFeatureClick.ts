import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const useFeatureClick = () => {
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
      alert(`Index: ${index}`);
    } else {
      console.log("No clickedFeature");
    }
  }, [clickedFeature]);
};

export default useFeatureClick;