import React from 'react'
import { AppRegistry, NativeModules, Platform } from 'react-native';
// import BLEHomeScreen from './src/screens/BLEHomeScreen';
import App from './src/App';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './src/reducers'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

const middleware = applyMiddleware(thunk);
const store = createStore(reducers, middleware);

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#009ee0',
    accent: '#009ee0',
  }
};
class AppContainer extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <PaperProvider theme={theme}>
          <App />
        </PaperProvider>
      </Provider>
    );
  }
}


AppRegistry.registerComponent('Led_Strip_Bluetooth', () => (AppContainer));