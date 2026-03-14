import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { PostCard } from '../../components/cards/PostCard';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { dataService } from '../../services/dataService';
import { Post, User } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useCommunityStore } from '../../store/useCommunityStore';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { CommentBottomSheet } from '../../components/ui/CommentBottomSheet';

export const UserCommunityProfileScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  const { user, token } = useAppStore();
  const { likePost } = useCommunityStore();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      // Mock fetching user details (in a real app, you'd fetch user by ID)
      // Since our mock data.json only has one "loggedInUser", we'll mock the profile based on the posts
      const p = await dataService.getPosts();
      const userPostData = p.filter(post => post.user?.id === userId);
      setUserPosts(userPostData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      
      if (userPostData.length > 0) {
        setUserProfile({
          id: userId,
          name: userPostData[0].userName,
          email: 'user@example.com',
          avatar: userPostData[0].userAvatar,
          phone: '',
          location: ''
        });
      }
    };
    fetchUserAndPosts();
  }, [userId]);

  const handleLikePost = async (postId: string) => {
    if (!token || !user) return;

    try {
      await likePost(postId, token || '');
      // Update local state for immediate feedback if needed beyond store's optimistic update
      setUserPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const isLiked = p.likedBy?.includes(user?.id || '');
          const newLikedBy = isLiked 
            ? p.likedBy?.filter(id => id !== user?.id) 
            : [...(p.likedBy || []), user?.id || ''];
          
          return {
            ...p,
            likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
            likedBy: newLikedBy
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const openComments = (post: Post) => {
    setSelectedPostId(post.id);
    setShowComments(true);
  };

  if (!userProfile) {
    return (
      <ScreenContainer>
        <Header title="Profile" onBackPress={() => navigation.goBack()} />
        <View style={styles.loading}>
          <Text>Loading profile...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title={userProfile.name} onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileHeader}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{userProfile.name}</Text>
          <Text style={styles.bio}>Pet lover & parent to 3 beautiful rescues. Always happy to help the community!</Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { borderRightWidth: 0 }]}>
              <Text style={styles.statValue}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Community Posts</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Posts</Text>
        {userPosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onPress={() => navigation.navigate('PostDetails', { postId: post.id })} 
            onUserPress={() => {}} // already on profile
            onLikePress={() => handleLikePost(post.id)}
            onCommentPress={() => openComments(post)}
            currentUserId={user?.id}
          />
        ))}

        <CommentBottomSheet 
          visible={showComments} 
          onClose={() => setShowComments(false)} 
          postId={selectedPostId} 
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
  profileHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
});
