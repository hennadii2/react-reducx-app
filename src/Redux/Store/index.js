import { applyMiddleware,  createStore } from "redux";
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import createSagaMiddleware from 'redux-saga'

//import from custom functions
import rootSaga from "../Sagas"
import rootReducer from "../Reducers"

const logger = createLogger({ collapsed: true })
const persistConfig = {
    key: 'root',
    storage,
}
const persistedReducer = persistReducer(persistConfig, rootReducer)

const sagaMiddleware = createSagaMiddleware()
const getMiddleware = () => {
    if (process.env.NODE_ENV === 'development') {
        return applyMiddleware(sagaMiddleware, logger);
    }
    return applyMiddleware(sagaMiddleware);
};

const store = createStore(
    persistedReducer,
    getMiddleware(),
);

sagaMiddleware.run(rootSaga)
const persistor = persistStore(store)
export {
    store,
    persistor
}