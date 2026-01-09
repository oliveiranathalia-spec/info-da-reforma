import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const QUICK_ACCESS_CARDS = [
  {
    id: "chat",
    title: "Pergunte à IA",
    description: "Tire suas dúvidas sobre a reforma",
    icon: "message.fill" as const,
    route: "/chat" as const,
  },
  {
    id: "calculators",
    title: "Calculadoras",
    description: "Calcule IBS, CBS e compare",
    icon: "calculator.fill" as const,
    route: "/calculators" as const,
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Perguntas frequentes por setor",
    icon: "questionmark.circle.fill" as const,
    route: "/faq" as const,
  },
  {
    id: "news",
    title: "Atualizações",
    description: "Novidades da legislação",
    icon: "bell.fill" as const,
    route: "/news" as const,
  },
];

const NEWS_ITEMS = [
  {
    id: "1",
    title: "2026: Fase educativa do IBS e CBS",
    description: "Período de testes sem penalidades para contribuintes",
    date: "09 Jan 2026",
  },
  {
    id: "2",
    title: "Documentos fiscais com novos campos",
    description: "NF-e, NFC-e e CT-e terão campos para IBS e CBS",
    date: "08 Jan 2026",
  },
  {
    id: "3",
    title: "Comitê Gestor do IBS em operação",
    description: "Órgão responsável pela administração do novo imposto",
    date: "07 Jan 2026",
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleCardPress = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  return (
    <ScreenContainer>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.muted }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Reforma Tributária
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Seu guia completo sobre IBS, CBS e a nova tributação
          </Text>
        </View>

        {/* Info Banner */}
        <View style={[styles.banner, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
          <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.foreground }]}>
            2026 é o ano de transição! Período educativo sem penalidades.
          </Text>
        </View>

        {/* Quick Access Cards */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Acesso Rápido
        </Text>
        <View style={styles.cardsGrid}>
          {QUICK_ACCESS_CARDS.map((card) => (
            <Pressable
              key={card.id}
              onPress={() => handleCardPress(card.route)}
              style={({ pressed }) => [
                styles.card,
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                pressed && styles.cardPressed,
              ]}
            >
              <View style={[styles.cardIconContainer, { backgroundColor: colors.primary + "15" }]}>
                <IconSymbol name={card.icon} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {card.title}
              </Text>
              <Text style={[styles.cardDescription, { color: colors.muted }]}>
                {card.description}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Latest Updates */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Últimas Atualizações
        </Text>
        <View style={styles.newsList}>
          {NEWS_ITEMS.map((item) => (
            <View 
              key={item.id} 
              style={[styles.newsItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.newsContent}>
                <Text style={[styles.newsTitle, { color: colors.foreground }]}>
                  {item.title}
                </Text>
                <Text style={[styles.newsDescription, { color: colors.muted }]}>
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.newsDate, { color: colors.muted }]}>
                {item.date}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer Info */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Base legal: LC 214/2024 • EC 132/2023
          </Text>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Atualizado em 09/01/2026
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 10,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  newsList: {
    gap: 10,
    marginBottom: 24,
  },
  newsItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  newsContent: {
    marginBottom: 8,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  newsDate: {
    fontSize: 11,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
  },
});
