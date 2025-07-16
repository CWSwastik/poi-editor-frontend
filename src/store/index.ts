import { createStore, combineReducers, applyMiddleware } from "redux";
import keplerGlReducer from "@kepler.gl/reducers";
import { taskMiddleware } from "react-palm/tasks";
import { createLogger } from "redux-logger";
import { KeplerGlState } from "@kepler.gl/reducers";

/* initial state */
const rootReducer = combineReducers({
  keplerGl: keplerGlReducer.initialState({
    uiState: {
      activeSidePanel: null,
      currentModal: null,
      readOnly: false,
      mapControls: {
        visibleLayers: { show: false },
        mapLegend: { show: false },
        toggle3d: { show: false },
        splitMap: { show: false },
      },
    },
  }),
});

const logger = createLogger({
  collapsed: true,
});

const store = createStore(
  rootReducer,
  {},
  applyMiddleware(taskMiddleware, logger)
);

export interface RootState {
  keplerGl: KeplerGlState;
}

export default store;
