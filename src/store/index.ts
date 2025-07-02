import { createStore, combineReducers, applyMiddleware } from "redux";
import keplerGlReducer from "@kepler.gl/reducers";
import { taskMiddleware } from "react-palm/tasks";

const rootReducer = combineReducers({ keplerGl: keplerGlReducer });
const store = createStore(rootReducer, {}, applyMiddleware(taskMiddleware));

export type AppState = ReturnType<typeof rootReducer>;
export default store;
