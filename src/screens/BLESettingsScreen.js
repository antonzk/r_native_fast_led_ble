import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { showMessage } from '../actions/MessageActions'
import {
  BackHandler,
  KeyboardAvoidingView,
  Text,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'
import { BleManager, State, Device } from 'react-native-ble-plx';
import { Button, List, Paragraph, Switch } from 'react-native-paper'
import { Dropdown } from 'react-native-material-dropdown'
import Icon from 'react-native-vector-icons/MaterialIcons'
import BLE from '../../constants/BLE'
import BluetoothMessages from '../utils/BluetoothMessages'
import Loader from '../components/Loader'

class BLESettingsScreen extends React.Component {


  constructor(props) {
    super(props)
    this.state = {
      device: this.props.navigation.getParam('device', null),
      deviceInfo: '',

      //led strip state
      isConnected: false,
      modes: [
        { value: "Pride" },
        { value: "Color Waves" },

        // // twinkle patterns
        { value: "Rainbow Twinkles" },
        { value: "Snow Twinkles" },
        { value: "Cloud Twinkles" },
        { value: "Incandescent Twinkles" },

        // // TwinkleFOX patterns
        { value: "Retro C9 Twinkles" },
        { value: "Red & White Twinkles" },
        { value: "Blue & White Twinkles" },
        { value: "Red, Green & White Twinkles" },
        { value: "Fairy Light Twinkles" },
        { value: "Snow 2 Twinkles" },
        { value: "Holly Twinkles" },
        { value: "Ice Twinkles" },
        { value: "Party Twinkles" },
        { value: "Forest Twinkles" },
        { value: "Lava Twinkles" },
        { value: "Fire Twinkles" },
        { value: "Cloud 2 Twinkles" },
        { value: "Ocean Twinkles" },

        { value: "Rainbow" },
        { value: "Rainbow With Glitter" },
        { value: "Solid Rainbow" },
        { value: "Confetti" },
        { value: "Sinelon" },
        { value: "Beat" },
        { value: "Juggle" },
        { value: "Fire" },
        { value: "Water" },

        { value: "Solid Color" }
      ],
      chosenMode: 0,
      ledStripNumOfLeds: 0,
      ledStripIsTurnedOn: null,
      ledStripMode: 'Mode 1',
      isColapsed: true
    }
  }

  componentWillMount() {
    const { device } = this.state;
    if (device && device instanceof Device) {
      device.connect()
        .then((device) => {
          this.onShowMessage("Discovering services and characteristics")
          return device.discoverAllServicesAndCharacteristics()
        })
        .then((device) => {
          this.onShowMessage("Setting notifications")
          //TODO
          // setInterval(() => {
          //   this.state.device.readRSSI().then((device) => {
          //     console.log(device);
          //   });
          // }, 5000)
          return this.setupNotifications(device)
        })
        .then(() => {
          this.setState({ isConnected: true, isColapsed: false });
          this.onShowMessage("Listening...")
        }, (error) => {
          this.handleError(error)
        })
    } else {
      this.props.navigation.navigate("Home", { error: 'Can\'t connect to device' });
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton.bind(this));
  }

  //Handlers

  handleError = (error, errorMessage) => {
    if (error.errorCode === 201) {//device was disconnected
      this.onShowMessage(errorMessage || error.message);
      this.props.navigation.navigate('Home');
    }
  }

  handleBackButton = () => {
    if (this.state.device) {
      this.state.device.cancelConnection().then((device) => {
        this.props.navigation.navigate('Home');
      }, (error) => {
        this.onShowMessage('Can\'t disconnect device. ');
      })
    }
  };

  handleModeChange = (data: any) => {
    const { device } = this.state
    if (device) {
      const { chosenMode } = this.state;
      if (data !== chosenMode) {
        device.writeCharacteristicWithResponseForService(
          BLE.serviceUUID,
          BLE.characteristicModeUUID,
          BluetoothMessages.toBase64(data.toString())
        ).then((data) => {
          console.log(data);
        })
          .catch(error => {
            this.handleError(error);
          })
      }
    }
  }

  handleOnOffChange = () => {
    const { device } = this.state
    if (device) {
      const { ledStripIsTurnedOn } = this.state;
      device.writeCharacteristicWithResponseForService(
        BLE.serviceUUID,
        BLE.characteristicTurnOnOffUUID,
        BluetoothMessages.toBase64(ledStripIsTurnedOn === 'true' ? 'false' : 'true')
      ).then((data) => {
        console.log(data);
      })
        .catch(error => {
          this.handleError(error);
        })
    }
  }

  /////////////////

  onShowMessage(text) {
    this.setState({ deviceInfo: text })
    this.props.showMessage(text)
  }

  onBLEError(errorCode) {
    switch (errorCode) {
      case 201: {
        this.props.navigation.navigate('Home', { error: 'Disconnected from device' });
      }
    }
  }


  async setupNotifications(device) {
    //monitor turned on/off characteristic
    device.readCharacteristicForService(BLE.serviceUUID, BLE.characteristicLEDNumUUID).then((characteristic) => {
      if (characteristic) {
        let value = BluetoothMessages.fromBase64(characteristic.value)
        this.setState({ ledStripNumOfLeds: value })
      }
    }, (error) => {
      this.handleError(error, 'Can\'t read numbers of LEDs in strip')
    }
    )

    device.readCharacteristicForService(BLE.serviceUUID, BLE.characteristicModeUUID).then((characteristic) => {
      let value = 0;
      try {
        value = parseInt(BluetoothMessages.fromBase64(characteristic.value))
      } catch{ }
      this.setState({ chosenMode: value, ledStripMode: this.state.modes[value].value })
    })

    // device.readCharacteristicForService(BLE.serviceUUID, BLE.characteristicTurnOnOffUUID).then((characteristic) => {
    //   this.setState({ ledStripIsTurnedOn: BluetoothMessages.fromBase64(characteristic.value) })
    // })

    device.monitorCharacteristicForService(BLE.serviceUUID, BLE.characteristicTurnOnOffUUID, (error, characteristic) => {
      if (error) {
        this.handleError(error)
        return
      }
      if (this.state.ledStripIsTurnedOn == null || this.state.ledStripIsTurnedOn !== BluetoothMessages.fromBase64(characteristic.value)) {
        this.setState({ ledStripIsTurnedOn: BluetoothMessages.fromBase64(characteristic.value) })
      }
    })

  }


  renderLeftItem(name, color) {
    return (<View style={styles.leftContainer}>{this.renderIcon(name, color)}</View>);
  }

  renderIcon(name, color) {
    return (
      <Icon
        name={name}
        size={25}
        color={color || '#7D7D7D'} />
    )
  }


  render() {
    const { device, deviceInfo, ledStripNumOfLeds, ledStripIsTurnedOn, ledStripMode } = this.state;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{ flex: 1, backgroundColor: 'white' }}>
          <ScrollView >
            <View >
              <List.Section>
                <List.Accordion
                  title={<List.Subheader>CONNECTION INFO</List.Subheader>}
                  // left={props => <List.Icon {...props} icon="folder" />}
                  expanded={this.state.isColapsed}
                  onPress={() => { this.setState({ isColapsed: !this.state.isColapsed }) }}
                >
                  <List.Item
                    title='Device name'
                    description={device.name}
                    style={styles.itemStyles}
                    left={() => this.renderLeftItem('bluetooth')}
                  />

                  <List.Item
                    title='Device ID'
                    description={device.id}
                    left={() => this.renderLeftItem('phonelink-setup')}
                    style={styles.itemStyles}
                  />
                  <List.Item
                    title='Device RSSI'
                    description={device.rssi}
                    left={() => this.renderLeftItem('signal-wifi-4-bar')}
                    style={styles.itemStyles}
                  />
                  <List.Item
                    title='Device status'
                    description={deviceInfo}
                    left={() => this.renderLeftItem('receipt')}
                    style={styles.itemStyles}
                  />
                </List.Accordion>
              </List.Section>

            </View>
            <View>
              <List.Section>
                <List.Subheader>LED STRIP</List.Subheader>
                <List.Item
                  title="Number of leds"
                  description={ledStripNumOfLeds}
                  style={styles.itemStyles}
                  left={() => this.renderLeftItem('blur-on')}
                />
                <List.Item
                  title={`Turned ${ledStripIsTurnedOn === 'true' ? 'On' : 'Off'}`}
                  left={() => this.renderLeftItem('assignment-ind')}
                  style={styles.itemStyles}
                  right={() => (<Switch value={ledStripIsTurnedOn === 'true'} onValueChange={() => { }} />)}
                  onPress={() => this.handleOnOffChange()}
                />
              </List.Section>
              <List.Section >
                <View style={styles.itemLayout}>
                  <View style={styles.icon}>
                    <Icon name={'assignment-ind'} size={25} color='#7D7D7D' />
                  </View>
                  <Dropdown
                    animationDuration={50}
                    rippleDuration={150}
                    label={'Chosen mode'}
                    containerStyle={styles.dropDown}
                    inputContainerStyle={styles.inputDropDown}
                    useNativeDriver={false}
                    value={ledStripMode}
                    data={this.state.modes}
                    onChangeText={(_, idx, data) => this.handleModeChange(idx)} />
                </View>
              </List.Section>
            </View>
            {!this.state.isConnected && <Loader />}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  itemStyles: {
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
  },
  leftContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 11,
    paddingRight: 11,
  },
  itemLayout: {
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9'
  },
  icon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    paddingTop: 16,
    paddingRight: 5
  },
  dropDown: {
    // paddingLeft: 10,
    flex: 1
  },
  inputDropDown: {
    borderBottomColor: 'transparent',
    marginLeft: 10
  },
})

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


export default connect(mapStateToProps, mapDispatchToProps)(BLESettingsScreen)