import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { PostCard } from '../../components/cards/PostCard';
import { SPACING, COLORS, SHADOWS, RADIUS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { CommentBottomSheet } from '../../components/ui/CommentBottomSheet';

import { useCommunityStore } from '../../store/useCommunityStore';
import { useAppStore } from '../../store/useAppStore';

export const CommunityFeedScreen = ({ navigation }: any) => {
  const { token, user } = useAppStore();
  const { posts, loading, fetchPosts, likePost } = useCommunityStore();
  const [showComments, setShowComments] = React.useState(false);
  const [activePostId, setActivePostId] = React.useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    const disconnectSocket = useCommunityStore.getState().initializeSocket(token || '');
    return () => disconnectSocket();
  }, [token]);

  return (
    <ScreenContainer>
      <Header 
        title="Pet Community" 
        rightIcon="plus-circle" 
        onRightPress={() => navigation.navigate('CreatePost')} 
        onBackPress={() => navigation.goBack()}
        transparent
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchPosts} 
            colors={[COLORS.primary]} 
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.aiBanner} 
          onPress={() => navigation.navigate('PetAIChat')}
          activeOpacity={0.9}
        >
          <View style={styles.aiIconBox}>
            <MaterialDesignIcons name="robot" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.aiTextContainer}>
            <Text style={styles.aiTitle}>Confused about your pet?</Text>
            <Text style={styles.aiSubtitle}>Ask our AI Pet expert now!</Text>
          </View>
          <MaterialDesignIcons name="chevron-right" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        {posts.map((post, index) => (
          <PostCard 
            key={post.id} 
            post={post} 
            index={index}
            currentUserId={user?.id}
            onPress={() => {
              if (post.category === 'lost_found' && post.lostPetId) {
                // Determine if it was lost or found from content or post category
                const isLost = post.content.includes('LOST');
                navigation.navigate(isLost ? 'LostPetDetails' : 'FoundPetDetails', { itemId: post.lostPetId });
              } else {
                navigation.navigate('PostDetails', { postId: post.id });
              }
            }}
            onUserPress={() => navigation.navigate('UserCommunityProfile', { userId: post.user?.id || (post as any).userId })}
            onLikePress={() => token && likePost(post.id, token)}
            onCommentPress={() => {
              setActivePostId(post.id);
              setShowComments(true);
            }}
          />
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
      >
        <MaterialDesignIcons name="pencil" size={28} color={COLORS.surface} />
      </TouchableOpacity>

      <CommentBottomSheet 
        visible={showComments} 
        onClose={() => setShowComments(false)} 
        postId={activePostId} 
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 100, // Space for FAB
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    ...SHADOWS.small,
  },
  aiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  aiSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
});
