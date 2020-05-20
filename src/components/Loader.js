import React from 'react';
import { ActivityIndicator } from 'react-native';


class Loader extends React.Component {
    render() {
        return (
            <ActivityIndicator style={styles.loader} size='large'  />
        )
    }
}

const styles = {
    loader: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        flex: 1,
        backgroundColor: 'rgba(52, 52, 52, 0.15)'
    }
}

export default (Loader)