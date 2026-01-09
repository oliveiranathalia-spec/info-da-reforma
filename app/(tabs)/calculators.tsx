import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

type CalculatorType = "list" | "ibs-cbs" | "comparativo";

interface TaxResult {
  cbs: number;
  ibs: number;
  total: number;
  aliquotaEfetiva: number;
}

interface ComparisonResult {
  atual: {
    pis: number;
    cofins: number;
    icms: number;
    iss: number;
    total: number;
  };
  reforma: TaxResult;
  diferenca: number;
}

const SECTORS = [
  { id: "comercio", label: "Comércio", icmsRate: 18, issRate: 0 },
  { id: "servicos", label: "Serviços", icmsRate: 0, issRate: 5 },
  { id: "industria", label: "Indústria", icmsRate: 18, issRate: 0 },
  { id: "importacao", label: "Importação", icmsRate: 18, issRate: 0 },
];

const OPERATION_TYPES = [
  { id: "venda", label: "Venda de Produto" },
  { id: "servico", label: "Prestação de Serviço" },
];

// Alíquotas estimadas para 2027 (período de teste)
const CBS_RATE = 0.009; // 0.9% em 2027
const IBS_RATE = 0.001; // 0.1% em 2027
const PIS_RATE = 0.0165;
const COFINS_RATE = 0.076;

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseCurrency(text: string): number {
  const cleaned = text.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export default function CalculatorsScreen() {
  const colors = useColors();
  const [currentView, setCurrentView] = useState<CalculatorType>("list");
  const [valor, setValor] = useState("");
  const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
  const [selectedOperation, setSelectedOperation] = useState(OPERATION_TYPES[0]);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const handleCalculate = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const valorNumerico = parseCurrency(valor);
    if (valorNumerico <= 0) return;

    const cbs = valorNumerico * CBS_RATE;
    const ibs = valorNumerico * IBS_RATE;
    const total = cbs + ibs;
    const aliquotaEfetiva = (total / valorNumerico) * 100;

    setResult({
      cbs,
      ibs,
      total,
      aliquotaEfetiva,
    });
  };

  const handleCompare = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const valorNumerico = parseCurrency(valor);
    if (valorNumerico <= 0) return;

    // Cálculo sistema atual
    const pis = valorNumerico * PIS_RATE;
    const cofins = valorNumerico * COFINS_RATE;
    const icms = selectedOperation.id === "venda" ? valorNumerico * (selectedSector.icmsRate / 100) : 0;
    const iss = selectedOperation.id === "servico" ? valorNumerico * (selectedSector.issRate / 100) : 0;
    const totalAtual = pis + cofins + icms + iss;

    // Cálculo reforma (alíquotas de referência estimadas para comparação)
    const cbsRef = valorNumerico * 0.088; // ~8.8% CBS referência
    const ibsRef = valorNumerico * 0.177; // ~17.7% IBS referência
    const totalReforma = cbsRef + ibsRef;

    setComparison({
      atual: {
        pis,
        cofins,
        icms,
        iss,
        total: totalAtual,
      },
      reforma: {
        cbs: cbsRef,
        ibs: ibsRef,
        total: totalReforma,
        aliquotaEfetiva: (totalReforma / valorNumerico) * 100,
      },
      diferenca: totalReforma - totalAtual,
    });
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentView("list");
    setResult(null);
    setComparison(null);
    setValor("");
  };

  if (currentView === "list") {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Calculadoras
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Ferramentas para cálculo e simulação tributária
          </Text>

          <View style={styles.calculatorsList}>
            <Pressable
              onPress={() => setCurrentView("ibs-cbs")}
              style={({ pressed }) => [
                styles.calculatorCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.cardPressed,
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.primary + "15" }]}>
                <IconSymbol name="calculator.fill" size={28} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  Calculadora IBS/CBS
                </Text>
                <Text style={[styles.cardDescription, { color: colors.muted }]}>
                  Calcule os novos tributos sobre suas operações
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => setCurrentView("comparativo")}
              style={({ pressed }) => [
                styles.calculatorCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.cardPressed,
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.accent + "15" }]}>
                <IconSymbol name="doc.text.fill" size={28} color={colors.accent} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  Comparativo Atual vs Reforma
                </Text>
                <Text style={[styles.cardDescription, { color: colors.muted }]}>
                  Compare a carga tributária antes e depois
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </Pressable>
          </View>

          <View style={[styles.infoBox, { backgroundColor: colors.warning + "15", borderColor: colors.warning }]}>
            <IconSymbol name="info.circle.fill" size={18} color={colors.warning} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              As alíquotas utilizadas são estimativas baseadas na LC 214/2024. Os valores finais podem variar conforme regulamentação.
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (currentView === "ibs-cbs") {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.right" size={20} color={colors.primary} style={{ transform: [{ rotate: "180deg" }] }} />
            <Text style={[styles.backText, { color: colors.primary }]}>Voltar</Text>
          </Pressable>

          <Text style={[styles.title, { color: colors.foreground }]}>
            Calculadora IBS/CBS
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Período de teste 2027 (alíquotas reduzidas)
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Valor da Operação (R$)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="0,00"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={valor}
                onChangeText={setValor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Tipo de Operação
              </Text>
              <View style={styles.optionsRow}>
                {OPERATION_TYPES.map((op) => (
                  <Pressable
                    key={op.id}
                    onPress={() => setSelectedOperation(op)}
                    style={[
                      styles.optionButton,
                      { borderColor: colors.border },
                      selectedOperation.id === op.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: selectedOperation.id === op.id ? "#FFFFFF" : colors.foreground },
                      ]}
                    >
                      {op.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleCalculate}
              style={({ pressed }) => [
                styles.calculateButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.calculateButtonText}>Calcular</Text>
            </Pressable>
          </View>

          {result && (
            <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.resultTitle, { color: colors.foreground }]}>
                Resultado
              </Text>
              
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.muted }]}>CBS (Federal)</Text>
                <Text style={[styles.resultValue, { color: colors.foreground }]}>
                  {formatCurrency(result.cbs)}
                </Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.muted }]}>IBS (Estadual/Municipal)</Text>
                <Text style={[styles.resultValue, { color: colors.foreground }]}>
                  {formatCurrency(result.ibs)}
                </Text>
              </View>
              
              <View style={[styles.resultRow, styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total de Tributos</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  {formatCurrency(result.total)}
                </Text>
              </View>
              
              <View style={[styles.aliquotaBox, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.aliquotaLabel, { color: colors.muted }]}>Alíquota Efetiva</Text>
                <Text style={[styles.aliquotaValue, { color: colors.primary }]}>
                  {result.aliquotaEfetiva.toFixed(2)}%
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Comparativo view
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.right" size={20} color={colors.primary} style={{ transform: [{ rotate: "180deg" }] }} />
          <Text style={[styles.backText, { color: colors.primary }]}>Voltar</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Comparativo
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Sistema atual vs Reforma Tributária
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Valor da Operação (R$)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              placeholder="0,00"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Setor
            </Text>
            <View style={styles.optionsGrid}>
              {SECTORS.map((sector) => (
                <Pressable
                  key={sector.id}
                  onPress={() => setSelectedSector(sector)}
                  style={[
                    styles.sectorButton,
                    { borderColor: colors.border },
                    selectedSector.id === sector.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: selectedSector.id === sector.id ? "#FFFFFF" : colors.foreground },
                    ]}
                  >
                    {sector.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={handleCompare}
            style={({ pressed }) => [
              styles.calculateButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.calculateButtonText}>Comparar</Text>
          </Pressable>
        </View>

        {comparison && (
          <View style={styles.comparisonContainer}>
            <View style={[styles.comparisonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.comparisonTitle, { color: colors.foreground }]}>
                Sistema Atual
              </Text>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.muted }]}>PIS</Text>
                <Text style={[styles.resultValue, { color: colors.foreground }]}>{formatCurrency(comparison.atual.pis)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.muted }]}>COFINS</Text>
                <Text style={[styles.resultValue, { color: colors.foreground }]}>{formatCurrency(comparison.atual.cofins)}</Text>
              </View>
              {comparison.atual.icms > 0 && (
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.muted }]}>ICMS</Text>
                  <Text style={[styles.resultValue, { color: colors.foreground }]}>{formatCurrency(comparison.atual.icms)}</Text>
                </View>
              )}
              {comparison.atual.iss > 0 && (
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.muted }]}>ISS</Text>
                  <Text style={[styles.resultValue, { color: colors.foreground }]}>{formatCurrency(comparison.atual.iss)}</Text>
                </View>
              )}
              <View style={[styles.resultRow, styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.error }]}>{formatCurrency(comparison.atual.total)}</Text>
              </View>
            </View>

            <View style={[styles.comparisonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.comparisonTitle, { color: colors.foreground }]}>
                Reforma Tributária
              </Text>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.muted }]}>CBS</Text>
                <Text style={[styles.resultValue, { color: colors.foreground }]}>{formatCurrency(comparison.reforma.cbs)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.muted }]}>IBS</Text>
                <Text style={[styles.resultValue, { color: colors.foreground }]}>{formatCurrency(comparison.reforma.ibs)}</Text>
              </View>
              <View style={[styles.resultRow, styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.success }]}>{formatCurrency(comparison.reforma.total)}</Text>
              </View>
            </View>

            <View style={[
              styles.differenceBox,
              { backgroundColor: comparison.diferenca > 0 ? colors.error + "15" : colors.success + "15" },
            ]}>
              <Text style={[styles.differenceLabel, { color: colors.foreground }]}>
                {comparison.diferenca > 0 ? "Aumento" : "Redução"} estimado
              </Text>
              <Text style={[
                styles.differenceValue,
                { color: comparison.diferenca > 0 ? colors.error : colors.success },
              ]}>
                {formatCurrency(Math.abs(comparison.diferenca))}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  calculatorsList: {
    gap: 12,
    marginBottom: 20,
  },
  calculatorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
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
  form: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  sectorButton: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  calculateButton: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  calculateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resultCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  resultLabel: {
    fontSize: 14,
  },
  resultValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  aliquotaBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  aliquotaLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  aliquotaValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  comparisonContainer: {
    gap: 16,
  },
  comparisonCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  differenceBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  differenceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  differenceValue: {
    fontSize: 22,
    fontWeight: "700",
  },
});
