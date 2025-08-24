import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { wp, hp } from '../utils/responsive';

const RewardedAdIntro = ({ visible, onConfirm, onSkip, rewardInfo }) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Icon name="gift" size={40} color="#FFD700" />
            <Text style={styles.title}>Phần thưởng đặc biệt! 🎁</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              Xem quảng cáo ngắn để nhận phần thưởng đặc biệt!
            </Text>
            
            {rewardInfo && (
              <View style={styles.rewardInfo}>
                <Icon name="star" size={20} color="#FFD700" />
                <Text style={styles.rewardText}>
                  Bạn sẽ nhận được: {rewardInfo.amount} {rewardInfo.type}
                </Text>
              </View>
            )}

            <View style={styles.benefits}>
              <Text style={styles.benefitsTitle}>Lợi ích:</Text>
              <View style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Quảng cáo ngắn gọn</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Phần thưởng ngay lập tức</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Hỗ trợ phát triển app</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Bỏ qua</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.watchButton} onPress={onConfirm}>
              <Icon name="play-circle" size={20} color="#FFFFFF" />
              <Text style={styles.watchButtonText}>Xem quảng cáo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            Bạn có thể bỏ qua bất cứ lúc nào
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: wp('5%'),
    margin: wp('5%'),
    maxWidth: wp('90%'),
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  title: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333333',
    marginTop: hp('1%'),
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  description: {
    fontSize: wp('4%'),
    color: '#666666',
    textAlign: 'center',
    marginBottom: hp('2%'),
    lineHeight: 22,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: 15,
    marginBottom: hp('2%'),
  },
  rewardText: {
    fontSize: wp('4%'),
    color: '#F57C00',
    fontWeight: '600',
    marginLeft: wp('2%'),
  },
  benefits: {
    alignItems: 'flex-start',
    width: '100%',
  },
  benefitsTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#333333',
    marginBottom: hp('1%'),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  benefitText: {
    fontSize: wp('3.5%'),
    color: '#666666',
    marginLeft: wp('2%'),
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: hp('2%'),
  },
  skipButton: {
    flex: 1,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    marginRight: wp('2%'),
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: wp('4%'),
    color: '#666666',
    fontWeight: '600',
  },
  watchButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('2%'),
  },
  watchButtonText: {
    fontSize: wp('4%'),
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: wp('2%'),
  },
  disclaimer: {
    fontSize: wp('3%'),
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default RewardedAdIntro;
