import { useState, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
}

const SUGGESTED_QUESTIONS = [
  "O que é o IBS?",
  "Qual a diferença entre CBS e PIS/COFINS?",
  "Como funciona o período de transição?",
  "Quem precisa se adaptar em 2026?",
  "Qual a alíquota do IBS e CBS?",
  "O que é o Imposto Seletivo?",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    text: "Olá! Sou o assistente especializado na Reforma Tributária brasileira. Posso ajudá-lo a entender as mudanças no sistema tributário, calcular tributos e esclarecer dúvidas sobre IBS, CBS e o período de transição.\n\nComo posso ajudar você hoje?",
    isUser: false,
    timestamp: new Date(),
  },
];

// Detectar URL base da API
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // No browser, usar a mesma origem
    return window.location.origin;
  }
  // Fallback para desenvolvimento
  return 'https://info-da-reforma.vercel.app';
};

export default function ChatScreen() {
  const colors = useColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const questionText = inputText.trim();
    setInputText("");
    setIsLoading(true);

    // Scroll para baixo após adicionar mensagem do usuário
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Preparar histórico de conversa (excluindo mensagem de boas-vindas)
      const history = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.isUser ? "user" as const : "assistant" as const,
          content: m.text
        }));

      // Chamar a API serverless
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: questionText,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      
      // Mensagem de erro amigável
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente em alguns instantes.",
        isUser: false,
        timestamp: new Date(),
        sources: ["Erro de conexão"],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      
      // Scroll para baixo após resposta
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSuggestionPress = (question: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setInputText(question);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Assistente Tributário
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            Powered by Gemini AI • Base legal atualizada
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser
                  ? [styles.userBubble, { backgroundColor: colors.primary }]
                  : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: message.isUser ? "#FFFFFF" : colors.foreground },
                ]}
              >
                {message.text}
              </Text>
              {message.sources && message.sources.length > 0 && (
                <View style={[styles.sourcesContainer, { borderTopColor: colors.border }]}>
                  <Text style={[styles.sourcesLabel, { color: colors.muted }]}>
                    Fontes:
                  </Text>
                  {message.sources.map((source, index) => (
                    <Text key={index} style={[styles.sourceText, { color: colors.primary }]}>
                      {source}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.loadingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.muted }]}>
                Consultando legislação...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
          >
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <Pressable
                key={index}
                onPress={() => handleSuggestionPress(question)}
                style={({ pressed }) => [
                  styles.suggestionChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.suggestionText, { color: colors.foreground }]}>
                  {question}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.surface, 
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            placeholder="Digite sua pergunta sobre a reforma..."
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.muted },
              pressed && { opacity: 0.8 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  sourcesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  sourcesLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    marginTop: 2,
  },
  loadingBubble: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
  },
  suggestionsContainer: {
    maxHeight: 50,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
