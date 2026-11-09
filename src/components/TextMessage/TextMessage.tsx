import * as React from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {IconButton} from 'react-native-paper';


import {useTheme} from '../../hooks/useTheme';

import {styles} from './styles';
import {MarkdownView} from '../MarkdownView';

import {AgentStep, MessageType} from '../../utils/types';
import {
  getUserName,
  UserContext,
} from '../../utils';
import {visibleStepContent} from '../../utils/chat';

export interface TextMessageProps {
  /**
   * Either a legacy `Text` row, or an `AssistantTurn` row when paired
   * with a `step`. The component reads the author from `message`; `text`
   * is only consulted
   * when `step` is undefined.
   */
  message: MessageType.DerivedText | MessageType.DerivedAssistantTurn;
  messageWidth: number;
  showName: boolean;
  /**
   * When provided, the component renders this step's `content` in
   * place of `message.text`. Set by the AssistantTurn renderer for
   * each step within a turn — same component, per-step content.
   * Reasoning is rendered separately via ReasoningBlock.
   */
  step?: AgentStep;
}

export const TextMessage = ({
  message,
  messageWidth,
  showName,
  step,
}: TextMessageProps) => {
  // For AssistantTurn rendering, `visibleStepContent(step)` is the
  // authoritative source. For legacy `Text` messages, fall back to
  // `message.text`. Reasoning is rendered separately via
  // ReasoningBlock — TextMessage only owns the content side.
  const visibleText: string = step
    ? visibleStepContent(step)
    : 'text' in message
      ? message.text
      : '';
  const theme = useTheme();
  const user = React.useContext(UserContext);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<
    number | null
  >(null);

  const {
    headerText,
    textContainer,
    imageContainer,
    imageThumbnail,
    imageContent,
    imagePreviewModal,
    imagePreviewCloseButton,
    imagePreviewContent,
  } = styles({
    message,
    theme,
    user,
  });

  // Extract imageUris from the message if available
  const imageUris = (message as any).imageUris || [];
  const hasImages = imageUris && imageUris.length > 0;

  const renderPreviewHeader = (header: string) => (
    <Text numberOfLines={1} style={headerText}>
      {header}
    </Text>
  );

  // Render image thumbnails
  const renderImages = () => {
    if (!hasImages) {
      return null;
    }

    return (
      <View style={imageContainer}>
        {imageUris.map((uri: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={imageThumbnail}
            onPress={() => setSelectedImageIndex(index)}>
            <Image source={{uri}} style={imageContent} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render image preview modal
  const renderImagePreview = () => {
    if (selectedImageIndex === null) {
      return null;
    }

    return (
      <Modal
        visible={selectedImageIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImageIndex(null)}>
        <View style={imagePreviewModal}>
          <IconButton
            icon="close"
            size={24}
            iconColor="white"
            style={imagePreviewCloseButton}
            onPress={() => setSelectedImageIndex(null)}
          />
          <Image
            source={{uri: imageUris[selectedImageIndex]}}
            style={imagePreviewContent}
            resizeMode="contain"
          />
        </View>
      </Modal>
    );
  };

  return (
    <>
      <View style={textContainer}>
        {showName ? renderPreviewHeader(getUserName(message.author)) : null}
        {!step && renderImages()}
        <MarkdownView
          markdownText={visibleText.trim()}
          maxMessageWidth={messageWidth}
          selectable={false}
        />
      </View>

      {/* Image preview modal — legacy Text path only. */}
      {!step && renderImagePreview()}
    </>
  );
};
