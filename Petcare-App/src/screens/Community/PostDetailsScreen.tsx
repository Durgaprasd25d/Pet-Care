import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, TextInput, Share } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { CommentBottomSheet } from '../../components/ui/CommentBottomSheet';
import LinearGradient from 'react-native-linear-gradient';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { dataService } from '../../services/dataService';
import { Post } from '../../types';

import { useCommunityStore } from '../../store/useCommunityStore';
import { useAppStore } from '../../store/useAppStore';

export const PostDetailsScreen = ({ route, navigation }: any) => {

  const { postId } = route.params;
  const { posts, comments, fetchComments, addComment } = useCommunityStore();
  const { token, user } = useAppStore();
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
    position: 'absolute',
    zIndex: -1,
  }));
  
  const post = posts.find(p => p.id === postId);

  useEffect(() => {
    fetchComments(postId);
    const disconnectSocket = useCommunityStore.getState().initializeSocket(token || '');
    return () => {
      disconnectSocket();
      useCommunityStore.getState().setCurrentPostId(null);
    };
  }, [postId, post, token]);

  const handleLike = async () => {
    if (token) {
      const isPostLiked = user?.id && post?.likedBy?.includes(user.id);
      
      scale.value = withSequence(
        withSpring(1.4, { damping: 5, stiffness: 150 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );

      if (!isPostLiked) {
        pulseScale.value = 1;
        pulseOpacity.value = 0.5;
        pulseScale.value = withTiming(2.5, { duration: 400 });
        pulseOpacity.value = withTiming(0, { duration: 400 });
      }

      await useCommunityStore.getState().likePost(postId, token);
    }
  };

  const userId = user?.id || (user as any)?._id;
  const isPostLiked = userId && post?.likedBy?.includes(userId);


  if (!post) {
    return (
      <ScreenContainer>
        <Header title="Post" onBackPress={() => navigation.goBack()} />
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }


  return (
    <ScreenContainer>
      <Header title="Post Details" onBackPress={() => navigation.goBack()} rightIcon="dots-vertical" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.postCard}>
          <View style={styles.authorRow}>
            <TouchableOpacity onPress={() => navigation.navigate('UserCommunityProfile', { userId: post.user?.id })}>
              <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
            </TouchableOpacity>
            <View style={styles.authorInfo}>
              <TouchableOpacity onPress={() => navigation.navigate('UserCommunityProfile', { userId: post.user?.id })}>
                <Text style={styles.authorName}>{post.userName}</Text>
              </TouchableOpacity>
              <Text style={styles.timeText}>{post.timeAgo}</Text>
            </View>
            {post.location && (
              <View style={styles.locationBadge}>
                <MaterialDesignIcons name="map-marker" size={12} color={COLORS.primary} />
                <Text style={styles.locationText}>{post.location}</Text>
              </View>
            )}
          </View>

          {post.petId && (
            <View style={styles.tagBadge}>
              <MaterialDesignIcons name="paw" size={14} color={COLORS.primary} />
              <Text style={styles.tagText}>Tagged: Bruno</Text>
            </View>
          )}

          <Text style={styles.content}>{post.content}</Text>

          {post.image && (
            <Image source={{ uri: post.image }} style={styles.postImage} />
          )}

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.8}>
              <Animated.View style={animatedHeartStyle}>
                {isPostLiked ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Animated.View style={animatedPulseStyle}>
                      <View style={[styles.gradientHeart, { backgroundColor: '#FF3B30', opacity: 0.3 }]} />
                    </Animated.View>
                    <MaterialDesignIcons name="heart" size={24} color="#FF3B30" />
                  </View>
                ) : (
                  <MaterialDesignIcons name="heart-outline" size={24} color={COLORS.textLight} />
                )}
              </Animated.View>
              <Text style={[styles.actionText, isPostLiked && { color: '#FF3B30' }]}>{post.likes} Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setIsCommentsVisible(true)}>
              <MaterialDesignIcons name="comment-outline" size={24} color={COLORS.textLight} />
              <Text style={styles.actionText}>{post.comments} Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => Share.share({
                message: post.content,
                url: post.image,
                title: 'Share Post'
              })}
            >
              <MaterialDesignIcons name="share-outline" size={24} color={COLORS.textLight} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <CommentBottomSheet 
          visible={isCommentsVisible} 
          onClose={() => setIsCommentsVisible(false)} 
          postId={postId} 
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  gradientHeart: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  content: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.primary,
    marginLeft: 2,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary || COLORS.primary,
    marginLeft: 4,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  statText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
    marginLeft: 6,
  },
});
