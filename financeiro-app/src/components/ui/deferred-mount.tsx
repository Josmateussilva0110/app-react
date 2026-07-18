import { useEffect, useState, type ReactNode } from "react";
import { InteractionManager, View, type ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  placeholderMinHeight?: number;
  style?: ViewStyle;
};

/** Adia a montagem de filhos pesados até após animações/interações iniciais. */
export function DeferredMount({
  children,
  placeholderMinHeight = 180,
  style,
}: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });

    return () => task.cancel();
  }, []);

  if (!ready) {
    return <View style={[{ minHeight: placeholderMinHeight }, style]} />;
  }

  return <>{children}</>;
}
