import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppButton,
  AppInput,
  BrandMark,
} from '@/src/components';
import {
  getRoleOption,
  roleOptions,
} from '@/src/constants/roles';
import { useAuthStore } from '@/src/store/auth.store';
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/src/theme';
import type { UserRole } from '@/src/types/auth';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const loginAsDemoRole = useAuthStore(
    (state) => state.loginAsDemoRole,
  );
  const isLoggingIn = useAuthStore(
    (state) => state.isLoggingIn,
  );

  const [employeeId, setEmployeeId] =
    useState('FULCH-DOC-001');
  const [password, setPassword] = useState('password');
  const [selectedRole, setSelectedRole] =
    useState<UserRole>('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [roleModalVisible, setRoleModalVisible] =
    useState(false);

  const selectedRoleOption = useMemo(
    () => getRoleOption(selectedRole),
    [selectedRole],
  );

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!employeeId.trim()) {
      Alert.alert(
        'Employee ID required',
        'Enter your employee ID or official hospital email address.',
      );

      return;
    }

    if (!password) {
      Alert.alert(
        'Password required',
        'Enter your account password.',
      );

      return;
    }

    const result = await login({
      employeeId,
      password,
      role: selectedRole,
    });

    if (!result.success) {
      Alert.alert('Login unsuccessful', result.message);
      return;
    }

    router.replace('/(app)');
  };

  const handleDemoLogin = async () => {
    const result = await loginAsDemoRole(selectedRole);

    if (!result.success) {
      Alert.alert('Demo login unavailable', result.message);
      return;
    }

    router.replace('/(app)');
  };

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    setRoleModalVisible(false);

    const accountCredentials: Partial<
      Record<UserRole, string>
    > = {
      administrator: 'FULCH-ADM-001',
      director: 'FULCH-DIR-001',
      records_officer: 'FULCH-REC-001',
      outpatient_nurse: 'FULCH-NUR-001',
      doctor: 'FULCH-DOC-001',
      laboratory_scientist: 'FULCH-LAB-001',
      pharmacist: 'FULCH-PHA-001',
    };

    setEmployeeId(accountCredentials[role] ?? '');
    setPassword('password');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[
          colors.primaryDeep,
          colors.primaryDark,
          '#086655',
        ]}
        style={styles.background}
      >
        <View style={styles.circleOne} />
        <View style={styles.circleTwo} />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'ios' ? 'padding' : undefined
            }
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.brandHeader}>
                  <BrandMark compact size={60} />

                  <View style={styles.brandText}>
                    <Text style={styles.brandTitle}>
                      FULafia Cottage Hospital
                    </Text>

                    <Text style={styles.brandSubtitle}>
                      Electronic Medical Records
                    </Text>
                  </View>

                  <Pressable
                    hitSlop={12}
                    onPress={() =>
                      router.replace('/connect-server')
                    }
                    style={styles.serverButton}
                  >
                    <Ionicons
                      color={colors.textOnPrimary}
                      name="server-outline"
                      size={22}
                    />
                  </Pressable>
                </View>

                <View style={styles.heading}>
                  <View style={styles.connectedBadge}>
                    <View style={styles.connectedDot} />

                    <Text style={styles.connectedText}>
                      HOSPITAL LAN CONNECTED
                    </Text>
                  </View>

                  <Text style={styles.title}>
                    Welcome back
                  </Text>

                  <Text style={styles.description}>
                    Sign in with your authorized hospital staff
                    account to continue.
                  </Text>
                </View>

                <View style={styles.loginCard}>
                  <Text style={styles.cardEyebrow}>
                    SECURE STAFF ACCESS
                  </Text>

                  <Text style={styles.cardTitle}>
                    Sign in to your workspace
                  </Text>

                  <View style={styles.form}>
                    <View style={styles.roleField}>
                      <Text style={styles.fieldLabel}>
                        Staff role
                      </Text>

                      <Pressable
                        onPress={() =>
                          setRoleModalVisible(true)
                        }
                        style={({ pressed }) => [
                          styles.roleSelector,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.roleIcon}>
                          <Ionicons
                            color={colors.primary}
                            name={selectedRoleOption.icon}
                            size={21}
                          />
                        </View>

                        <View style={styles.roleText}>
                          <Text style={styles.roleTitle}>
                            {selectedRoleOption.label}
                          </Text>

                          <Text style={styles.roleDepartment}>
                            {selectedRoleOption.department}
                          </Text>
                        </View>

                        <Ionicons
                          color={colors.textMuted}
                          name="chevron-down"
                          size={20}
                        />
                      </Pressable>
                    </View>

                    <AppInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      icon="person-outline"
                      label="Employee ID or email"
                      onChangeText={setEmployeeId}
                      placeholder="FULCH-DOC-001"
                      value={employeeId}
                    />

                    <View>
                      <AppInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="lock-closed-outline"
                        label="Password"
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry={!showPassword}
                        value={password}
                      />

                      <Pressable
                        hitSlop={12}
                        onPress={() =>
                          setShowPassword((current) => !current)
                        }
                        style={styles.passwordToggle}
                      >
                        <Ionicons
                          color={colors.textSecondary}
                          name={
                            showPassword
                              ? 'eye-off-outline'
                              : 'eye-outline'
                          }
                          size={21}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.loginActions}>
                    <AppButton
                      loading={isLoggingIn}
                      onPress={handleLogin}
                      title="Sign in securely"
                    />

                    <Pressable
                      onPress={handleDemoLogin}
                      style={({ pressed }) => [
                        styles.demoButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        color={colors.primary}
                        name="play-circle-outline"
                        size={21}
                      />

                      <Text style={styles.demoButtonText}>
                        Enter presentation mode
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.securityFooter}>
                    <Ionicons
                      color={colors.success}
                      name="shield-checkmark-outline"
                      size={18}
                    />

                    <Text style={styles.securityFooterText}>
                      Your session is protected and all activities
                      are recorded in the audit trail.
                    </Text>
                  </View>
                </View>

                <Text style={styles.footer}>
                  Authorized FULafia Cottage Hospital personnel
                  only
                </Text>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      <Modal
        animationType="slide"
        onRequestClose={() => setRoleModalVisible(false)}
        presentationStyle="pageSheet"
        visible={roleModalVisible}
      >
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                Select staff role
              </Text>

              <Text style={styles.modalDescription}>
                Your role controls the pages and actions
                available to you.
              </Text>
            </View>

            <Pressable
              hitSlop={12}
              onPress={() => setRoleModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons
                color={colors.textPrimary}
                name="close"
                size={24}
              />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.roleList}
            showsVerticalScrollIndicator={false}
          >
            {roleOptions.map((role) => {
              const isSelected =
                selectedRole === role.value;

              return (
                <Pressable
                  key={role.value}
                  onPress={() => selectRole(role.value)}
                  style={({ pressed }) => [
                    styles.roleOption,
                    isSelected &&
                      styles.selectedRoleOption,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.modalRoleIcon,
                      isSelected &&
                        styles.selectedModalRoleIcon,
                    ]}
                  >
                    <Ionicons
                      color={
                        isSelected
                          ? colors.textOnPrimary
                          : colors.primary
                      }
                      name={role.icon}
                      size={23}
                    />
                  </View>

                  <View style={styles.roleOptionText}>
                    <Text style={styles.roleOptionTitle}>
                      {role.label}
                    </Text>

                    <Text
                      style={styles.roleOptionDescription}
                    >
                      {role.department}
                    </Text>
                  </View>

                  {isSelected ? (
                    <Ionicons
                      color={colors.primary}
                      name="checkmark-circle"
                      size={23}
                    />
                  ) : (
                    <Ionicons
                      color={colors.textMuted}
                      name="chevron-forward"
                      size={20}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },

  background: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  brandTitle: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  brandSubtitle: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 11,
    marginTop: 2,
  },

  serverButton: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  heading: {
    marginTop: spacing.massive,
    marginBottom: spacing.xxl,
  },

  connectedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.secondary,
  },

  connectedText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.2,
  },

  title: {
    marginTop: spacing.lg,
    color: colors.textOnPrimary,
    fontSize: 36,
    lineHeight: 43,
    fontWeight: typography.weight.extraBold,
    letterSpacing: -1,
  },

  description: {
    marginTop: spacing.sm,
    maxWidth: 340,
    color: 'rgba(255,255,255,0.68)',
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },

  loginCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.large,
  },

  cardEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.4,
  },

  cardTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.sectionTitle,
    lineHeight: typography.lineHeight.sectionTitle,
    fontWeight: typography.weight.bold,
  },

  form: {
    gap: spacing.lg,
    marginTop: spacing.xxl,
  },

  roleField: {
    gap: spacing.sm,
  },

  fieldLabel: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.semibold,
  },

  roleSelector: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  roleText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  roleTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  roleDepartment: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    marginTop: 2,
  },

  passwordToggle: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 17,
  },

  loginActions: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },

  demoButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },

  demoButtonText: {
    color: colors.primaryDark,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  securityFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  securityFooterText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  footer: {
    marginTop: spacing.xxl,
    color: 'rgba(255,255,255,0.5)',
    fontSize: typography.size.caption,
    textAlign: 'center',
  },

  circleOne: {
    position: 'absolute',
    top: -120,
    right: -130,
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  circleTwo: {
    position: 'absolute',
    bottom: -170,
    left: -130,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },

  pressed: {
    opacity: 0.72,
  },

  modalScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },

  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.bold,
  },

  modalDescription: {
    maxWidth: 290,
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  closeButton: {
    width: 42,
    height: 42,
    marginLeft: 'auto',
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  roleList: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
    gap: spacing.md,
  },

  roleOption: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  selectedRoleOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  modalRoleIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  selectedModalRoleIcon: {
    backgroundColor: colors.primary,
  },

  roleOptionText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  roleOptionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  roleOptionDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },
});