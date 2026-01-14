import { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface UF {
  sigla: string;
  nome: string;
  codigo: number;
}

interface AliquotaResult {
  aliquotaReferencia: number;
  aliquotaPropria: number;
}

interface NCMResult {
  tributadoPeloImpostoSeletivo: boolean;
  aliquotaAdValorem?: number;
  capitulo: string;
  posicao: string;
  subitem: string;
}

const API_BASE = "/api/receita-federal";

export default function CalculadoraOficialScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para consultas
  const [ufs, setUfs] = useState<UF[]>([]);
  const [selectedUf, setSelectedUf] = useState<UF | null>(null);
  const [data, setData] = useState("2027-01-01");
  const [ncm, setNcm] = useState("");
  const [valor, setValor] = useState("");
  
  // Resultados
  const [aliquotaCBS, setAliquotaCBS] = useState<AliquotaResult | null>(null);
  const [aliquotaIBS, setAliquotaIBS] = useState<AliquotaResult | null>(null);
  const [ncmInfo, setNcmInfo] = useState<NCMResult | null>(null);
  const [calculoFinal, setCalculoFinal] = useState<any>(null);

  // Carregar UFs ao montar
  useEffect(() => {
    fetchUFs();
  }, []);

  const fetchUFs = async () => {
    try {
      const response = await fetch(`${API_BASE}?endpoint=ufs`);
      const result = await response.json();
      if (result.success) {
        setUfs(result.data);
        // Selecionar SP por padrão
        const sp = result.data.find((uf: UF) => uf.sigla === "SP");
        if (sp) setSelectedUf(sp);
      }
    } catch (err) {
      console.error("Erro ao carregar UFs:", err);
    }
  };

  const fetchAliquotas = async () => {
    if (!selectedUf) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar alíquota CBS (União)
      const cbsResponse = await fetch(`${API_BASE}?endpoint=aliquota-uniao&data=${data}`);
      const cbsResult = await cbsResponse.json();
      if (cbsResult.success) {
        setAliquotaCBS(cbsResult.data);
      }

      // Buscar alíquota IBS (Estadual)
      const ibsResponse = await fetch(`${API_BASE}?endpoint=aliquota-uf&data=${data}&codigoUf=${selectedUf.codigo}`);
      const ibsResult = await ibsResponse.json();
      if (ibsResult.success) {
        setAliquotaIBS(ibsResult.data);
      }

      // Se tiver NCM, buscar informações
      if (ncm.length >= 8) {
        const ncmResponse = await fetch(`${API_BASE}?endpoint=ncm&ncm=${ncm}&data=${data}`);
        const ncmResult = await ncmResponse.json();
        if (ncmResult.success) {
          setNcmInfo(ncmResult.data);
        }
      }

    } catch (err: any) {
      setError(err.message || "Erro ao consultar API da Receita Federal");
    } finally {
      setLoading(false);
    }
  };

  const calcularTributos = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    if (valorNumerico <= 0 || !aliquotaCBS || !aliquotaIBS) return;

    const cbsValor = valorNumerico * (aliquotaCBS.aliquotaReferencia / 100);
    const ibsValor = valorNumerico * (aliquotaIBS.aliquotaReferencia / 100);
    let isValor = 0;

    if (ncmInfo?.tributadoPeloImpostoSeletivo && ncmInfo.aliquotaAdValorem) {
      isValor = valorNumerico * (ncmInfo.aliquotaAdValorem / 100);
    }

    const totalTributos = cbsValor + ibsValor + isValor;
    const aliquotaEfetiva = (totalTributos / valorNumerico) * 100;

    setCalculoFinal({
      valorBase: valorNumerico,
      cbs: {
        aliquota: aliquotaCBS.aliquotaReferencia,
        valor: cbsValor,
      },
      ibs: {
        aliquota: aliquotaIBS.aliquotaReferencia,
        valor: ibsValor,
      },
      is: ncmInfo?.tributadoPeloImpostoSeletivo ? {
        aliquota: ncmInfo.aliquotaAdValorem || 0,
        valor: isValor,
      } : null,
      total: totalTributos,
      aliquotaEfetiva,
    });
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.right" size={20} color={colors.primary} style={{ transform: [{ rotate: "180deg" }] }} />
          <Text style={[styles.backText, { color: colors.primary }]}>Voltar</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Calculadora Oficial
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Integrada com a API da Receita Federal
        </Text>

        <View style={[styles.badge, { backgroundColor: colors.success + "20" }]}>
          <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
          <Text style={[styles.badgeText, { color: colors.success }]}>
            Dados oficiais da Receita Federal
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Data de Referência
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dateOptions}>
              {["2026-01-01", "2027-01-01", "2028-01-01", "2029-01-01", "2030-01-01", "2031-01-01", "2032-01-01", "2033-01-01"].map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setData(d)}
                  style={[
                    styles.dateButton,
                    { borderColor: colors.border },
                    data === d && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.dateText, { color: data === d ? "#FFF" : colors.foreground }]}>
                    {d.split("-")[0]}
                  </Text>
                </Pressable>
              ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Estado (UF)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ufScroll}>
              {ufs.map((uf) => (
                <Pressable
                  key={uf.codigo}
                  onPress={() => setSelectedUf(uf)}
                  style={[
                    styles.ufButton,
                    { borderColor: colors.border },
                    selectedUf?.codigo === uf.codigo && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.ufText, { color: selectedUf?.codigo === uf.codigo ? "#FFF" : colors.foreground }]}>
                    {uf.sigla}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              NCM do Produto (opcional)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Ex: 22021000 (refrigerantes)"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={ncm}
              onChangeText={setNcm}
              maxLength={8}
            />
          </View>

          <Pressable
            onPress={fetchAliquotas}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.accent },
              pressed && { opacity: 0.9 },
              loading && { opacity: 0.6 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Consultar Alíquotas</Text>
            )}
          </Pressable>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.error + "15" }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          {/* Resultados das Alíquotas */}
          {aliquotaCBS && aliquotaIBS && (
            <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.resultTitle, { color: colors.foreground }]}>
                Alíquotas Oficiais ({data.split("-")[0]})
              </Text>

              <View style={styles.aliquotaRow}>
                <View style={styles.aliquotaItem}>
                  <Text style={[styles.aliquotaLabel, { color: colors.muted }]}>CBS (União)</Text>
                  <Text style={[styles.aliquotaValue, { color: colors.primary }]}>
                    {aliquotaCBS.aliquotaReferencia}%
                  </Text>
                </View>
                <View style={styles.aliquotaItem}>
                  <Text style={[styles.aliquotaLabel, { color: colors.muted }]}>IBS ({selectedUf?.sigla})</Text>
                  <Text style={[styles.aliquotaValue, { color: colors.accent }]}>
                    {aliquotaIBS.aliquotaReferencia}%
                  </Text>
                </View>
              </View>

              {ncmInfo && (
                <View style={[styles.ncmBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.ncmTitle, { color: colors.foreground }]}>
                    Informações do NCM
                  </Text>
                  <Text style={[styles.ncmText, { color: colors.muted }]}>
                    {ncmInfo.subitem}
                  </Text>
                  {ncmInfo.tributadoPeloImpostoSeletivo && (
                    <View style={[styles.isAlert, { backgroundColor: colors.warning + "20" }]}>
                      <IconSymbol name="info.circle.fill" size={16} color={colors.warning} />
                      <Text style={[styles.isText, { color: colors.warning }]}>
                        Imposto Seletivo: {ncmInfo.aliquotaAdValorem}%
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Campo de valor para cálculo */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  Valor da Operação (R$)
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="0,00"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={valor}
                  onChangeText={setValor}
                />
              </View>

              <Pressable
                onPress={calcularTributos}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.buttonText}>Calcular Tributos</Text>
              </Pressable>
            </View>
          )}

          {/* Resultado do Cálculo */}
          {calculoFinal && (
            <View style={[styles.finalResult, { backgroundColor: colors.primary + "10", borderColor: colors.primary }]}>
              <Text style={[styles.finalTitle, { color: colors.foreground }]}>
                Cálculo Final
              </Text>

              <View style={styles.finalRow}>
                <Text style={[styles.finalLabel, { color: colors.muted }]}>Valor Base</Text>
                <Text style={[styles.finalValue, { color: colors.foreground }]}>
                  {formatCurrency(calculoFinal.valorBase)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.finalRow}>
                <Text style={[styles.finalLabel, { color: colors.muted }]}>
                  CBS ({calculoFinal.cbs.aliquota}%)
                </Text>
                <Text style={[styles.finalValue, { color: colors.foreground }]}>
                  {formatCurrency(calculoFinal.cbs.valor)}
                </Text>
              </View>

              <View style={styles.finalRow}>
                <Text style={[styles.finalLabel, { color: colors.muted }]}>
                  IBS ({calculoFinal.ibs.aliquota}%)
                </Text>
                <Text style={[styles.finalValue, { color: colors.foreground }]}>
                  {formatCurrency(calculoFinal.ibs.valor)}
                </Text>
              </View>

              {calculoFinal.is && (
                <View style={styles.finalRow}>
                  <Text style={[styles.finalLabel, { color: colors.warning }]}>
                    Imposto Seletivo ({calculoFinal.is.aliquota}%)
                  </Text>
                  <Text style={[styles.finalValue, { color: colors.warning }]}>
                    {formatCurrency(calculoFinal.is.valor)}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.finalRow}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>
                  Total de Tributos
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  {formatCurrency(calculoFinal.total)}
                </Text>
              </View>

              <View style={[styles.aliquotaEfetiva, { backgroundColor: colors.primary }]}>
                <Text style={styles.aliquotaEfetivaLabel}>Alíquota Efetiva</Text>
                <Text style={styles.aliquotaEfetivaValue}>
                  {calculoFinal.aliquotaEfetiva.toFixed(2)}%
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Fonte: Receita Federal do Brasil - Calculadora de Tributos
          </Text>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            piloto-cbs.tributos.gov.br
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  dateOptions: {
    flexDirection: "row",
    gap: 8,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  ufScroll: {
    flexDirection: "row",
  },
  ufButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  ufText: {
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
  },
  resultCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    gap: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  aliquotaRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  aliquotaItem: {
    alignItems: "center",
  },
  aliquotaLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  aliquotaValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  ncmBox: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  ncmTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  ncmText: {
    fontSize: 13,
  },
  isAlert: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  isText: {
    fontSize: 13,
    fontWeight: "600",
  },
  finalResult: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginTop: 16,
    gap: 12,
  },
  finalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  finalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  finalLabel: {
    fontSize: 14,
  },
  finalValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  aliquotaEfetiva: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  aliquotaEfetivaLabel: {
    color: "#FFF",
    fontSize: 13,
    opacity: 0.9,
  },
  aliquotaEfetivaValue: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});
