import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useAppStore } from '../../store/useAppStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CommentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string | null;
}

export const CommentBottomSheet: React.FC<CommentBottomSheetProps> = ({
  visible,
  onClose,
  postId,
}) => {
  const { comments, loading, fetchComments, addComment } = useCommunityStore();
  const { user, token } = useAppStore();
  const [commentText, setCommentText] = useState('');
  
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: SCREEN_HEIGHT,
    duration: 300,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SCREEN_HEIGHT / 4 || gestureState.vy > 0.5) {
          closeAnim.start(onClose);
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible && postId) {
      fetchComments(postId);
      resetPositionAnim.start();
    } else {
      closeAnim.start();
    }
  }, [visible, postId]);

  const handleSend = async () => {
    if (commentText.trim() && postId && token) {
      const text = commentText.trim();
      setCommentText('');
      await addComment(postId, text, token);
    }
  };

  if (!postId) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: panY }] },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.handleContainer}>
            <View style={styles.handle} />
            <Text style={styles.title}>Comments</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image source={{ uri: comment.userAvatar || comment.avatar }} style={styles.avatar} />
                  <View style={styles.commentBody}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.userName}>{comment.userName || comment.author}</Text>
                      <Text style={styles.timeAgo}>{comment.timeAgo || comment.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                  <TouchableOpacity style={styles.commentLike}>
                    <MaterialDesignIcons name="heart-outline" size={16} color={COLORS.textLight} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialDesignIcons name="comment-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyText}>No comments yet</Text>
              </View>
            )}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View style={styles.inputArea}>
              <Image source={{ uri: user?.avatar }} style={styles.userAvatar} />
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor={COLORS.textLight}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!commentText.trim()}
                style={styles.sendBtn}
              >
                <Text style={[
                  styles.sendText,
                  !commentText.trim() && { color: COLORS.border }
                ]}>Post</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    height: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    ...SHADOWS.large,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.md,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  commentLike: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.textLight,
    fontSize: 14,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '40',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendBtn: {
    marginLeft: SPACING.md,
  },
  sendText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
