import { create } from 'zustand';
import { Post } from '../types';
import { dataService, API_URL } from '../services/dataService';
import { io } from 'socket.io-client';
import { useAppStore } from './useAppStore';

const SOCKET_URL = API_URL.replace('/api', '');


interface CommunityState {
  posts: Post[];
  comments: any[];
  currentPostId: string | null;
  loading: boolean;
  fetchPosts: () => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  createPost: (data: any, token: string) => Promise<void>;
  addComment: (postId: string, text: string, token: string) => Promise<void>;
  likePost: (postId: string, token: string) => Promise<void>;
  initializeSocket: (token: string) => () => void;
  setCurrentPostId: (id: string | null) => void;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  posts: [],
  comments: [],
  currentPostId: null,
  loading: false,
  fetchPosts: async () => {
    set({ loading: true });
    try {
      const posts = await dataService.getPosts();
      set({ posts, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
  fetchComments: async (postId) => {
    set({ loading: true, currentPostId: postId });
    try {
      const resp = await fetch(`${API_URL}/community/${postId}/comments`);
      const comments = await resp.json();
      set({ comments, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
  createPost: async (data, token) => {
    const response: any = await dataService.createPost(data, token);
    if (response && response.message) throw new Error(response.message);
    const posts = await dataService.getPosts();
    set({ posts });
  },
  addComment: async (postId, text, token) => {
    await dataService.addComment(postId, text, token);
    // Refresh comments
    const resp = await fetch(`${API_URL}/community/${postId}/comments`);
    const comments = await resp.json();
    set({ comments });
    
    // Also refresh posts to get updated comment count
    const posts = await dataService.getPosts();
    set({ posts });
  },
  likePost: async (postId, token) => {
    // Optimistic Update
    set((state) => {
      const user = useAppStore.getState().user;
      if (!user) return state;
      const userId = user.id || (user as any)._id;

      return {
        posts: state.posts.map((p) => {
          if (p.id === postId) {
            const isLiked = p.likedBy?.includes(userId);
            const newLikedBy = isLiked
              ? (p.likedBy || []).filter(id => id !== userId)
              : [...(p.likedBy || []), userId];
            
            return {
              ...p,
              likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
              likedBy: newLikedBy
            };
          }
          return p;
        })
      };
    });

    try {
      await dataService.likePost(postId, token);
      // Backend emit will synchronize eventually, but optimistic UI makes it instant
    } catch (error) {
      console.error("Failed to like post", error);
      // Revert on error - fetch latest posts to sync
      const posts = await dataService.getPosts();
      set({ posts });
    }
  },
  setCurrentPostId: (id) => set({ currentPostId: id }),
  initializeSocket: (token: string) => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('post_created', (newPost: any) => {
      const mappedPost = { 
        ...newPost, 
        id: newPost._id,
        userName: newPost.user?.name || 'Anonymous',
        userAvatar: newPost.user?.avatar || 'https://via.placeholder.com/150',
        image: newPost.images && newPost.images.length > 0 ? newPost.images[0] : undefined,
        likes: Array.isArray(newPost.likes) ? newPost.likes.length : 0,
        likedBy: Array.isArray(newPost.likes) ? newPost.likes.map((id: any) => id.toString()) : [],
        comments: newPost.commentCount || 0
      };
      set((state) => ({ 
        posts: [mappedPost, ...state.posts] 
      }));
    });

    socket.on('post_liked', (data: { postId: string, likes: number, userId: string, isLiked: boolean }) => {
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === data.postId ? { 
            ...p, 
            likes: data.likes,
            likedBy: data.isLiked 
              ? [...(p.likedBy || []), data.userId]
              : (p.likedBy || []).filter(id => id !== data.userId)
          } : p
        ),
      }));
    });

    socket.on('comment_added', (data: { postId: string, comment: any, commentCount: number }) => {
      set((state) => {
        const updatedPosts = state.posts.map((p) =>
          p.id === data.postId ? { ...p, comments: data.commentCount } : p
        );
        
        // Update comments list only if it's the current post the user is viewing
        if (state.currentPostId === data.postId) {
          const newComment = { ...data.comment, id: data.comment._id };
          // Avoid duplicates if the user themselves just posted (though handleSend already refreshes)
          const commentExists = state.comments.some(c => c.id === newComment.id);
          if (!commentExists) {
            return { posts: updatedPosts, comments: [...state.comments, newComment] };
          }
        }
        
        return { posts: updatedPosts };
      });
    });

    return () => {
      socket.disconnect();
    };
  }
}));

