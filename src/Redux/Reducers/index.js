import { persistCombineReducers } from "redux-persist";
import storage from "redux-persist/es/storage";

import defaults from "./Defaults";
import receipts from "./Receipts";
import purchase from "./Purchase";
import invoice from "./Invoice";
import whsDefaults from "./WhsDefaults";
import purchaseView from "./PurchaseView";

const config = {
  key: "root",
  storage
};

export default persistCombineReducers(config, {
  defaults,
  receipts,
  purchase,
  invoice,
  whsDefaults,
  purchaseView
});
