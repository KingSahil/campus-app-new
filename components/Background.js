import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function Background() {
  return (
    <View style={styles.container}>
      <View style={styles.baseBackground} />
      <Svg height="100%" width="100%" style={styles.svg}>
        <Defs>
          <RadialGradient
            id="grad1"
            cx="50%"
            cy="200"
            rx="500"
            ry="500"
            fx="50%"
            fy="200"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0.2" stopColor="#3e3391" stopOpacity="0.3" />
            <Stop offset="0.4" stopColor="#1b215c" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#1b215c" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="grad2"
            cx="50%"
            cy="800"
            rx="500"
            ry="500"
            fx="50%"
            fy="800"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0.2" stopColor="#39629e" stopOpacity="0.3" />
            <Stop offset="0.4" stopColor="#182352" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#182352" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  baseBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020412', // Very dark blue base
  },
  svg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  }
});
