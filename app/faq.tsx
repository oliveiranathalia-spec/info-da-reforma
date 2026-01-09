import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "geral", label: "Geral" },
  { id: "comercio", label: "Comércio" },
  { id: "servicos", label: "Serviços" },
  { id: "industria", label: "Indústria" },
  { id: "simples", label: "Simples Nacional" },
];

const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    question: "O que muda com a Reforma Tributária?",
    answer: "A Reforma Tributária substitui cinco tributos (PIS, COFINS, IPI, ICMS e ISS) por três novos: CBS (federal), IBS (estadual/municipal) e IS (Imposto Seletivo). O objetivo é simplificar o sistema tributário brasileiro, tornando-o mais transparente e eficiente. A transição ocorrerá gradualmente entre 2026 e 2033.",
    category: "geral",
  },
  {
    id: "2",
    question: "Quando a reforma entra em vigor?",
    answer: "A implementação é gradual: em 2026 haverá uma fase de testes (educativa), sem cobrança efetiva. A CBS começa a ser cobrada em 2027 com alíquota de teste de 0,9%. O IBS inicia em 2027 com 0,1%. A transição completa, com extinção do ICMS e ISS, ocorrerá até 2033.",
    category: "geral",
  },
  {
    id: "3",
    question: "O que é o IBS?",
    answer: "O IBS (Imposto sobre Bens e Serviços) é um tributo de competência compartilhada entre Estados e Municípios que substituirá o ICMS e o ISS. Será administrado pelo Comitê Gestor do IBS (CG-IBS), terá alíquota única por ente federativo e será cobrado no destino (local do consumo).",
    category: "geral",
  },
  {
    id: "4",
    question: "O que é a CBS?",
    answer: "A CBS (Contribuição sobre Bens e Serviços) é o novo tributo federal que substituirá o PIS e a COFINS. Será administrada pela Receita Federal, terá regime sempre não-cumulativo com crédito amplo, e base de cálculo única.",
    category: "geral",
  },
  {
    id: "5",
    question: "Como fica o comércio com a reforma?",
    answer: "O comércio deixará de pagar ICMS e passará a recolher IBS e CBS. A principal mudança é a cobrança no destino (onde ocorre o consumo) e não mais na origem. Isso elimina a guerra fiscal entre estados e simplifica as operações interestaduais.",
    category: "comercio",
  },
  {
    id: "6",
    question: "Como calcular os novos tributos nas vendas?",
    answer: "Os novos tributos (IBS e CBS) incidirão sobre o valor da operação. Em 2027, as alíquotas de teste serão: CBS 0,9% e IBS 0,1%. As alíquotas de referência estimadas para o regime pleno são: CBS ~8,8% e IBS ~17,7%, totalizando cerca de 26,5% de IVA.",
    category: "comercio",
  },
  {
    id: "7",
    question: "Como fica a prestação de serviços?",
    answer: "Os prestadores de serviços deixarão de pagar ISS e passarão a recolher IBS e CBS. A alíquota única substituirá as diversas alíquotas de ISS que variam por município. O sistema de créditos será amplo, permitindo deduzir tributos pagos em insumos.",
    category: "servicos",
  },
  {
    id: "8",
    question: "Profissionais liberais terão tratamento diferenciado?",
    answer: "Sim, algumas categorias profissionais terão redução de alíquota de 30% do IBS e CBS. Isso inclui profissões regulamentadas como advogados, contadores, engenheiros, médicos, entre outros, conforme definido na LC 214/2024.",
    category: "servicos",
  },
  {
    id: "9",
    question: "Como fica a indústria com a reforma?",
    answer: "A indústria deixará de pagar IPI, PIS, COFINS e ICMS, passando a recolher CBS, IBS e, quando aplicável, o Imposto Seletivo (IS). O sistema de créditos amplos beneficia a cadeia produtiva, eliminando a cumulatividade residual.",
    category: "industria",
  },
  {
    id: "10",
    question: "O que é o Imposto Seletivo?",
    answer: "O Imposto Seletivo (IS) é um tributo federal que incidirá sobre produtos prejudiciais à saúde ou ao meio ambiente, como cigarros, bebidas alcoólicas, bebidas açucaradas e veículos poluentes. Substitui parcialmente o IPI nessas categorias.",
    category: "industria",
  },
  {
    id: "11",
    question: "Como fica o Simples Nacional?",
    answer: "Empresas do Simples Nacional poderão optar por permanecer no regime atual (com alíquotas unificadas) ou migrar para o regime regular de IBS e CBS. A opção pelo regime regular pode ser vantajosa para empresas que vendem para outras empresas (B2B), pois permite a transferência de créditos.",
    category: "simples",
  },
  {
    id: "12",
    question: "MEI será afetado pela reforma?",
    answer: "O MEI (Microempreendedor Individual) continuará com tratamento simplificado. A tributação unificada do MEI será mantida, com ajustes para contemplar os novos tributos. Os valores e limites serão definidos em regulamentação específica.",
    category: "simples",
  },
];

export default function FAQScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQ = FAQ_DATA.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedId(expandedId === id ? null : id);
  };

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
          Perguntas Frequentes
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Encontre respostas sobre a Reforma Tributária
        </Text>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Buscar pergunta..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                { borderColor: colors.border },
                selectedCategory === category.id && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? "#FFFFFF" : colors.foreground },
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <View style={styles.faqList}>
          {filteredFAQ.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <IconSymbol name="magnifyingglass" size={40} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Nenhuma pergunta encontrada
              </Text>
            </View>
          ) : (
            filteredFAQ.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleToggle(item.id)}
                style={[
                  styles.faqItem,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: colors.foreground }]}>
                    {item.question}
                  </Text>
                  <View style={[
                    styles.expandIcon,
                    expandedId === item.id && styles.expandIconRotated,
                  ]}>
                    <IconSymbol name="chevron.right" size={18} color={colors.muted} />
                  </View>
                </View>
                {expandedId === item.id && (
                  <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.faqAnswerText, { color: colors.foreground }]}>
                      {item.answer}
                    </Text>
                    <View style={[styles.categoryTag, { backgroundColor: colors.primary + "15" }]}>
                      <Text style={[styles.categoryTagText, { color: colors.primary }]}>
                        {CATEGORIES.find(c => c.id === item.category)?.label || item.category}
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="questionmark.circle.fill" size={24} color={colors.primary} />
          <View style={styles.footerContent}>
            <Text style={[styles.footerTitle, { color: colors.foreground }]}>
              Não encontrou sua resposta?
            </Text>
            <Text style={[styles.footerSubtitle, { color: colors.muted }]}>
              Pergunte diretamente ao nosso assistente de IA
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
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  categoriesContainer: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
  },
  faqList: {
    gap: 12,
    marginBottom: 24,
  },
  faqItem: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  expandIcon: {
    transform: [{ rotate: "90deg" }],
  },
  expandIconRotated: {
    transform: [{ rotate: "-90deg" }],
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    marginTop: -1,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  footerContent: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  footerSubtitle: {
    fontSize: 12,
  },
});
