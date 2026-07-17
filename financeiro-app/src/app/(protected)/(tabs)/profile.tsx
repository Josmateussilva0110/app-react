import { View, StyleSheet, useWindowDimensions } from "react-native";
import { AppShell } from "@/components/appShell"
import { ScreenWrapper } from "@/components/layout/screen-wrapper";
import { ProfileUserCard } from "../../../features/profile/components/profile-user-card";
import { ProfileGroupCard } from "../../../features/profile/components/profile-group-card";
import { ProfileThemeCard } from "../../../features/profile/components/profile-theme-card";
import { ProfileLogoutButton } from "../../../features/profile/components/profile-logout-button";

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <AppShell title="Perfil" subtitle="Gerencie suas preferências" showBack>
      <ScreenWrapper
        style={{
          paddingHorizontal: width < 380 ? 16 : 24,
          paddingTop: 24,
        }}
      >
        <View style={[styles.content, { maxWidth: isTablet ? 500 : 420 }]}>
          <ProfileUserCard />
          <ProfileGroupCard />
          <ProfileThemeCard />
          <ProfileLogoutButton />
        </View>
      </ScreenWrapper>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    alignSelf: "center",
    gap: 20,
  },
});