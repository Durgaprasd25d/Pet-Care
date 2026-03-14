import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { Post } from '../../types';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Avatar } from '../ui/Avatar';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
  FadeInDown,
  runOnJS
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onUserPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  index?: number;
  currentUserId?: string;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onPress, 
  onUserPress, 
  onLikePress, 
  onCommentPress, 
  onSharePress,
  index = 0,
  currentUserId
}) => {
  const user = useAppStore(state => state.user);
  const userId = currentUserId || user?.id || (user as any)?._id;
  const isLiked = userId && post.likedBy?.includes(userId);
  
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
      position: 'absolute',
      zIndex: -1,
    };
  });

  const handleLike = () => {
    scale.value = withSequence(
      withSpring(1.5, { damping: 4, stiffness: 150 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    if (!isLiked) {
      pulseScale.value = 1;
      pulseOpacity.value = 0.5;
      pulseScale.value = withTiming(2.5, { duration: 400 });
      pulseOpacity.value = withTiming(0, { duration: 400 });
    }

    onLikePress?.();
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(600)}
      style={styles.card}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onUserPress} activeOpacity={0.7}>
          <Avatar source={{ uri: post.userAvatar }} size={44} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerInfo} onPress={onUserPress} activeOpacity={0.7}>
          <Text style={styles.userName}>{post.userName}</Text>
          <View style={styles.timeLocationRow}>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
            {post.location && (
              <>
                <Text style={styles.dot}> • </Text>
                <MaterialDesignIcons name="map-marker" size={10} color={COLORS.textLight} />
                <Text style={styles.locationText}>{post.location}</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} disabled={!onPress}>
        {post.category === 'lost_found' ? (
          <View style={[styles.tagBadge, { backgroundColor: COLORS.error + '15' }]}>
            <MaterialDesignIcons name="alert-decagram" size={12} color={COLORS.error} />
            <Text style={[styles.tagText, { color: COLORS.error }]}>Lost/Found Alert</Text>
          </View>
        ) : post.petId ? (
          <View style={styles.tagBadge}>
            <MaterialDesignIcons name="paw" size={12} color={COLORS.primary} />
            <Text style={styles.tagText}>Tagged Pet</Text>
          </View>
        ) : null}
        <Text style={styles.content}>{post.content}</Text>
        
        {post.image ? (
          <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
        ) : null}

        {post.category === 'lost_found' && post.lostPetId && (
          <TouchableOpacity 
            style={styles.viewReportBtn}
            onPress={onPress}
          >
            <Text style={styles.viewReportText}>View Full Report Details</Text>
            <MaterialDesignIcons name="chevron-right" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.8}>
          <Animated.View style={animatedHeartStyle}>
            {isLiked ? (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Animated.View style={animatedPulseStyle}>
                  <View style={[styles.gradientHeart, { backgroundColor: '#FF3B30', opacity: 0.3 }]} />
                </Animated.View>
                <MaterialDesignIcons name="heart" size={24} color="#FF3B30" />
              </View>
            ) : (
              <MaterialDesignIcons name="heart-outline" size={24} color={COLORS.text} />
            )}
          </Animated.View>
          <Text style={[styles.actionText, isLiked && { color: '#FF3B30' }]}>{post.likes || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={onCommentPress}>
          <MaterialDesignIcons name="message-outline" size={21} color={COLORS.text} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shareBtn} 
          onPress={() => {
            Share.share({
              message: post.content,
              url: post.image,
              title: 'Share Post'
            });
            onSharePress?.();
          }}
        >
          <MaterialDesignIcons name="share-variant-outline" size={21} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 1,
  },
  content: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.xl,
    paddingVertical: 4,
  },
  shareBtn: {
    marginLeft: 'auto',
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  gradientHeart: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 2,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 4,
  },
  viewReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  viewReportText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
});
