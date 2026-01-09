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
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    text: "Olá! Sou o assistente especializado na Reforma Tributária brasileira. Posso ajudá-lo a entender as mudanças no sistema tributário, calcular tributos e esclarecer dúvidas sobre IBS, CBS e o período de transição.\n\nComo posso ajudar você hoje?",
    isUser: false,
    timestamp: new Date(),
  },
];

// Simulated AI responses for demo
const AI_RESPONSES: Record<string, { text: string; sources: string[] }> = {
  "o que é o ibs": {
    text: "O **IBS (Imposto sobre Bens e Serviços)** é um novo tributo criado pela Reforma Tributária que substituirá o ICMS (estadual) e o ISS (municipal).\n\n**Principais características:**\n\n• Tributo de competência compartilhada entre Estados e Municípios\n• Administrado pelo Comitê Gestor do IBS (CG-IBS)\n• Não cumulativo, com crédito amplo\n• Alíquota única por ente federativo\n• Cobrança no destino (onde ocorre o consumo)\n\nA transição do ICMS e ISS para o IBS ocorrerá gradualmente entre 2026 e 2033.",
    sources: ["LC 214/2024, Art. 1º", "EC 132/2023, Art. 156-A"],
  },
  "qual a diferença entre cbs e pis/cofins": {
    text: "A **CBS (Contribuição sobre Bens e Serviços)** é o novo tributo federal que substituirá o PIS e a COFINS.\n\n**Principais diferenças:**\n\n| Aspecto | PIS/COFINS | CBS |\n|---------|------------|-----|\n| Cumulatividade | Regime cumulativo e não-cumulativo | Sempre não-cumulativo |\n| Base de cálculo | Múltiplas bases | Base única |\n| Alíquotas | Várias alíquotas | Alíquota única |\n| Créditos | Restrições | Crédito amplo |\n\nA CBS será administrada pela Receita Federal e entrará em vigor efetivamente em 2027.",
    sources: ["LC 214/2024, Art. 2º", "EC 132/2023, Art. 195"],
  },
  "como funciona o período de transição": {
    text: "O período de transição da Reforma Tributária está dividido em fases:\n\n**2026 - Fase Educativa:**\n• Testes e validação de sistemas\n• Sem recolhimento efetivo de IBS/CBS\n• Sem aplicação de penalidades\n• Apuração meramente informativa\n\n**2027 - Início da CBS:**\n• Cobrança efetiva da CBS (federal)\n• Alíquota de teste de 0,9%\n\n**2027-2033 - Transição gradual:**\n• Redução progressiva de ICMS/ISS\n• Aumento progressivo do IBS\n• Extinção total do ICMS/ISS em 2033\n\nDurante todo o período, os sistemas fiscais (NF-e, NFC-e, etc.) terão campos específicos para os novos tributos.",
    sources: ["LC 214/2024, Art. 125", "Ato Conjunto RFB/CGIBS 01/2025"],
  },
  "quem precisa se adaptar em 2026": {
    text: "Em **2026**, todos os contribuintes que emitem documentos fiscais eletrônicos precisam se preparar:\n\n**Obrigações em 2026:**\n\n• Atualização de sistemas para incluir campos de IBS e CBS nos documentos fiscais\n• Participação na fase de testes\n• Apuração informativa (sem recolhimento)\n\n**Quem está envolvido:**\n\n• Empresas do Lucro Real e Presumido\n• Empresas do Simples Nacional\n• Prestadores de serviços\n• Importadores e exportadores\n\n**Importante:** Durante 2026, não haverá penalidades por erros no preenchimento dos novos campos, desde que as obrigações acessórias sejam cumpridas.",
    sources: ["Ato Conjunto RFB/CGIBS 01/2025", "LC 214/2024"],
  },
};

function getAIResponse(question: string): { text: string; sources: string[] } {
  const normalizedQuestion = question.toLowerCase().trim();
  
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (normalizedQuestion.includes(key)) {
      return response;
    }
  }
  
  return {
    text: "Obrigado pela sua pergunta! Para fornecer uma resposta precisa e fundamentada na legislação, preciso consultar nossa base de dados legal.\n\nEsta é uma versão de demonstração. Na versão completa, a IA analisará a Lei Complementar 214/2024, a Emenda Constitucional 132/2023 e outras normas para responder sua dúvida com citações das fontes legais.",
    sources: ["Demonstração"],
  };
}

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
    setInputText("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = getAIResponse(userMessage.text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        sources: response.sources,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
            Powered by IA • Base legal atualizada
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
                Analisando legislação...
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
            placeholder="Digite sua pergunta..."
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
              { backgroundColor: inputText.trim() ? colors.primary : colors.muted },
              pressed && { opacity: 0.8 },
            ]}
          >
            <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
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
