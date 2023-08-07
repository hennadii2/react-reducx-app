import logo from './logo.svg';
import './App.css';

//redux import
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import { persistor, store } from './Redux/Store'

//component import
import Commissions from './Components/Commissions'

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <div className="App">
          <Commissions />
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
