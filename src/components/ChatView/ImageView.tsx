import * as React from 'react';
import {
  Image,
  ImageRequireSource,
  ImageURISource,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

interface Props {
  imageIndex: number;
  images: Array<ImageURISource | ImageRequireSource>;
  onRequestClose: () => void;
  visible: boolean;
}

const ImageView = ({imageIndex, images, onRequestClose, visible}: Props) => {
  const image = images[imageIndex];

  return (
    <Modal
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent
      transparent={false}
      visible={visible}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#000000',
          flex: 1,
          justifyContent: 'center',
        }}>
        {image ? (
          <Image
            accessibilityRole="image"
            resizeMode="contain"
            source={image}
            style={{height: '100%', width: '100%'}}
          />
        ) : null}
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onRequestClose}
          style={{
            alignItems: 'center',
            height: 44,
            justifyContent: 'center',
            position: 'absolute',
            right: 16,
            top: 48,
            width: 44,
          }}>
          <Text style={{color: '#FFFFFF', fontSize: 30, lineHeight: 36}}>
            ✕
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
};

export default ImageView;
