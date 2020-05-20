import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import BLEHomeScreen from './screens/BLEHomeScreen';
import BLESettingsScreen from './screens/BLESettingsScreen';
import { hideMessage, showMessage } from './actions/MessageActions'
import { Snackbar } from 'react-native-paper';

const AppNavigator = createStackNavigator(
  {
    Home: BLEHomeScreen,
    Settings: BLESettingsScreen,
  },
  {
    initialRouteName: "Home",
    headerMode: 'none'

  }
);
const BLEApp = createAppContainer(AppNavigator)

class App extends React.Component {

  render() {
    return (
      <>
        <BLEApp />
        <Snackbar
          duration={2000}
          visible={this.props.isMessageShown}
          onDismiss={() => this.props.hideMessage()}
        >
          {this.props.messageText}
        </Snackbar>
      </>
    )
  }

}

const mapStateToProps = (state: any) => {
  return {
    isMessageShown: state.message.isMessageShown,
    messageText: state.message.messageText
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  const actions = {
    hideMessage,
    showMessage
  };
  return bindActionCreators(actions, dispatch)
};

export default connect(mapStateToProps, mapDispatchToProps)(App)