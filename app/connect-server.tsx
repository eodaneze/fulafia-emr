import {
  AppButton,
  AppInput,
  BrandMark,
} from '@/src/components';
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ConnectionState = 'idle' | 'testing' | 'connected' | 'failed';

export default function ConnectServerScreen() {
  const [serverAddress, setServerAddress] = useState('192.168.1.50');
  const [serverPort, setServerPort] = useState('2028');
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('idle');

  const isConnected = connectionState === 'connected';
  const isTesting = connectionState === 'testing';

  const connectionUrl = useMemo(() => {
    return `http://${serverAddress.trim()}:${serverPort.trim()}`;
  }, [serverAddress, serverPort]);

  const testConnection = () => {
    Keyboard.dismiss();

    if (!serverAddress.trim()) {
      Alert.alert(
        'Server address required',
        'Enter the local IP address of the hospital server.',
      );

      return;
    }

    if (!serverPort.trim()) {
      Alert.alert(
        'Server port required',
        'Enter the port being used by the hospital server.',
      );

      return;
    }

    setConnectionState('testing');

    setTimeout(() => {
      setConnectionState('connected');
    }, 1500);
  };

  const continueToLogin = () => {
    Alert.alert(
      'Connection saved',
      'The login screen will be implemented in the next step.',
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[
          colors.primaryDeep,
          colors.primaryDark,
          '#086856',
        ]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerNavigation}>
              <View style={styles.miniBrand}>
                <BrandMark size={48} compact />

                <View>
                  <Text style={styles.miniBrandTitle}>
                    FULafia Hospital
                  </Text>

                  <Text style={styles.miniBrandSubtitle}>
                    Electronic Medical Records
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open connection help"
                hitSlop={12}
                onPress={() =>
                  Alert.alert(
                    'Local network connection',
                    'Your phone and the hospital server must be connected to the same local Wi-Fi network.',
                  )
                }
                style={styles.helpButton}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={25}
                  color={colors.textOnPrimary}
                />
              </Pressable>
            </View>

            <View style={styles.headerTextContent}>
              <View style={styles.headerIconContainer}>
                <Ionicons
                  name="wifi"
                  size={27}
                  color={colors.primaryDark}
                />
              </View>

              <Text style={styles.headerTitle}>
                Connect to the hospital network
              </Text>

              <Text style={styles.headerDescription}>
                Link this device to the secure FULafia Cottage Hospital
                server through the local area network.
              </Text>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.securityNotice}>
              <View style={styles.securityIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>
                  Secure local connection
                </Text>

                <Text style={styles.securityDescription}>
                  Patient records remain within the hospital network and
                  daily operations can continue without public internet.
                </Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <View style={styles.formHeadingRow}>
                <View>
                  <Text style={styles.formEyebrow}>
                    SERVER CONFIGURATION
                  </Text>

                  <Text style={styles.formTitle}>
                    Hospital server details
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isConnected && styles.connectedStatusBadge,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      isConnected && styles.connectedStatusDot,
                    ]}
                  />

                  <Text
                    style={[
                      styles.statusText,
                      isConnected && styles.connectedStatusText,
                    ]}
                  >
                    {isConnected ? 'Connected' : 'Not connected'}
                  </Text>
                </View>
              </View>

              <View style={styles.formFields}>
                <AppInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="server-outline"
                  keyboardType="numbers-and-punctuation"
                  label="Server IP address"
                  onChangeText={(value) => {
                    setServerAddress(value);
                    setConnectionState('idle');
                  }}
                  placeholder="192.168.1.50"
                  value={serverAddress}
                />

                <AppInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="git-network-outline"
                  keyboardType="number-pad"
                  label="Server port"
                  maxLength={5}
                  onChangeText={(value) => {
                    setServerPort(value.replace(/\D/g, ''));
                    setConnectionState('idle');
                  }}
                  placeholder="2028"
                  value={serverPort}
                />
              </View>

              <View style={styles.connectionPreview}>
                <Ionicons
                  name="link-outline"
                  size={18}
                  color={colors.textSecondary}
                />

                <Text
                  numberOfLines={1}
                  style={styles.connectionPreviewText}
                >
                  {connectionUrl}
                </Text>
              </View>

              {isConnected ? (
                <View style={styles.successCard}>
                  <View style={styles.successIcon}>
                    <Ionicons
                      name="checkmark"
                      size={21}
                      color={colors.textOnPrimary}
                    />
                  </View>

                  <View style={styles.successContent}>
                    <Text style={styles.successTitle}>
                      Hospital server found
                    </Text>

                    <Text style={styles.successDescription}>
                      Federal University of Lafia Cottage Hospital
                    </Text>

                    <View style={styles.successMetaRow}>
                      <View style={styles.successMetaItem}>
                        <View style={styles.onlineDot} />

                        <Text style={styles.successMetaText}>
                          Server online
                        </Text>
                      </View>

                      <View style={styles.successDivider} />

                      <View style={styles.successMetaItem}>
                        <Ionicons
                          name="server-outline"
                          size={14}
                          color={colors.success}
                        />

                        <Text style={styles.successMetaText}>
                          Database ready
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : null}

              <View style={styles.buttonContainer}>
                {isConnected ? (
                  <>
                    <AppButton
                      onPress={continueToLogin}
                      title="Continue to login"
                    />

                    <AppButton
                      onPress={() => setConnectionState('idle')}
                      title="Use another server"
                      variant="ghost"
                    />
                  </>
                ) : (
                  <AppButton
                    loading={isTesting}
                    onPress={testConnection}
                    title={
                      isTesting
                        ? 'Testing connection...'
                        : 'Test server connection'
                    }
                  />
                )}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  'QR server setup',
                  'QR server configuration will be added after the authentication flow.',
                )
              }
              style={({ pressed }) => [
                styles.qrButton,
                pressed && styles.qrButtonPressed,
              ]}
            >
              <View style={styles.qrIconContainer}>
                <Ionicons
                  name="qr-code-outline"
                  size={25}
                  color={colors.primary}
                />
              </View>

              <View style={styles.qrTextContainer}>
                <Text style={styles.qrTitle}>
                  Scan server QR code
                </Text>

                <Text style={styles.qrDescription}>
                  Quickly configure this device using a QR code provided
                  by the hospital administrator.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={21}
                color={colors.textMuted}
              />
            </Pressable>

            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>
                Before connecting
              </Text>

              <RequirementItem text="Connect this device to the hospital Wi-Fi." />
              <RequirementItem text="Ensure the local server is switched on." />
              <RequirementItem text="Get the server address from the system administrator." />
            </View>

            <Text style={styles.footerText}>
              FULafia Cottage Hospital EMR • Local Network Edition
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

type RequirementItemProps = {
  text: string;
};

function RequirementItem({ text }: RequirementItemProps) {
  return (
    <View style={styles.requirementItem}>
      <View style={styles.requirementCheck}>
        <Ionicons
          name="checkmark"
          size={13}
          color={colors.primary}
        />
      </View>

      <Text style={styles.requirementText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    overflow: 'hidden',
    paddingBottom: spacing.xxxl,
  },

  headerContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
  },

  headerNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  miniBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  miniBrandTitle: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  miniBrandSubtitle: {
    marginTop: 1,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
  },

  helpButton: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  headerTextContent: {
    marginTop: spacing.xxxl,
    maxWidth: 350,
  },

  headerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    marginBottom: spacing.xl,
  },

  headerTitle: {
    color: colors.textOnPrimary,
    fontSize: typography.size.screenTitle,
    lineHeight: typography.lineHeight.screenTitle,
    fontWeight: typography.weight.extraBold,
    letterSpacing: -0.7,
  },

  headerDescription: {
    marginTop: spacing.md,
    color: 'rgba(255,255,255,0.68)',
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },

  headerCircleOne: {
    position: 'absolute',
    right: -100,
    top: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  headerCircleTwo: {
    position: 'absolute',
    right: -20,
    bottom: -110,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing.massive,
  },

  securityNotice: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#C8EAE1',
    marginBottom: spacing.xl,
  },

  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  securityTextContainer: {
    flex: 1,
  },

  securityTitle: {
    color: colors.primaryDark,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  securityDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  formCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },

  formHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  formEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.4,
  },

  formTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceMuted,
  },

  connectedStatusBadge: {
    backgroundColor: colors.successSoft,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.textMuted,
  },

  connectedStatusDot: {
    backgroundColor: colors.success,
  },

  statusText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },

  connectedStatusText: {
    color: colors.success,
  },

  formFields: {
    gap: spacing.lg,
    marginTop: spacing.xxl,
  },

  connectionPreview: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },

  connectionPreviewText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },

  successCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#BCE6D1',
    backgroundColor: colors.successSoft,
  },

  successIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
  },

  successContent: {
    flex: 1,
  },

  successTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  successDescription: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  successMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  successMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  successMetaText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },

  successDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#B8DCCB',
  },

  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },

  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  qrButtonPressed: {
    opacity: 0.72,
  },

  qrIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  qrTextContainer: {
    flex: 1,
  },

  qrTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  qrDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  requirements: {
    marginTop: spacing.xxxl,
  },

  requirementsTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
  },

  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  requirementCheck: {
    width: 22,
    height: 22,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginTop: 1,
  },

  requirementText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  footerText: {
    marginTop: spacing.xxxl,
    color: colors.textMuted,
    fontSize: typography.size.caption,
    textAlign: 'center',
  },
});