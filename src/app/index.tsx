  // @ts-nocheck
  /**
 * NOEGIS (Mind-Shield) — Android digital wellness prototype
 * Single-file Expo / React Native app. Paste into App.js and run in Expo Go.
 *
 * Only native components + StyleSheet + @expo/vector-icons (bundled with Expo).
 * Navigation is plain React state; the sidebar drawer is the "Claude-style"
 * left panel and the right-hand area is the workflow area.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */
const C = {
  bg: '#0B0F19',
  card: '#151D2F',
  border: '#1E293B',
  mint: '#00F5D4',
  green: '#10B981',
  rose: '#F43F5E',
  text: '#F8FAFC',
  muted: '#94A3B8',
  amber: '#FBBF24',
  violet: '#A78BFA',
  sky: '#38BDF8',
  mintSoft: 'rgba(0,245,212,0.12)',
  roseSoft: 'rgba(244,63,94,0.14)',
  greenSoft: 'rgba(16,185,129,0.16)',
};

const { width: SCREEN_W } = Dimensions.get('window');
const DRAWER_W = Math.min(310, Math.round(SCREEN_W * 0.82));
const TOP_INSET = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
const CHALLENGE_PHRASE = 'I am choosing to ignore my goal';

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */
const HABITS = [
  { key: 'doom', label: 'Doomscrolling (Shorts/Reels)', sub: 'Endless short-form video loops', icon: 'phone-portrait-outline' },
  { key: 'gaming', label: 'Binge Gaming', sub: 'Sessions that swallow whole evenings', icon: 'game-controller-outline' },
  { key: 'night', label: 'Late-Night Browsing', sub: 'Screens after midnight', icon: 'moon-outline' },
  { key: 'adult', label: 'Adult Content', sub: 'Handled privately, never uploaded', icon: 'eye-off-outline' },
];

const TELEMETRY = [
  { name: 'YouTube', icon: 'logo-youtube', color: C.rose, used: 54, limit: 45 },
  { name: 'Instagram', icon: 'logo-instagram', color: C.violet, used: 38, limit: 45 },
  { name: 'Chrome', icon: 'logo-chrome', color: C.sky, used: 22, limit: 45 },
];

// streak row: 'ok' goal met, 'bad' limit breached, 'todo' not yet
const WEEK = [
  { d: 'Mon', n: 5, s: 'ok' },
  { d: 'Tue', n: 6, s: 'ok' },
  { d: 'Wed', n: 7, s: 'bad' },
  { d: 'Thu', n: 8, s: 'ok' },
  { d: 'Fri', n: 9, s: 'todo' },
  { d: 'Sat', n: 10, s: 'todo' },
  { d: 'Sun', n: 11, s: 'todo' },
];
const TODAY_INDEX = 3;

const REPORT_DAYS = [
  { d: 'M', base: 190, now: 170 },
  { d: 'T', base: 200, now: 150 },
  { d: 'W', base: 185, now: 175 },
  { d: 'T', base: 210, now: 140 },
  { d: 'F', base: 220, now: 160 },
  { d: 'S', base: 260, now: 215 },
  { d: 'S', base: 240, now: 190 },
];

const RECENTS = [
  { id: 'r1', title: 'Shorts loop at 11:42 PM', icon: 'logo-youtube' },
  { id: 'r2', title: 'Reels session, bypass declined', icon: 'logo-instagram' },
  { id: 'r3', title: 'Late-night Chrome browsing', icon: 'logo-chrome' },
];

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home-outline' },
  { key: 'report', label: 'Weekly report', icon: 'bar-chart-outline' },
  { key: 'monk', label: 'Monk mode', icon: 'leaf-outline' },
  { key: 'assessments', label: 'Assessments', icon: 'clipboard-outline' },
  { key: 'onboarding', label: 'Setup & onboarding', icon: 'shield-checkmark-outline' },
];

const ANCHORS = [
  { icon: 'people', label: 'Family dinner, last Diwali', color: C.amber },
  { icon: 'trail-sign', label: 'The Himalaya trek I am training for', color: C.sky },
  { icon: 'school', label: 'My exam hall, 8 weeks away', color: C.violet },
];

const OPTIONS_STD = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
const OPTIONS_ASRS = ['Never', 'Rarely', 'Sometimes', 'Often'];

const ASSESSMENTS = [
  {
    key: 'gad7',
    name: 'GAD-7',
    full: 'General Anxiety Scale',
    time: '3 mins',
    icon: 'pulse-outline',
    color: C.sky,
    desc: 'Screens for generalized anxiety by looking at how often worry has interfered with the past two weeks.',
    options: OPTIONS_STD,
    questions: [
      'Feeling nervous, anxious or on edge',
      'Not being able to stop or control worrying',
      'Trouble relaxing',
    ],
  },
  {
    key: 'phq9',
    name: 'PHQ-9',
    full: 'Depression Screen',
    time: '4 mins',
    icon: 'cloudy-night-outline',
    color: C.violet,
    desc: 'A short screen for low mood and loss of interest, often linked to late-night scrolling patterns.',
    options: OPTIONS_STD,
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
    ],
  },
  {
    key: 'asrs',
    name: 'ASRS v1.1',
    full: 'ADHD Impulse Regulation',
    time: '3 mins',
    icon: 'flash-outline',
    color: C.amber,
    desc: 'Checks attention and impulse regulation, which helps tune how firm your friction should be.',
    options: OPTIONS_ASRS,
    questions: [
      'How often do you have trouble wrapping up the final details of a project?',
      'How often do you feel restless or fidgety when you have to sit for a long time?',
      'How often do you reach for your phone without deciding to?',
    ],
  },
];

const MONK_DURATIONS = [
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 },
];

const MONK_APPS = [
  { key: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: C.violet },
  { key: 'youtube', name: 'YouTube', icon: 'logo-youtube', color: C.rose },
  { key: 'games', name: 'Games', icon: 'game-controller-outline', color: C.green },
  { key: 'reddit', name: 'Reddit', icon: 'logo-reddit', color: C.amber },
];

const GROUND_PROMPTS = [
  'Stay grounded. Feel your feet on the floor and let one slow breath out.',
  'The urge will crest and pass. You do not have to obey it.',
  'Name three things you can see right now. Then return to what matters.',
  'You chose this hour on purpose. That choice is still yours.',
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const fmtClock = (secs) => {
  const s = Math.max(0, secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/* ------------------------------------------------------------------ */
/* Small shared components                                             */
/* ------------------------------------------------------------------ */
function PulseDot({ color = C.green, size = 8 }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(a, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] });
  const opacity = a.interpolate({ inputRange: [0, 1], outputRange: [0.65, 0] });
  const box = size * 3;
  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        }}
      />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

function SectionTitle({ title, right }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionTitle}>{title}</Text>
      {right ? <Text style={s.sectionRight}>{right}</Text> : null}
    </View>
  );
}

function PrimaryButton({ label, onPress, icon, disabled, tone = 'mint', style }) {
  const bg = tone === 'rose' ? C.rose : C.mint;
  const fg = tone === 'rose' ? C.text : C.bg;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[s.primaryBtn, { backgroundColor: bg }, disabled && s.btnDisabled, style]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
      <Text style={[s.primaryBtnText, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function GhostButton({ label, onPress, icon, style }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[s.ghostBtn, style]}>
      {icon ? <Ionicons name={icon} size={16} color={C.mint} style={{ marginRight: 6 }} /> : null}
      <Text style={s.ghostBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatTile({ icon, value, label, tint }) {
  return (
    <View style={[s.statTile, { backgroundColor: tint }]}>
      <Ionicons name={icon} size={18} color={C.text} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Header + Sidebar drawer                                             */
/* ------------------------------------------------------------------ */
function Header({ onMenu, hasAlerts }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onMenu} style={s.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="menu" size={26} color={C.text} />
      </TouchableOpacity>
      <View style={s.brandRow}>
        <Ionicons name="shield-checkmark" size={20} color={C.mint} />
        <Text style={s.brandText}>Noegis</Text>
      </View>
      <TouchableOpacity style={s.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="notifications-outline" size={24} color={C.text} />
        {hasAlerts ? <View style={s.bellDot} /> : null}
      </TouchableOpacity>
    </View>
  );
}

function Drawer({ open, onClose, current, onNavigate, onSimulate, profile, statusLabel, statusColor }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-DRAWER_W, 0] });
  const scrimOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const name = profile.name.trim() || 'Alex';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, s.scrim, { opacity: scrimOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[s.drawer, { width: DRAWER_W, transform: [{ translateX }] }]}>
        <View style={s.drawerTop}>
          <View style={s.brandRow}>
            <Ionicons name="shield-checkmark" size={22} color={C.mint} />
            <Text style={[s.brandText, { fontSize: 20 }]}>Noegis</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.iconBtn}>
            <Ionicons name="close" size={22} color={C.muted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={s.newBtn} onPress={onSimulate}>
          <Ionicons name="add" size={20} color={C.bg} />
          <Text style={s.newBtnText}>Simulate intervention</Text>
        </TouchableOpacity>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ marginTop: 6 }}>
            {NAV.map((item) => {
              const active = current === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.8}
                  onPress={() => onNavigate(item.key)}
                  style={[s.navItem, active && s.navItemActive]}
                >
                  <Ionicons name={item.icon} size={20} color={active ? C.mint : C.muted} />
                  <Text style={[s.navText, active && { color: C.text, fontWeight: '700' }]}>{item.label}</Text>
                  {active ? <View style={s.navActiveBar} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={s.drawerGroup}>Recent interventions</Text>
          {RECENTS.map((r) => (
            <TouchableOpacity key={r.id} style={s.recentItem} activeOpacity={0.8} onPress={() => onNavigate('report')}>
              <Ionicons name={r.icon} size={16} color={C.muted} />
              <Text style={s.recentText} numberOfLines={1}>
                {r.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName} numberOfLines={1}>
              {name}
            </Text>
            <View style={s.profileStatusRow}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <Text style={s.profileStatus} numberOfLines={1}>
                {statusLabel}
              </Text>
            </View>
          </View>
          <Ionicons name="shield-half-outline" size={20} color={C.mint} />
        </View>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */
function Dashboard({ profile, anchorIndex, onNextAnchor, onSimulate, bypassUntil }) {
  const name = profile.name.trim() || 'Alex';
  const calibrating = profile.habit === 'unsure';
  const sessionMin = 32;
  const triggerMin = 45;
  const pct = Math.min(100, Math.round((sessionMin / triggerMin) * 100));
  const anchor = ANCHORS[anchorIndex % ANCHORS.length];
  const bypassActive = bypassUntil && bypassUntil > Date.now();

  return (
    <ScrollView contentContainerStyle={s.screenPad} showsVerticalScrollIndicator={false}>
      <Text style={s.hello}>
        {greeting()}, {name}
      </Text>
      <Text style={s.helloSub}>Saturday, 10 October</Text>

      {/* week strip (image-3 style day chips, image-1 style streak segments) */}
      <View style={s.weekRow}>
        {WEEK.map((w, i) => {
          const today = i === TODAY_INDEX;
          return (
            <View key={w.d} style={[s.dayChip, today && s.dayChipToday]}>
              <Text style={[s.dayName, today && { color: C.bg }]}>{w.d}</Text>
              <Text style={[s.dayNum, today && { color: C.bg }]}>{w.n}</Text>
            </View>
          );
        })}
      </View>
      <View style={s.streakRow}>
        {WEEK.map((w) => (
          <View
            key={w.d}
            style={[
              s.streakSeg,
              w.s === 'ok' && { backgroundColor: C.green },
              w.s === 'bad' && { backgroundColor: C.rose },
              w.s === 'todo' && { backgroundColor: C.border },
            ]}
          />
        ))}
      </View>
      <Text style={s.streakCaption}>5 of 7 days on target this week, 1 breach</Text>

      {/* status pill */}
      <View style={s.pillRow}>
        <View style={[s.pill, calibrating && { backgroundColor: 'rgba(251,191,36,0.14)' }]}>
          <PulseDot color={calibrating ? C.amber : C.green} size={7} />
          <Text style={[s.pillText, calibrating && { color: C.amber }]}>
            {calibrating ? 'Calibrating, day 1 of 3' : 'Active Friction Mode'}
          </Text>
        </View>
        {bypassActive ? (
          <View style={[s.pill, { backgroundColor: C.roseSoft, marginLeft: 8 }]}>
            <Ionicons name="lock-open-outline" size={14} color={C.rose} />
            <Text style={[s.pillText, { color: C.rose, marginLeft: 6 }]}>Bypass window open</Text>
          </View>
        ) : null}
      </View>

      {/* stats */}
      <View style={s.statRow}>
        <StatTile icon="flame-outline" value="4 days" label="Focus streak" tint="rgba(16,185,129,0.20)" />
        <StatTile icon="hand-left-outline" value="3" label="Interventions" tint="rgba(56,189,248,0.18)" />
        <StatTile icon="trending-down" value="-18%" label="vs baseline" tint="rgba(167,139,250,0.20)" />
      </View>

      {/* dynamic threshold */}
      <Card>
        <View style={s.rowBetween}>
          <Text style={s.cardTitle}>Dynamic threshold</Text>
          <Ionicons name="options-outline" size={18} color={C.muted} />
        </View>
        <Text style={s.triggerText}>Current Trigger: 45 continuous minutes</Text>
        <View style={s.track}>
          <View style={[s.trackFill, { width: `${pct}%`, backgroundColor: pct > 80 ? C.amber : C.mint }]} />
        </View>
        <View style={s.rowBetween}>
          <Text style={s.mutedSmall}>{sessionMin} min in current session</Text>
          <Text style={s.mutedSmall}>{triggerMin - sessionMin} min until friction</Text>
        </View>
      </Card>

      {/* telemetry */}
      <SectionTitle title="Today's telemetry" right="Stays on this device" />
      {TELEMETRY.map((t) => {
        const over = t.used > t.limit;
        const fillPct = Math.min(100, Math.round((t.used / t.limit) * 100));
        const tint = over ? C.rose : t.color;
        return (
          <View key={t.name} style={s.teleRow}>
            <View style={[s.teleFill, { width: `${fillPct}%`, backgroundColor: tint }]} />
            <View style={s.teleIcon}>
              <Ionicons name={t.icon} size={20} color={C.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.teleName}>{t.name}</Text>
              <Text style={s.teleSub}>{over ? `${t.used - t.limit}m over limit` : `${t.limit - t.used}m left before friction`}</Text>
            </View>
            <Text style={s.teleValue}>{t.used}m</Text>
          </View>
        );
      })}

      {/* anchor */}
      <SectionTitle title="The Anchor Box" />
      <Card>
        <Text style={s.cardTitle}>Your Anchor Image</Text>
        <View style={[s.anchorFrame, { borderColor: anchor.color }]}>
          <View style={[s.anchorGlow, { backgroundColor: anchor.color }]} />
          <Ionicons name={anchor.icon} size={54} color={anchor.color} />
          <Text style={s.anchorCaption}>{anchor.label}</Text>
        </View>
        <Text style={s.mutedBody}>
          This image is injected during habit interventions to re-engage your prefrontal cortex.
        </Text>
        <GhostButton label="Upload Photo" icon="camera-outline" onPress={onNextAnchor} style={{ marginTop: 12 }} />
      </Card>

      {/* test trigger */}
      <SectionTitle title="Interactive test triggers" />
      <PrimaryButton label="Simulate Habit Intervention Pop-Up" icon="flash" onPress={onSimulate} />
      <Text style={[s.mutedSmall, { textAlign: 'center', marginTop: 10 }]}>
        Mimics the Android SYSTEM_ALERT_WINDOW takeover.
      </Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Friction Intervention Overlay                                       */
/* ------------------------------------------------------------------ */
function InterventionModal({ visible, onClose, onBypass, anchor }) {
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (visible) setTyped('');
  }, [visible]);

  const matches = typed === CHALLENGE_PHRASE;
  const diverged = typed.length > 0 && !CHALLENGE_PHRASE.startsWith(typed);
  const borderColor = matches ? C.mint : diverged ? C.rose : C.border;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[s.modalRoot, { paddingTop: TOP_INSET }]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={s.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={[s.modalAnchor, { borderColor: anchor.color }]}>
              <View style={[s.anchorGlow, { backgroundColor: anchor.color, opacity: 0.18 }]} />
              <Ionicons name={anchor.icon} size={84} color={anchor.color} />
              <Text style={[s.anchorCaption, { fontSize: 15 }]}>{anchor.label}</Text>
            </View>

            <Text style={s.modalPrompt}>
              You have been scrolling for 45 minutes. Is this an intentional choice or an automatic loop?
            </Text>

            <TouchableOpacity activeOpacity={0.88} onPress={onClose} style={s.bigCyanBtn}>
              <Ionicons name="leaf" size={24} color={C.bg} style={{ marginRight: 10 }} />
              <Text style={s.bigCyanText}>Close App & Breathe</Text>
            </TouchableOpacity>

            <View style={s.bypassBox}>
              <Text style={s.bypassLabel}>Type the exact phrase below to unlock:</Text>
              <Text style={s.phrase}>{CHALLENGE_PHRASE}</Text>
              <TextInput
                value={typed}
                onChangeText={setTyped}
                placeholder="Type the phrase here"
                placeholderTextColor="#475569"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                style={[s.phraseInput, { borderColor }]}
              />
              {diverged ? <Text style={s.errorText}>That does not match yet. Check every character.</Text> : null}
              {matches ? (
                <TouchableOpacity activeOpacity={0.85} onPress={onBypass} style={s.unlockBtn}>
                  <Ionicons name="lock-open-outline" size={18} color={C.text} style={{ marginRight: 8 }} />
                  <Text style={s.unlockText}>Unlock for 7 Minutes (Decaying Window)</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Weekly Report                                                       */
/* ------------------------------------------------------------------ */
function ReportScreen() {
  const [accepted, setAccepted] = useState(false);
  const maxVal = 260;
  const CH = 120;
  return (
    <ScrollView contentContainerStyle={s.screenPad} showsVerticalScrollIndicator={false}>
      <Text style={s.screenTitle}>Weekly Behavioral Synthesis — Week 1</Text>
      <Text style={s.helloSub}>Generated on-device from your 7 days of telemetry</Text>

      <View style={s.statRow}>
        <StatTile icon="time-outline" value="2h 46m" label="Avg per day" tint="rgba(56,189,248,0.18)" />
        <StatTile icon="trending-down" value="-18%" label="vs baseline" tint="rgba(16,185,129,0.20)" />
        <StatTile icon="hand-left-outline" value="11" label="Interventions" tint="rgba(244,63,94,0.16)" />
      </View>

      <Card>
        <View style={s.rowBetween}>
          <Text style={s.cardTitle}>Screen time vs baseline</Text>
        </View>
        <View style={s.legendRow}>
          <View style={[s.legendDot, { backgroundColor: C.border, borderColor: C.muted, borderWidth: 1 }]} />
          <Text style={s.legendText}>Baseline</Text>
          <View style={[s.legendDot, { backgroundColor: C.mint, marginLeft: 14 }]} />
          <Text style={s.legendText}>This week</Text>
        </View>
        <View style={[s.chart, { height: CH + 22 }]}>
          {REPORT_DAYS.map((r, i) => (
            <View key={i} style={s.chartCol}>
              <View style={[s.chartBars, { height: CH }]}>
                <View style={[s.bar, { height: (r.base / maxVal) * CH, backgroundColor: C.border, borderColor: '#334155', borderWidth: 1 }]} />
                <View style={[s.bar, { height: (r.now / maxVal) * CH, backgroundColor: r.now > r.base * 0.9 ? C.green : C.mint }]} />
              </View>
              <Text style={s.chartLabel}>{r.d}</Text>
            </View>
          ))}
        </View>
        <Text style={s.mutedSmall}>Minutes per day, baseline from your 3-day calibration.</Text>
      </Card>

      {/* AI assessment callout */}
      <View style={s.callout}>
        <View style={s.calloutHead}>
          <Ionicons name="sparkles" size={18} color={C.mint} />
          <Text style={s.calloutTitle}>AI Assessment</Text>
        </View>
        <Text style={s.calloutBody}>
          Frequent context-switching detected between 11:30 PM and 1:00 AM. Suggests passive exhaustion rather than
          entertainment.
        </Text>
        <Text style={[s.calloutBody, { marginTop: 10, color: C.muted }]}>
          CBT lens: when the mind is depleted, the thumb searches for relief instead of enjoyment. Try a fixed wind-down
          cue at 11:00 PM, and note what you feel before each pick-up.
        </Text>
      </View>

      {/* titration challenge */}
      <Card style={{ borderColor: accepted ? C.green : C.border }}>
        <View style={s.rowBetween}>
          <Text style={s.cardTitle}>Progressive Titration Challenge</Text>
          <Ionicons name={accepted ? 'checkmark-circle' : 'ribbon-outline'} size={22} color={accepted ? C.green : C.amber} />
        </View>
        <Text style={s.bodyText}>Baseline reduced by 18%. Accept next week's goal of 35 mins?</Text>
        <View style={s.goalRow}>
          <View style={s.goalChip}>
            <Text style={s.goalChipLabel}>This week</Text>
            <Text style={s.goalChipValue}>45 min</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={C.muted} />
          <View style={[s.goalChip, { backgroundColor: C.mintSoft }]}>
            <Text style={s.goalChipLabel}>Next week</Text>
            <Text style={[s.goalChipValue, { color: C.mint }]}>35 min</Text>
          </View>
        </View>
        {accepted ? (
          <View style={s.acceptedRow}>
            <Ionicons name="checkmark" size={18} color={C.green} />
            <Text style={s.acceptedText}>Challenge accepted. Trigger drops to 35 minutes on Monday.</Text>
          </View>
        ) : (
          <PrimaryButton label="Accept Challenge" icon="trophy-outline" onPress={() => setAccepted(true)} />
        )}
      </Card>

      <View style={s.privacyFooter}>
        <Ionicons name="lock-closed" size={16} color={C.mint} />
        <Text style={s.privacyText}>Raw usage logs from the past 7 days have been permanently wiped from local memory.</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */
function AssessmentModal({ assessment, onClose }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    setQIndex(0);
    setAnswers([]);
  }, [assessment]);

  if (!assessment) return null;
  const total = assessment.questions.length;
  const done = answers.length === total;
  const score = answers.reduce((a, b) => a + b, 0);
  const max = total * 3;
  const band = score <= 2 ? 'Low' : score <= 5 ? 'Mild' : 'Elevated';
  const bandColor = band === 'Low' ? C.green : band === 'Mild' ? C.amber : C.rose;

  const pick = (val) => {
    setAnswers((prev) => [...prev, val]);
    if (qIndex < total - 1) setQIndex(qIndex + 1);
  };

  return (
    <Modal visible animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={s.sheetBackdrop}>
        <View style={s.sheet}>
          <View style={s.rowBetween}>
            <View>
              <Text style={s.cardTitle}>{assessment.name}</Text>
              <Text style={s.mutedSmall}>{assessment.full}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.iconBtn}>
              <Ionicons name="close" size={22} color={C.muted} />
            </TouchableOpacity>
          </View>

          {!done ? (
            <>
              <View style={s.track}>
                <View style={[s.trackFill, { width: `${(qIndex / total) * 100}%`, backgroundColor: assessment.color }]} />
              </View>
              <Text style={s.mutedSmall}>
                Question {qIndex + 1} of {total}
              </Text>
              <Text style={s.questionText}>{assessment.questions[qIndex]}</Text>
              {assessment.options.map((opt, i) => (
                <TouchableOpacity key={opt} activeOpacity={0.8} style={s.optionBtn} onPress={() => pick(i)}>
                  <Text style={s.optionText}>{opt}</Text>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <View style={s.resultBox}>
                <Text style={[s.resultScore, { color: bandColor }]}>
                  {score}
                  <Text style={s.resultMax}> / {max}</Text>
                </Text>
                <Text style={[s.resultBand, { color: bandColor }]}>{band} signal</Text>
              </View>
              <Text style={s.bodyText}>
                This is a 3-question mock screen for the prototype. It is not a diagnosis. The full instrument would
                tune your friction strength and weekly coaching, and the answers never leave this device.
              </Text>
              <PrimaryButton label="Done" onPress={onClose} style={{ marginTop: 16 }} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function AssessmentsScreen() {
  const [active, setActive] = useState(null);
  return (
    <ScrollView contentContainerStyle={s.screenPad} showsVerticalScrollIndicator={false}>
      <Text style={s.screenTitle}>Psychological assessments</Text>
      <Text style={s.helloSub}>Short clinical screens that help Noegis set friction at the right strength.</Text>
      {ASSESSMENTS.map((a) => (
        <Card key={a.key}>
          <View style={s.assessHead}>
            <View style={[s.assessIcon, { backgroundColor: a.color + '26' }]}>
              <Ionicons name={a.icon} size={22} color={a.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{a.name}</Text>
              <Text style={s.mutedSmall}>{a.full}</Text>
            </View>
            <View style={s.timeChip}>
              <Ionicons name="time-outline" size={13} color={C.muted} />
              <Text style={s.timeChipText}>{a.time}</Text>
            </View>
          </View>
          <Text style={s.mutedBody}>{a.desc}</Text>
          <PrimaryButton label="Take Assessment" onPress={() => setActive(a)} style={{ marginTop: 14 }} />
        </Card>
      ))}
      <View style={s.privacyFooter}>
        <Ionicons name="information-circle-outline" size={18} color={C.mint} />
        <Text style={s.privacyText}>Screening tools only. They do not replace a conversation with a clinician.</Text>
      </View>
      <AssessmentModal assessment={active} onClose={() => setActive(null)} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Monk Mode                                                           */
/* ------------------------------------------------------------------ */
function BreathingOrb() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.15] });
  const ringScale = a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const ringOpacity = a.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.05] });
  return (
    <View style={s.orbWrap}>
      <Animated.View style={[s.orbRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[s.orb, { transform: [{ scale }] }]} />
    </View>
  );
}

function MonkScreen({ active, remaining, total, onStart, onEnd }) {
  const [minutes, setMinutes] = useState(60);
  const [blocked, setBlocked] = useState({ instagram: true, youtube: true, games: false, reddit: false });

  const toggle = (k) => setBlocked((p) => ({ ...p, [k]: !p[k] }));
  const count = Object.values(blocked).filter(Boolean).length;

  if (active) {
    const elapsed = total - remaining;
    const idx = Math.floor(elapsed / 20) % GROUND_PROMPTS.length;
    const finished = remaining <= 0;
    return (
      <ScrollView contentContainerStyle={[s.screenPad, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
        <Text style={s.monkState}>{finished ? 'Session complete' : 'Monk Mode is on'}</Text>
        <BreathingOrb />
        <Text style={s.clock}>{fmtClock(remaining)}</Text>
        <Text style={s.mutedSmall}>{count} apps locked</Text>
        <View style={s.groundCard}>
          <Ionicons name="leaf" size={18} color={C.mint} />
          <Text style={s.groundText}>{finished ? 'Well done. You kept your word to yourself.' : GROUND_PROMPTS[idx]}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.8} onPress={onEnd} style={s.endBtn}>
          <Text style={s.endBtnText}>{finished ? 'Return to dashboard' : 'End early'}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.screenPad} showsVerticalScrollIndicator={false}>
      <Text style={s.screenTitle}>Monk Mode</Text>
      <Text style={s.helloSub}>Manual deep-focus override. Pick a duration and choose what to lock.</Text>

      <SectionTitle title="Duration" />
      <View style={s.chipRow}>
        {MONK_DURATIONS.map((d) => {
          const on = minutes === d.minutes;
          return (
            <TouchableOpacity
              key={d.label}
              activeOpacity={0.85}
              onPress={() => setMinutes(d.minutes)}
              style={[s.durChip, on && s.durChipOn]}
            >
              <Text style={[s.durText, on && { color: C.bg }]}>{d.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SectionTitle title="Apps to lock" right={`${count} selected`} />
      <Card style={{ paddingVertical: 4 }}>
        {MONK_APPS.map((a, i) => (
          <View key={a.key} style={[s.appRow, i < MONK_APPS.length - 1 && s.appRowDivider]}>
            <View style={[s.appIcon, { backgroundColor: a.color + '26' }]}>
              <Ionicons name={a.icon} size={18} color={a.color} />
            </View>
            <Text style={s.appName}>{a.name}</Text>
            <Switch
              value={blocked[a.key]}
              onValueChange={() => toggle(a.key)}
              trackColor={{ false: '#334155', true: C.green }}
              thumbColor={blocked[a.key] ? C.mint : '#CBD5E1'}
            />
          </View>
        ))}
      </Card>

      <PrimaryButton
        label="Initiate Monk Mode"
        icon="leaf"
        disabled={count === 0}
        onPress={() => onStart(minutes)}
        style={{ marginTop: 20 }}
      />
      {count === 0 ? <Text style={[s.errorText, { textAlign: 'center' }]}>Select at least one app to lock.</Text> : null}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Onboarding                                                          */
/* ------------------------------------------------------------------ */
function OnboardingScreen({ profile, setProfile, onFinish }) {
  const [step, setStep] = useState(1);
  const [a11y, setA11y] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const unsure = profile.habit === 'unsure';

  const total = unsure ? 5 : 4;
  const position = !unsure && step === 5 ? 4 : step;

  const next = () => setStep((cur) => (cur === 3 && !unsure ? 5 : cur + 1));
  const back = () => setStep((cur) => (cur === 5 && !unsure ? 3 : Math.max(1, cur - 1)));

  const canContinue =
    step === 2 ? profile.name.trim().length > 0 : step === 3 ? !!profile.habit : step === 5 ? a11y && overlay : true;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.screenPad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.dotsRow}>
          {Array.from({ length: total }).map((_, i) => (
            <View key={i} style={[s.stepDot, i + 1 <= position && { backgroundColor: C.mint, width: i + 1 === position ? 26 : 10 }]} />
          ))}
        </View>

        {step === 1 && (
          <View style={{ alignItems: 'center' }}>
            <View style={s.shieldCircle}>
              <Ionicons name="shield-checkmark" size={84} color={C.mint} />
            </View>
            <Text style={s.obTitle}>Your data never leaves this phone</Text>
            <Text style={s.obBody}>
              Noegis keeps all telemetry 100% on-device and offline. There are no accounts, no cloud sync, and no
              servers reading what you do.
            </Text>
            <Card style={{ alignSelf: 'stretch' }}>
              {['Usage analysed locally on this device', 'Works fully offline', 'Raw logs wiped after every weekly report'].map((t) => (
                <View key={t} style={s.checkRow}>
                  <Ionicons name="checkmark-circle" size={20} color={C.green} />
                  <Text style={s.checkText}>{t}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={s.obTitleLeft}>Tell us about you</Text>
            <Text style={s.obBodyLeft}>This tunes your friction. It stays on this device.</Text>
            <Text style={s.fieldLabel}>Name</Text>
            <TextInput
              value={profile.name}
              onChangeText={(v) => setProfile((p) => ({ ...p, name: v }))}
              placeholder="Your first name"
              placeholderTextColor="#475569"
              style={s.input}
            />
            <Text style={s.fieldLabel}>Age</Text>
            <TextInput
              value={profile.age}
              onChangeText={(v) => setProfile((p) => ({ ...p, age: v.replace(/[^0-9]/g, '').slice(0, 3) }))}
              placeholder="e.g. 24"
              placeholderTextColor="#475569"
              keyboardType="number-pad"
              style={s.input}
            />
            <Text style={s.fieldLabel}>Gender</Text>
            <View style={s.chipRowWrap}>
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => {
                const on = profile.gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    activeOpacity={0.85}
                    onPress={() => setProfile((p) => ({ ...p, gender: g }))}
                    style={[s.genderChip, on && s.genderChipOn]}
                  >
                    <Text style={[s.genderText, on && { color: C.bg, fontWeight: '700' }]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={s.obTitleLeft}>Which habit do you want to change?</Text>
            <Text style={s.obBodyLeft}>Pick the one that costs you the most.</Text>
            {HABITS.map((h) => {
              const on = profile.habit === h.key;
              return (
                <TouchableOpacity
                  key={h.key}
                  activeOpacity={0.85}
                  onPress={() => setProfile((p) => ({ ...p, habit: h.key }))}
                  style={[s.habitCard, on && s.habitCardOn]}
                >
                  <View style={[s.habitIcon, on && { backgroundColor: C.mintSoft }]}>
                    <Ionicons name={h.icon} size={22} color={on ? C.mint : C.muted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.habitLabel}>{h.label}</Text>
                    <Text style={s.mutedSmall}>{h.sub}</Text>
                  </View>
                  <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={on ? C.mint : '#334155'} />
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setProfile((p) => ({ ...p, habit: 'unsure' }))}
              style={[s.unsureCard, unsure && { borderColor: C.mint, backgroundColor: 'rgba(0,245,212,0.14)' }]}
            >
              <Ionicons name="sparkles" size={26} color={C.mint} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.habitLabel, { color: C.mint }]}>I'm Not Sure (Let AI Diagnose)</Text>
                <Text style={s.mutedSmall}>Noegis observes first, then recommends</Text>
              </View>
              <Ionicons name={unsure ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={unsure ? C.mint : '#334155'} />
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View>
            <View style={s.calibIcon}>
              <Ionicons name="analytics-outline" size={48} color={C.mint} />
            </View>
            <Text style={s.obTitleLeft}>3-Day Global Baseline Calibration Mode</Text>
            <Text style={s.obBodyLeft}>
              Before any friction appears, Noegis quietly watches how you use your phone for three days. No pop-ups,
              no blocking.
            </Text>
            {[
              { d: 'Day 1–3', t: 'Observe', s: 'Measure sessions and late-night patterns locally', c: C.sky },
              { d: 'Day 4', t: 'Diagnose', s: 'AI picks your main habit and sets a starting trigger', c: C.violet },
              { d: 'Day 5+', t: 'Intervene', s: 'Friction begins, then eases down week by week', c: C.mint },
            ].map((x) => (
              <View key={x.d} style={s.timelineRow}>
                <View style={[s.timelineBar, { backgroundColor: x.c }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.habitLabel}>
                    {x.d}: {x.t}
                  </Text>
                  <Text style={s.mutedSmall}>{x.s}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={s.obTitleLeft}>Grant two permissions</Text>
            <Text style={s.obBodyLeft}>Android needs both for Noegis to notice a loop and step in. This is a simulation.</Text>
            <Card>
              <View style={s.permRow}>
                <View style={s.permIcon}>
                  <Ionicons name="accessibility-outline" size={22} color={C.mint} />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={s.habitLabel}>Accessibility Service</Text>
                  <Text style={s.mutedSmall}>Detects which app is open and for how long</Text>
                </View>
                <Switch value={a11y} onValueChange={setA11y} trackColor={{ false: '#334155', true: C.green }} thumbColor={a11y ? C.mint : '#CBD5E1'} />
              </View>
              <View style={s.permDivider} />
              <View style={s.permRow}>
                <View style={s.permIcon}>
                  <Ionicons name="layers-outline" size={22} color={C.mint} />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={s.habitLabel}>Display Over Other Apps</Text>
                  <Text style={s.mutedSmall}>Shows the friction screen on top of the app</Text>
                </View>
                <Switch value={overlay} onValueChange={setOverlay} trackColor={{ false: '#334155', true: C.green }} thumbColor={overlay ? C.mint : '#CBD5E1'} />
              </View>
            </Card>
            {!(a11y && overlay) ? <Text style={s.mutedSmall}>Turn both on to continue.</Text> : null}
          </View>
        )}

        <View style={s.obNav}>
          {step > 1 ? (
            <TouchableOpacity onPress={back} style={s.backBtn}>
              <Ionicons name="arrow-back" size={20} color={C.text} />
            </TouchableOpacity>
          ) : null}
          <PrimaryButton
            label={step === 5 ? 'Activate Noegis' : 'Continue'}
            disabled={!canContinue}
            onPress={step === 5 ? onFinish : next}
            style={{ flex: 1, marginLeft: step > 1 ? 12 : 0 }}
          />
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/* App root                                                            */
/* ------------------------------------------------------------------ */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interventionOpen, setInterventionOpen] = useState(false);
  const [bypassUntil, setBypassUntil] = useState(0);
  const [anchorIndex, setAnchorIndex] = useState(0);
  const [profile, setProfile] = useState({ name: '', age: '', gender: '', habit: null });

  // Monk mode lives at the root so the timer survives navigation.
  const [monkActive, setMonkActive] = useState(false);
  const [monkTotal, setMonkTotal] = useState(0);
  const [monkRemaining, setMonkRemaining] = useState(0);

  useEffect(() => {
    if (!monkActive) return undefined;
    const id = setInterval(() => {
      setMonkRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [monkActive]);

  const startMonk = useCallback((minutes) => {
    setMonkTotal(minutes * 60);
    setMonkRemaining(minutes * 60);
    setMonkActive(true);
  }, []);
  const endMonk = useCallback(() => setMonkActive(false), []);

  const navigate = (key) => {
    setCurrentScreen(key);
    setDrawerOpen(false);
  };

  const simulate = () => {
    setDrawerOpen(false);
    setInterventionOpen(true);
  };

  const handleBypass = () => {
    setBypassUntil(Date.now() + 7 * 60 * 1000);
    setInterventionOpen(false);
  };

  const finishOnboarding = () => {
    setCurrentScreen('dashboard');
  };

  let statusLabel = 'Active friction';
  let statusColor = C.green;
  if (monkActive && monkRemaining > 0) {
    statusLabel = 'Monk Mode running';
    statusColor = C.mint;
  } else if (profile.habit === 'unsure') {
    statusLabel = 'Calibrating, day 1 of 3';
    statusColor = C.amber;
  }

  const anchor = ANCHORS[anchorIndex % ANCHORS.length];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={[s.root, { paddingTop: TOP_INSET }]}>
        <Header onMenu={() => setDrawerOpen(true)} hasAlerts />

        <View style={s.workflow}>
          {currentScreen === 'dashboard' && (
            <Dashboard
              profile={profile}
              anchorIndex={anchorIndex}
              onNextAnchor={() => setAnchorIndex((i) => i + 1)}
              onSimulate={simulate}
              bypassUntil={bypassUntil}
            />
          )}
          {currentScreen === 'report' && <ReportScreen />}
          {currentScreen === 'assessments' && <AssessmentsScreen />}
          {currentScreen === 'monk' && (
            <MonkScreen active={monkActive} remaining={monkRemaining} total={monkTotal} onStart={startMonk} onEnd={endMonk} />
          )}
          {currentScreen === 'onboarding' && (
            <OnboardingScreen profile={profile} setProfile={setProfile} onFinish={finishOnboarding} />
          )}
        </View>

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          current={currentScreen}
          onNavigate={navigate}
          onSimulate={simulate}
          profile={profile}
          statusLabel={statusLabel}
          statusColor={statusColor}
        />
      </View>

      <InterventionModal
        visible={interventionOpen}
        onClose={() => setInterventionOpen(false)}
        onBypass={handleBypass}
        anchor={anchor}
      />
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  workflow: { flex: 1 },
  screenPad: { padding: 20, paddingTop: 8 },

  /* header */
  header: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandText: { color: C.text, fontSize: 18, fontWeight: '800', marginLeft: 8, letterSpacing: 0.3 },
  bellDot: { position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: C.rose, borderWidth: 1.5, borderColor: C.bg },

  /* drawer */
  scrim: { backgroundColor: 'rgba(0,0,0,0.62)' },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#0E1424',
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  drawerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingLeft: 4 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.mint,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  newBtnText: { color: C.bg, fontWeight: '800', fontSize: 14, marginLeft: 6 },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginBottom: 2 },
  navItemActive: { backgroundColor: C.card },
  navText: { color: C.muted, fontSize: 15, marginLeft: 14, fontWeight: '500', flex: 1 },
  navActiveBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: C.mint },
  drawerGroup: { color: C.muted, fontSize: 13, fontWeight: '600', marginTop: 22, marginBottom: 8, paddingLeft: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  recentText: { color: C.muted, fontSize: 14, marginLeft: 12, flex: 1 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginTop: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: C.bg, fontWeight: '800', fontSize: 17 },
  profileName: { color: C.text, fontWeight: '700', fontSize: 15 },
  profileStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  profileStatus: { color: C.muted, fontSize: 12 },

  /* shared */
  card: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 14 },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: '800' },
  sectionRight: { color: C.muted, fontSize: 12 },
  mutedSmall: { color: C.muted, fontSize: 12, lineHeight: 17 },
  mutedBody: { color: C.muted, fontSize: 14, lineHeight: 20 },
  bodyText: { color: C.text, fontSize: 15, lineHeight: 22, marginTop: 8 },
  screenTitle: { color: C.text, fontSize: 24, fontWeight: '800', lineHeight: 30, marginTop: 6 },
  errorText: { color: C.rose, fontSize: 12, marginTop: 8 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 18 },
  primaryBtnText: { fontSize: 15, fontWeight: '800' },
  btnDisabled: { opacity: 0.35 },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.mint,
    paddingVertical: 11,
  },
  ghostBtnText: { color: C.mint, fontWeight: '700', fontSize: 14 },
  track: { height: 10, borderRadius: 5, backgroundColor: C.border, overflow: 'hidden', marginVertical: 12 },
  trackFill: { height: 10, borderRadius: 5 },

  /* dashboard */
  hello: { color: C.text, fontSize: 24, fontWeight: '800', marginTop: 8 },
  helloSub: { color: C.muted, fontSize: 14, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip: { width: (SCREEN_W - 40 - 36) / 7, paddingVertical: 8, alignItems: 'center', borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  dayChipToday: { backgroundColor: C.mint, borderColor: C.mint },
  dayName: { color: C.muted, fontSize: 11, fontWeight: '600' },
  dayNum: { color: C.text, fontSize: 15, fontWeight: '800', marginTop: 3 },
  streakRow: { flexDirection: 'row', marginTop: 12 },
  streakSeg: { flex: 1, height: 12, marginHorizontal: 2, borderRadius: 4 },
  streakCaption: { color: C.muted, fontSize: 12, marginTop: 8 },
  pillRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: 20, paddingVertical: 4, paddingLeft: 8, paddingRight: 14 },
  pillText: { color: C.green, fontWeight: '700', fontSize: 13, marginLeft: 2 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statTile: { flex: 1, borderRadius: 18, padding: 12, marginHorizontal: 4, minHeight: 92, justifyContent: 'space-between' },
  statValue: { color: C.text, fontSize: 18, fontWeight: '800', marginTop: 8 },
  statLabel: { color: C.text, opacity: 0.75, fontSize: 11 },
  triggerText: { color: C.mint, fontSize: 18, fontWeight: '800', marginTop: 10 },

  teleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  teleFill: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.28 },
  teleIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(15,23,42,0.55)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  teleName: { color: C.text, fontSize: 15, fontWeight: '700' },
  teleSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  teleValue: { color: C.text, fontSize: 18, fontWeight: '800' },

  anchorFrame: { height: 170, borderRadius: 16, borderWidth: 1.5, marginTop: 12, marginBottom: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingHorizontal: 16 },
  anchorGlow: { ...StyleSheet.absoluteFillObject, opacity: 0.12 },
  anchorCaption: { color: C.text, fontSize: 13, marginTop: 10, textAlign: 'center', fontWeight: '600' },

  /* modal takeover */
  modalRoot: { flex: 1, backgroundColor: C.bg },
  modalScroll: { padding: 22, paddingBottom: 40, alignItems: 'stretch' },
  modalAnchor: { height: 230, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 18, paddingHorizontal: 20 },
  modalPrompt: { color: C.text, fontSize: 24, fontWeight: '700', lineHeight: 33, marginTop: 28, marginBottom: 26, textAlign: 'center' },
  bigCyanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.mint, borderRadius: 22, paddingVertical: 24 },
  bigCyanText: { color: C.bg, fontSize: 20, fontWeight: '900' },
  bypassBox: { marginTop: 34, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  bypassLabel: { color: C.muted, fontSize: 13 },
  phrase: { color: C.rose, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 12 },
  phraseInput: { color: C.text, backgroundColor: C.bg, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  unlockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.rose, borderRadius: 14, paddingVertical: 14, marginTop: 14 },
  unlockText: { color: C.text, fontWeight: '800', fontSize: 14 },

  /* report */
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
  legendText: { color: C.muted, fontSize: 12 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 8 },
  chartCol: { flex: 1, alignItems: 'center' },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end' },
  bar: { width: 12, borderTopLeftRadius: 5, borderTopRightRadius: 5, marginHorizontal: 1.5 },
  chartLabel: { color: C.muted, fontSize: 12, marginTop: 6 },
  callout: { backgroundColor: C.mintSoft, borderRadius: 18, borderLeftWidth: 4, borderLeftColor: C.mint, padding: 16, marginBottom: 14 },
  calloutHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  calloutTitle: { color: C.mint, fontWeight: '800', fontSize: 15, marginLeft: 8 },
  calloutBody: { color: C.text, fontSize: 15, lineHeight: 22 },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 16 },
  goalChip: { flex: 1, backgroundColor: C.bg, borderRadius: 14, padding: 12, marginHorizontal: 6, alignItems: 'center' },
  goalChipLabel: { color: C.muted, fontSize: 12 },
  goalChipValue: { color: C.text, fontSize: 20, fontWeight: '800', marginTop: 4 },
  acceptedRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: 14, padding: 14 },
  acceptedText: { color: C.green, fontWeight: '600', fontSize: 13, marginLeft: 8, flex: 1 },
  privacyFooter: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  privacyText: { color: C.muted, fontSize: 12, lineHeight: 18, marginLeft: 10, flex: 1 },

  /* assessments */
  assessHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  assessIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  timeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 12 },
  timeChipText: { color: C.muted, fontSize: 12, marginLeft: 4 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 34, borderWidth: 1, borderColor: C.border },
  questionText: { color: C.text, fontSize: 19, fontWeight: '700', lineHeight: 27, marginTop: 10, marginBottom: 16 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 8 },
  optionText: { color: C.text, fontSize: 15 },
  resultBox: { alignItems: 'center', paddingVertical: 20 },
  resultScore: { fontSize: 54, fontWeight: '900' },
  resultMax: { fontSize: 22, color: C.muted, fontWeight: '600' },
  resultBand: { fontSize: 16, fontWeight: '700', marginTop: 4 },

  /* monk */
  chipRow: { flexDirection: 'row', justifyContent: 'space-between' },
  durChip: { flex: 1, marginHorizontal: 4, paddingVertical: 14, alignItems: 'center', borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  durChipOn: { backgroundColor: C.mint, borderColor: C.mint },
  durText: { color: C.text, fontWeight: '800', fontSize: 15 },
  appRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  appRowDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
  appIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  appName: { color: C.text, fontSize: 15, fontWeight: '600', flex: 1 },
  monkState: { color: C.muted, fontSize: 15, fontWeight: '600', marginTop: 14 },
  orbWrap: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginVertical: 24 },
  orb: { width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(0,245,212,0.16)', borderWidth: 2, borderColor: C.mint },
  orbRing: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: C.mint },
  clock: { color: C.text, fontSize: 58, fontWeight: '200', letterSpacing: 2, marginBottom: 6 },
  groundCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, marginTop: 28, alignSelf: 'stretch' },
  groundText: { color: C.text, fontSize: 16, lineHeight: 24, marginLeft: 12, flex: 1 },
  endBtn: { marginTop: 28, paddingVertical: 12, paddingHorizontal: 26, borderRadius: 14, borderWidth: 1, borderColor: C.border },
  endBtnText: { color: C.muted, fontWeight: '700', fontSize: 14 },

  /* onboarding */
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 26, marginTop: 8 },
  stepDot: { width: 10, height: 6, borderRadius: 3, backgroundColor: C.border, marginHorizontal: 3 },
  shieldCircle: { width: 168, height: 168, borderRadius: 84, backgroundColor: C.mintSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,245,212,0.35)', marginBottom: 24 },
  obTitle: { color: C.text, fontSize: 26, fontWeight: '800', textAlign: 'center', lineHeight: 33 },
  obBody: { color: C.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12, marginBottom: 22 },
  obTitleLeft: { color: C.text, fontSize: 26, fontWeight: '800', lineHeight: 33 },
  obBodyLeft: { color: C.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  checkText: { color: C.text, fontSize: 14, marginLeft: 10, flex: 1 },
  fieldLabel: { color: C.muted, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 6 },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, color: C.text, fontSize: 16, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 12 },
  chipRowWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  genderChip: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: 22, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginRight: 8, marginBottom: 8 },
  genderChipOn: { backgroundColor: C.mint, borderColor: C.mint },
  genderText: { color: C.text, fontSize: 14 },
  habitCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  habitCardOn: { borderColor: C.mint, backgroundColor: 'rgba(0,245,212,0.07)' },
  habitIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  habitLabel: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  unsureCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(0,245,212,0.45)', backgroundColor: 'rgba(0,245,212,0.07)', padding: 18, marginTop: 6 },
  calibIcon: { width: 84, height: 84, borderRadius: 26, backgroundColor: C.mintSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  timelineRow: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  timelineBar: { width: 4, borderRadius: 2, marginRight: 14 },
  permRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  permIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: C.mintSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  permDivider: { height: 1, backgroundColor: C.border, marginVertical: 6 },
  obNav: { flexDirection: 'row', alignItems: 'center', marginTop: 26 },
  backBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
});