import { BrandMark } from '@/src/components';
import { colors, spacing, typography } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SPLASH_DURATION = 2800;

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(18)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const loaderWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entranceAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          damping: 12,
          stiffness: 110,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    entranceAnimation.start();

    Animated.timing(loaderWidth, {
      toValue: 1,
      duration: SPLASH_DURATION - 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const navigationTimer = setTimeout(() => {
      router.replace('/connect-server');
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(navigationTimer);
      entranceAnimation.stop();
      loaderWidth.stopAnimation();
    };
  }, [
    contentOpacity,
    contentTranslateY,
    loaderWidth,
    logoOpacity,
    logoScale,
  ]);

  const animatedLoaderWidth = loaderWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '100%'],
  });

  return (
    <LinearGradient
      colors={[
        colors.primaryDeep,
        colors.primaryDark,
        '#086655',
      ]}
      locations={[0, 0.52, 1]}
      style={styles.container}
    >
      <StatusBar style="light" />

      <View style={styles.decorativeCircleTop} />
      <View style={styles.decorativeCircleBottom} />
      <View style={styles.decorativeLine} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <BrandMark size={108} />
          </Animated.View>

          <Animated.View
            style={[
              styles.textContent,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            <View style={styles.institutionBadge}>
              <View style={styles.badgeDot} />

              <Text style={styles.institutionBadgeText}>
                FEDERAL UNIVERSITY OF LAFIA
              </Text>
            </View>

            <Text style={styles.title}>
              Cottage Hospital
              {'\n'}
              <Text style={styles.titleHighlight}>EMR</Text>
            </Text>

            <Text style={styles.description}>
              Electronic Medical Records and integrated hospital workflow
              management.
            </Text>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <View style={styles.loaderTrack}>
            <Animated.View
              style={[
                styles.loaderProgress,
                {
                  width: animatedLoaderWidth,
                },
              ]}
            />
          </View>

          <View style={styles.localSystemRow}>
            <View style={styles.localSystemDot} />

            <Text style={styles.localSystemText}>
              SECURE LOCAL HOSPITAL SYSTEM
            </Text>
          </View>

          <Text style={styles.footerText}>
            Patient care from registration to discharge
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.massive,
    paddingBottom: spacing.xxl,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 72,
  },

  logoWrapper: {
    marginBottom: spacing.xxxl,
  },

  textContent: {
    width: '100%',
    alignItems: 'center',
  },

  institutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.xl,
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.secondary,
  },

  institutionBadgeText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.6,
  },

  title: {
    color: colors.textOnPrimary,
    fontSize: typography.size.displayLarge,
    lineHeight: typography.lineHeight.displayLarge,
    fontWeight: typography.weight.extraBold,
    textAlign: 'center',
    letterSpacing: -1.4,
  },

  titleHighlight: {
    color: colors.secondary,
  },

  description: {
    maxWidth: 330,
    marginTop: spacing.lg,
    color: 'rgba(255,255,255,0.72)',
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    textAlign: 'center',
  },

  footer: {
    alignItems: 'center',
  },

  loaderTrack: {
    width: 144,
    height: 4,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: spacing.xl,
  },

  loaderProgress: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: colors.secondary,
  },

  localSystemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  localSystemDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.secondary,
  },

  localSystemText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.6,
  },

  footerText: {
    marginTop: spacing.sm,
    color: 'rgba(255,255,255,0.48)',
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textAlign: 'center',
  },

  decorativeCircleTop: {
    position: 'absolute',
    top: -170,
    right: -160,
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.025)',
  },

  decorativeCircleBottom: {
    position: 'absolute',
    bottom: -230,
    left: -180,
    width: 430,
    height: 430,
    borderRadius: 215,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  decorativeLine: {
    position: 'absolute',
    left: -80,
    top: '37%',
    width: 300,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '-32deg' }],
  },
});