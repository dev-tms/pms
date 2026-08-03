import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';
import { sessionService, sessionReducer } from "redux-react-session";

// import profile from '../reducers/profile';
const middlewares = [thunk];
const initialState = {};

const rootReducer = combineReducers({
  session: sessionReducer
});

/* const configureStore = () => {
  return createStore(
    profile,
    initialState,
    compose(applyMiddleware(thunk))
  );
}; */
const store = createStore(
  rootReducer,
  initialState,
  compose(applyMiddleware(...middlewares))
);
sessionService.initSessionService(store);

export default store;
