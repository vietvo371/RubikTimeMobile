import { Dimensions, PixelRatio } from 'react-native';
import {
    widthPercentageToDP as wpOriginal,
    heightPercentageToDP as hpOriginal,
} from 'react-native-responsive-screen';

// Lấy kích thước màn hình
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Wrapper functions để có thể thêm logic nếu cần
export const wp = (percentage) => {
    return wpOriginal(percentage);
};

export const hp = (percentage) => {
    return hpOriginal(percentage);
};

// Function để normalize font size
export const normalize = (size) => {
    const scale = screenWidth / 320; // Giả sử 320 là kích thước chuẩn
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Function để lấy kích thước màn hình
export const getScreenDimensions = () => {
    return {
        width: screenWidth,
        height: screenHeight,
    };
};

// Function để kiểm tra orientation
export const isPortrait = () => {
    return screenHeight > screenWidth;
};

export const isLandscape = () => {
    return screenWidth > screenHeight;
}; 