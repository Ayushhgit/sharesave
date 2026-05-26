import { Component, type ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './ui/Text';

interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    if (__DEV__) {
      console.error('[Intent] ErrorBoundary caught', error, info.componentStack);
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <View className="flex-1 items-center justify-center bg-ink-50 dark:bg-ink-900 px-8">
        <Text className="text-5xl mb-4">😵‍💫</Text>
        <Text variant="title" className="text-center">
          Something broke.
        </Text>
        <Text variant="bodyMuted" className="text-center mt-2">
          {this.state.error.message}
        </Text>
        <Pressable
          onPress={this.reset}
          className="mt-6 px-5 h-12 rounded-2xl bg-ink-900 dark:bg-white items-center justify-center"
        >
          <Text className="text-white dark:text-ink-900 font-semibold">Try again</Text>
        </Pressable>
      </View>
    );
  }
}
