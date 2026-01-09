import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Platform,
  Switch,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  subtitle?: string;
  action?: () => void;
  showArrow?: boolean;
}

export default function ProfileScreen() {
  const colors = useColors();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogin = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoggedIn(false);
  };

  const menuItems: MenuItem[] = [
    {
      id: "plan",
      title: "Meu Plano",
      icon: "star.fill",
      subtitle: "Gratuito • 3 consultas/dia",
      showArrow: true,
    },
    {
      id: "notifications",
      title: "Notificações",
      icon: "bell.fill",
      subtitle: notificationsEnabled ? "Ativadas" : "Desativadas",
    },
    {
      id: "about",
      title: "Sobre o App",
      icon: "info.circle.fill",
      subtitle: "Versão 1.0.0",
      showArrow: true,
    },
    {
      id: "terms",
      title: "Termos de Uso",
      icon: "doc.text.fill",
      showArrow: true,
    },
    {
      id: "privacy",
      title: "Política de Privacidade",
      icon: "doc.text.fill",
      showArrow: true,
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Perfil
        </Text>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {isLoggedIn ? (
            <>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>U</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.foreground }]}>
                  Usuário
                </Text>
                <Text style={[styles.userEmail, { color: colors.muted }]}>
                  usuario@email.com
                </Text>
              </View>
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.logoutButton,
                  { borderColor: colors.error },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.logoutText, { color: colors.error }]}>
                  Sair
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
                <IconSymbol name="person.fill" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.foreground }]}>
                  Visitante
                </Text>
                <Text style={[styles.userEmail, { color: colors.muted }]}>
                  Faça login para salvar seu histórico
                </Text>
              </View>
              <Pressable
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.loginText}>Entrar</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Premium Banner */}
        <Pressable
          style={({ pressed }) => [
            styles.premiumBanner,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.95 },
          ]}
        >
          <View style={styles.premiumContent}>
            <IconSymbol name="star.fill" size={24} color="#FFFFFF" />
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>Upgrade para Premium</Text>
              <Text style={styles.premiumSubtitle}>
                Consultas ilimitadas, calculadoras avançadas e mais
              </Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
        </Pressable>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>3</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Consultas hoje</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Total de consultas</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {menuItems.map((item, index) => (
            <View key={item.id}>
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.foreground }]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={[styles.menuSubtitle, { color: colors.muted }]}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                {item.id === "notifications" ? (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                ) : item.showArrow ? (
                  <IconSymbol name="chevron.right" size={18} color={colors.muted} />
                ) : null}
              </Pressable>
              {index < menuItems.length - 1 && (
                <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Consulta Reforma Tributária
          </Text>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Versão 1.0.0 • 2026
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  loginButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "500",
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  premiumContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  premiumSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  menuContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    marginLeft: 62,
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
