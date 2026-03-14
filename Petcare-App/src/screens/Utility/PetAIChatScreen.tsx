import React, { useState, useRef, useEffect, useMemo } from 'react';
import Markdown from 'react-native-markdown-display';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { COLORS, SPACING, SHADOWS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useAppStore } from '../../store/useAppStore';
import { usePetStore } from '../../store/usePetStore';
import { dataService } from '../../services/dataService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const markdownStyles: any = {
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155', // Slate 700 for better readability
  },
  strong: {
    fontWeight: 'bold',
    color: '#0F172A', // Slate 900 for emphasis
  },
  em: {
    fontStyle: 'italic',
    color: '#475569',
  },
  bullet_list: {
    marginVertical: 4,
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list_icon: {
    color: COLORS.primary,
    fontSize: 14,
    marginRight: 6,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 4,
  },
};

const MessageBubble = React.memo(({ item }: { item: Message }) => {
  const isUser = item.sender === 'user';

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[
        styles.messageWrapper,
        isUser ? styles.userWrapper : styles.aiWrapper,
      ]}
    >
      {!isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: '#8B5CF6' }]}>
          <MaterialDesignIcons name="paw" size={16} color="#fff" />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
          !isUser && styles.aiBubbleShadow,
        ]}
      >
        {isUser ? (
          <Text style={[styles.messageText, styles.userText]}>
            {item.text}
          </Text>
        ) : (
          <View style={styles.markdownContainer}>
            <Markdown style={markdownStyles}>
              {item.text.replace(/\\\*/g, '*').trim()}
            </Markdown>
          </View>
        )}

        <Text
          style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.aiTimestamp,
          ]}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </Animated.View>
  );
});

export const PetAIChatScreen = ({ navigation }: any) => {
  const { token } = useAppStore();
  const { pets, fetchPets } = usePetStore();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (token) {
      fetchPets(token);
    }
  }, [token]);

  const dynamicSuggestions = useMemo(() => {
    const firstPetName = pets[0]?.name || "my pet";
    const breed = pets[0]?.breed || "breed";
    
    return [
      `🐶 ${firstPetName}'s weight?`,
      `💊 ${firstPetName}'s vaccine status?`,
      `📅 Next appointment for ${firstPetName}?`,
      `🍎 Best diet for a ${breed}?`,
      "🚑 Emergency help"
    ];
  }, [pets]);

  const typingOpacity = useSharedValue(0.4);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text:
        "Hi! I've synchronized with your pet's records. I know about your pets and their medical history. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    typingOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.4, { duration: 600 })
      ),
      -1,
      true
    );

    return () => {
      showSub.remove();
    };
  }, []);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride || inputText).trim();
    if (!text || !token || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await dataService.chatWithAI(text, token);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I hit a snag connecting to my brain. Please try again!",
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const dotStyle = useAnimatedStyle(() => ({
    opacity: typingOpacity.value,
  }));

  return (
    <ScreenContainer withSafeArea={true}>
      <Header
        title="Pet Assistant"
        onBackPress={() => navigation.goBack()}
        rightIcon="dots-vertical"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.flexOne}
      >
        <View style={styles.contentContainer}>
          <View style={styles.smartBadge}>
            <MaterialDesignIcons
              name="check-decagram"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.smartBadgeText}>
              Enhanced with your Pet's Records
            </Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => <MessageBubble item={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            style={styles.flexOne}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {isLoading && (
            <View style={styles.typingContainer}>
              <View style={styles.aiAvatarSmall}>
                <MaterialDesignIcons name="robot" size={14} color="#fff" />
              </View>

              <View style={styles.typingBubble}>
                <Animated.View style={[styles.dot, dotStyle]} />
                <Animated.View style={[styles.dot, dotStyle]} />
                <Animated.View style={[styles.dot, dotStyle]} />
              </View>
            </View>
          )}

          <View
            style={[
              styles.bottomSection,
              { paddingBottom: insets.bottom + 12 },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
              contentContainerStyle={styles.suggestionsContainer}
              keyboardShouldPersistTaps="handled"
            >
              {dynamicSuggestions.map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => handleSend(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputArea}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
                  placeholderTextColor="#94A3B8"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
              >
                <MaterialDesignIcons 
                  name={inputText.trim() ? "send" : "microphone"} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  smartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingVertical: 10,
  },

  smartBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 8,
  },

  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },

  userWrapper: {
    justifyContent: 'flex-end',
  },

  aiWrapper: {
    justifyContent: 'flex-start',
  },

  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  bubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '85%',
  },

  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
    ...SHADOWS.small,
  },

  aiBubble: {
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.small,
  },

  markdownContainer: {
    width: '100%',
  },

  aiBubbleShadow: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.small,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },

  userText: {
    color: '#fff',
  },

  aiText: {
    color: COLORS.text,
  },

  timestamp: {
    fontSize: 10,
    marginTop: 6,
  },

  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },

  aiTimestamp: {
    color: COLORS.textLight,
  },

  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    alignItems: 'center',
  },

  aiAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 2,
  },

  bottomSection: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
  },

  suggestionsScroll: {
    marginBottom: 8,
  },

  suggestionsContainer: {
    paddingHorizontal: SPACING.md,
  },

  suggestionChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  suggestionText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },

  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
  },

  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 50,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 10,
    maxHeight: 120,
  },

  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    ...SHADOWS.medium,
  },

  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
});