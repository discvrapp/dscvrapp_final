import React from 'react';
import { Image } from 'react-native';

const DscvrLogo = ({ size = 24 }) => {
  return (
    <Image 
      source={require('../assets/images/dscvr-logo.png')} 
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
};

export default DscvrLogo;
