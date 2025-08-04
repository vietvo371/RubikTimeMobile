import { Dimensions, PixelRatio } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export const widthPercentageToDP = (widthPercent) => {
    const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel(screenWidth * elemWidth / 100);
};

export const heightPercentageToDP = (heightPercent) => {
    const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel(screenHeight * elemHeight / 100);
};

export const normalizeFont = (size) => {
    const scale = screenWidth / 320; // Giả sử 320 là kích thước chuẩn
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}; 