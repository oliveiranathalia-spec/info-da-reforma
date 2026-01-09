import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: "legislacao" | "orientacao" | "prazo" | "novidade";
  source: string;
}

const NEWS_DATA: NewsItem[] = [
  {
    id: "1",
    title: "Ato Conjunto RFB/CGIBS nº 1/2025 publicado",
    summary: "Receita Federal e Comitê Gestor do IBS estabelecem regras para a fase de transição em 2026. Período será educativo, sem penalidades para contribuintes.",
    date: "23 Dez 2025",
    category: "legislacao",
    source: "Diário Oficial da União",
  },
  {
    id: "2",
    title: "Documentos fiscais terão novos campos em 2026",
    summary: "NF-e, NFC-e, CT-e e NFS-e passarão a incluir campos específicos para destaque do IBS e CBS. Preenchimento incorreto não gerará penalidades durante a transição.",
    date: "20 Dez 2025",
    category: "orientacao",
    source: "Comitê Gestor do IBS",
  },
  {
    id: "3",
    title: "PLP 108/2024 aguarda sanção presidencial",
    summary: "Projeto de Lei Complementar que institui o Comitê Gestor do IBS foi aprovado pelo Congresso e aguarda sanção para completar o arcabouço legal da reforma.",
    date: "19 Dez 2025",
    category: "legislacao",
    source: "Senado Federal",
  },
  {
    id: "4",
    title: "Prazo para adaptação de sistemas fiscais",
    summary: "Empresas devem iniciar a preparação de seus sistemas para a nova tributação. Recomenda-se contato com fornecedores de software para atualizações.",
    date: "15 Dez 2025",
    category: "prazo",
    source: "Receita Federal",
  },
  {
    id: "5",
    title: "Alíquotas de teste definidas para 2027",
    summary: "CBS terá alíquota de 0,9% e IBS de 0,1% durante o período de teste em 2027. Valores serão compensados com redução de PIS/COFINS.",
    date: "10 Dez 2025",
    category: "novidade",
    source: "Ministério da Fazenda",
  },
  {
    id: "6",
    title: "Comitê Gestor do IBS inicia operações",
    summary: "Órgão responsável pela administração do IBS começa suas atividades, preparando a infraestrutura para a implementação do novo tributo.",
    date: "05 Dez 2025",
    category: "novidade",
    source: "CGIBS",
  },
];

const CATEGORY_CONFIG = {
  legislacao: { label: "Legislação", color: "#1E3A5F" },
  orientacao: { label: "Orientação", color: "#0EA5E9" },
  prazo: { label: "Prazo", color: "#D97706" },
  novidade: { label: "Novidade", color: "#059669" },
};

export default function NewsScreen() {
  const colors = useColors();
  const router = useRouter();

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.right" size={20} color={colors.primary} style={{ transform: [{ rotate: "180deg" }] }} />
          <Text style={[styles.backText, { color: colors.primary }]}>Voltar</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Atualizações
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Novidades e mudanças na legislação tributária
        </Text>

        {/* News List */}
        <View style={styles.newsList}>
          {NEWS_DATA.map((item) => {
            const categoryConfig = CATEGORY_CONFIG[item.category];
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.newsCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={styles.newsHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + "20" }]}>
                    <Text style={[styles.categoryBadgeText, { color: categoryConfig.color }]}>
                      {categoryConfig.label}
                    </Text>
                  </View>
                  <Text style={[styles.newsDate, { color: colors.muted }]}>
                    {item.date}
                  </Text>
                </View>
                
                <Text style={[styles.newsTitle, { color: colors.foreground }]}>
                  {item.title}
                </Text>
                
                <Text style={[styles.newsSummary, { color: colors.muted }]}>
                  {item.summary}
                </Text>
                
                <View style={[styles.newsFooter, { borderTopColor: colors.border }]}>
                  <IconSymbol name="doc.text.fill" size={14} color={colors.muted} />
                  <Text style={[styles.newsSource, { color: colors.muted }]}>
                    {item.source}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary }]}>
          <IconSymbol name="bell.fill" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>
              Receba notificações
            </Text>
            <Text style={[styles.infoText, { color: colors.muted }]}>
              Ative as notificações para ser avisado sobre novas publicações e prazos importantes.
            </Text>
          </View>
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  newsList: {
    gap: 14,
    marginBottom: 24,
  },
  newsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  newsDate: {
    fontSize: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  newsSource: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
    alignItems: "flex-start",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
