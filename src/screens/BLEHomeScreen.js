import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import {
  KeyboardAvoidingView,
  Text,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native'
import { BleManager, State } from 'react-native-ble-plx';
import { Button, Snackbar, List } from 'react-native-paper'
import { requestLocation, checkLocation } from '../utils/Permissions';

import { showMessage } from '../actions/MessageActions'
class BLEHomeScreen extends React.Component {
  stopper = null;
  constructor() {
    super()
    this.manager = new BleManager()
    this.state = {
      deviceList: [],
      info: "",
      isScaningButton: false,
      isScaningDevices: false,
    }

  }

  onShowMessage(text) {
    this.props.showMessage(text)
  }

  onStopScaning() {
    this.manager.stopDeviceScan();
    this.setState({
      isScaningButton: false,
      isScaningDevices: false
    })
  }

  onCheckLocationPermission() {
    checkLocation().then(grant => {
      if (!grant) {
        requestLocation().then((data) => {
          if (data !== "granted") {
            this.onShowMessage("Location permission is not granted");
          } else {
            this.scanAndConnect();
          }
        })
      } else {
        this.scanAndConnect();
      }
    })
  }

  componentWillMount() {
    this.onCheckLocationPermission();
  }

  startScan() {
    this.manager.state().then((state) => {
      if (state === State.PoweredOff) {
        this.onShowMessage("Bluetooth is turned off");
        this.setState({ isScaningButton: false });
      } else {
        this.scanAndConnect();
      }
    })
  }

  scanAndConnect() {
    this.setState({ isScaningButton: true, isScaningDevices: true, deviceList: [] })
    this.manager.startDeviceScan(null,
      null, (error, device) => {
        //scaning and adding devices
        console.log(device)
        if (error) {
          if (error.errorCode === 101) {
            this.onShowMessage("Provide Location permission");
            this.onCheckLocationPermission();
          } else {
            this.onShowMessage(error.message);
          }
          this.setState({ isScaningButton: false });
          return
        }
        if (device.name === "IoT LED Strip") {
          this.manager.stopDeviceScan();
          this.setState({ deviceList: [], isScaningDevices: false, isScaningButton: false });
          clearTimeout(this.stopper);
          this.props.navigation.navigate("Settings", { device });
        }
        let { deviceList } = this.state;
        let findDevices = deviceList.find((deviceAdded) => deviceAdded.id == device.id);
        if (!findDevices) {
          deviceList.push(device);
          this.setState({ deviceList })
        }

      });

    //After 180 seconds device scaning will stop
    clearTimeout(this.stopper);
    this.stopper = setTimeout(() => {
      this.manager.stopDeviceScan();
      this.setState({ isScaningDevices: false, isScaningButton: false })
    }, 60000);
  }



  ///HANDLERS

  handleOnScanClick = () => {
    if (!this.state.isScaningButton) {
      this.startScan();
    }
  }

  handleOnBLEItemClick = (index) => {
    let { deviceList } = this.state;
    if (index !== null && deviceList[index]) {
      let device = deviceList[index];
      this.onStopScaning();
      this.props.navigation.navigate("Settings", { device });
    }
  }



  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{ flex: 1, backgroundColor: 'white' }}>
          <ScrollView >
            <View>

              <Button
                disabled={this.state.isScaningButton}
                mode='contained'
                loading={this.state.isScaningButton}
                dark
                color={'#AED581'}
                onPress={this.handleOnScanClick}
              >
                Scan Bluetooth devices
        </Button>

              <List.Section>
                {this.state.deviceList.map((device, index) => {
                  return (<List.Item
                    key={index}
                    // style={styles.item}
                    title={device.name ? device.name : device.manufacturerData}
                    description={device.id}
                    // left={() => (<Icon style={styles.icon} name='schedule' size={25} color='#7D7D7D'></Icon>)}
                    onPress={() => this.handleOnBLEItemClick(index)}
                  />)
                })}
              </List.Section>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  const actions = {
    showMessage
  };
  return bindActionCreators(actions, dispatch)
};


export default connect(mapStateToProps, mapDispatchToProps)(BLEHomeScreen)
