import { useState, useRef, useEffect } from "react";
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
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
  attachment?: {
    name: string;
    type: string;
    content?: string;
  };
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
    text: "Olá! Sou o assistente especializado na Reforma Tributária brasileira. Posso ajudá-lo a entender as mudanças no sistema tributário, calcular tributos e esclarecer dúvidas sobre IBS, CBS e o período de transição.\n\n🎤 Use o microfone para falar sua pergunta\n📎 Anexe arquivos XML de NF-e ou PDFs para análise\n\nComo posso ajudar você hoje?",
    isUser: false,
    timestamp: new Date(),
  },
];

// Detectar URL base da API
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://info-da-reforma.vercel.app';
};

// Web Speech API types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function ChatScreen() {
  const colors = useColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string; type: string; content: string} | null>(null);
  const recognitionRef = useRef<any>(null);

  // Inicializar Web Speech API
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'pt-BR';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputText(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Aviso', 'O microfone está disponível apenas na versão web do aplicativo.');
      return;
    }

    if (!recognitionRef.current) {
      Alert.alert('Aviso', 'Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome ou Edge.');
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFilePick = async () => {
    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/xml', 'text/xml', 'application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      const fileName = file.name || 'arquivo';
      const fileType = file.mimeType || 'unknown';

      // Para arquivos XML e texto, ler o conteúdo
      if (fileType.includes('xml') || fileType.includes('text')) {
        try {
          const response = await fetch(file.uri);
          const content = await response.text();
          
          setAttachedFile({
            name: fileName,
            type: fileType,
            content: content.substring(0, 10000), // Limitar tamanho
          });
        } catch (error) {
          console.error('Error reading file:', error);
          setAttachedFile({
            name: fileName,
            type: fileType,
            content: `[Arquivo ${fileName} anexado - não foi possível ler o conteúdo]`,
          });
        }
      } else {
        // Para PDFs, apenas indicar que foi anexado
        setAttachedFile({
          name: fileName,
          type: fileType,
          content: `[Arquivo PDF anexado: ${fileName}]`,
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !attachedFile) || isLoading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    let messageText = inputText.trim();
    
    // Se houver arquivo anexado, incluir na mensagem
    if (attachedFile) {
      if (attachedFile.type.includes('xml')) {
        messageText = `${messageText}\n\n[Arquivo XML anexado: ${attachedFile.name}]\n\nConteúdo do XML:\n${attachedFile.content}`;
      } else {
        messageText = `${messageText}\n\n${attachedFile.content}`;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim() || `Analisando arquivo: ${attachedFile?.name}`,
      isUser: true,
      timestamp: new Date(),
      attachment: attachedFile ? {
        name: attachedFile.name,
        type: attachedFile.type,
      } : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAttachedFile(null);
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const history = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.isUser ? "user" as const : "assistant" as const,
          content: m.text
        }));

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
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

  const isSpeechSupported = Platform.OS === 'web' && typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

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
              {message.attachment && (
                <View style={[styles.attachmentBadge, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol name="doc.fill" size={14} color={colors.primary} />
                  <Text style={[styles.attachmentName, { color: colors.primary }]}>
                    {message.attachment.name}
                  </Text>
                </View>
              )}
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

        {/* Attached File Preview */}
        {attachedFile && (
          <View style={[styles.attachmentPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <IconSymbol name="doc.fill" size={20} color={colors.primary} />
            <Text style={[styles.attachmentPreviewText, { color: colors.foreground }]} numberOfLines={1}>
              {attachedFile.name}
            </Text>
            <Pressable onPress={removeAttachment} style={styles.removeAttachment}>
              <IconSymbol name="xmark" size={18} color={colors.muted} />
            </Pressable>
          </View>
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          {/* Botão de anexo */}
          <Pressable
            onPress={handleFilePick}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol name="paperclip" size={22} color={colors.muted} />
          </Pressable>

          {/* Botão de microfone */}
          {isSpeechSupported && (
            <Pressable
              onPress={toggleListening}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: isListening ? colors.error : colors.surface },
                pressed && { opacity: 0.7 },
              ]}
            >
              <IconSymbol 
                name={isListening ? "mic.slash.fill" : "mic.fill"} 
                size={22} 
                color={isListening ? "#FFFFFF" : colors.muted} 
              />
            </Pressable>
          )}

          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.surface, 
                color: colors.foreground,
                borderColor: isListening ? colors.error : colors.border,
              },
            ]}
            placeholder={isListening ? "Ouvindo..." : "Digite sua pergunta..."}
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
            disabled={(!inputText.trim() && !attachedFile) || isLoading}
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: (inputText.trim() || attachedFile) && !isLoading ? colors.primary : colors.muted },
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
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: '500',
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
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  attachmentPreviewText: {
    flex: 1,
    fontSize: 14,
  },
  removeAttachment: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
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
