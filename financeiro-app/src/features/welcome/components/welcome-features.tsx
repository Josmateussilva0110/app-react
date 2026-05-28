import { View, StyleSheet } from "react-native";
import { WelcomeFeatureCard } from "./welcome-feature-card";
import { WELCOME_FEATURES } from "../constants/welcome-constants";

export function WelcomeFeatures() {
  return (
    <View style={styles.container}>
      {WELCOME_FEATURES.map((feature) => (
        <WelcomeFeatureCard key={feature.title} {...feature} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    gap: 12,
  },
});
