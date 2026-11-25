import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import {
  Pressable, StyleSheet, Text, View,
  type StyleProp, type TextProps, type TextStyle,
} from 'react-native';
import type { Benefit } from './benefits';

export const colors = {
  background: '#F7F8FB',
  primary: '#465CF5',
  accent: '#3789F5',
  heart: '#ED3134',
  text: '#232632',
  body: '#34373E',
  secondary: '#626B7B',
  border: '#CFD2D9',
  field: '#E9EBF2',
  white: '#FFFFFF',
};

export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extrabold: 'Pretendard-ExtraBold',
};

type Weight = keyof typeof fonts;

export function Label({
  size = 14, weight = 'regular', color = colors.text, style, ...props
}: TextProps & { size?: number; weight?: Weight; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text {...props} style={[{ color, fontFamily: fonts[weight], fontSize: size,
    lineHeight: Math.round(size * 1.4), letterSpacing: weight === 'bold' || weight === 'extrabold' ? -size / 100 : 0 }, style]} />;
}

const icons = {
  back: [require('./assets/back.svg'), 22, 22],
  bookmark: [require('./assets/bookmark.svg'), 22, 22],
  check: [require('./assets/check.svg'), 16, 16],
  clear: [require('./assets/clear.svg'), 9.13333, 9.13333],
  clock: [require('./assets/clock.svg'), 22, 22],
  close: [require('./assets/close.svg'), 14, 14],
  detailHeart: [require('./assets/detail-heart.svg'), 17.4167, 16.418],
  heart: [require('./assets/heart.svg'), 11.8008, 10.8385],
  heartActive: [require('./assets/heart-active.svg'), 11.8008, 10.8385],
  heartBackground: [require('./assets/heart-bg.svg'), 20, 20],
  menu: [require('./assets/menu.svg'), 22, 22],
  next: [require('./assets/next.svg'), 18, 18],
  pin: [require('./assets/pin.svg'), 19.6292, 23.9894],
  recentEmpty: [require('./assets/recent-empty.svg'), 49.6339, 49.6339],
  search: [require('./assets/search.svg'), 20, 20],
  searchEmpty: [require('./assets/search-empty.svg'), 60, 60],
  sort: [require('./assets/sort.svg'), 16, 16],
  vendor: [require('./assets/vendor.svg'), 29, 29],
} as const;

type IconName = keyof typeof icons;

export function Icon({ name }: { name: IconName }) {
  const [source, width, height] = icons[name];
  return <Image source={source} style={{ width, height }} contentFit="contain" accessible={false} />;
}

export function IconButton({
  icon, label, onPress,
}: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.iconButton}>
      <Icon name={icon} />
    </Pressable>
  );
}

export function Button({
  children, onPress, secondary = false,
}: { children: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondaryButton, pressed && styles.pressed]}>
      <Label size={14} weight={secondary ? 'medium' : 'bold'} color={secondary ? colors.text : colors.white}>
        {children}
      </Label>
    </Pressable>
  );
}

export function Artwork({ benefit, large = false }: { benefit: Benefit; large?: boolean }) {
  const { tile } = benefit;
  return (
    <View style={[styles.artwork, large && styles.largeArtwork, benefit.id === 'americano' && styles.white]}>
      <Image
        accessible={false}
        source={benefit.artwork}
        contentFit={tile ? 'fill' : benefit.id === 'americano' ? 'contain' : 'cover'}
        style={tile ? {
          position: 'absolute', width: '300%', height: '307.96%',
          left: tile.column === 0 ? '0%' : tile.column === 1 ? '-100%' : '-200%',
          top: tile.row === 0 ? '-26.99%' : '-180.97%',
        } : StyleSheet.absoluteFill}
      />
    </View>
  );
}

export function FavoriteButton({
  saved, onPress, detail = false,
}: { saved: boolean; onPress: () => void; detail?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={saved ? '찜 해제' : '찜하기'}
      accessibilityState={{ selected: saved }} onPress={onPress}
      hitSlop={8} style={detail ? styles.detailFavorite : styles.cardFavorite}
    >
      {!detail && <View style={StyleSheet.absoluteFill}><Icon name="heartBackground" /></View>}
      <Icon name={saved ? 'heartActive' : detail ? 'detailHeart' : 'heart'} />
    </Pressable>
  );
}

export function BenefitGrid({
  items, favorites, onOpen, onFavorite, distance,
}: {
  items: Benefit[];
  favorites: string[];
  onOpen: (benefit: Benefit) => void;
  onFavorite: (id: string) => void;
  distance?: 'current' | 'campus';
}) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${item.vendor} ${item.title}`}
            onPress={() => onOpen(item)} style={({ pressed }) => pressed && styles.pressed}>
            <Artwork benefit={item} />
            <Label size={12} weight="medium" color={colors.accent} numberOfLines={1} style={styles.vendor}>
              {item.category} · {item.vendor}
            </Label>
            <Label size={16} weight="bold" numberOfLines={1} style={styles.cardTitle}>{item.title}</Label>
            <Label size={12} color={colors.secondary} numberOfLines={1}>
              {distance && item.distances ? `거리 ${item.distances[distance]}m` : item.note}
            </Label>
          </Pressable>
          <FavoriteButton saved={favorites.includes(item.id)} onPress={() => onFavorite(item.id)} />
        </View>
      ))}
    </View>
  );
}

export function EmptyState({
  icon, title, description, action,
}: {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Icon name={icon} /></View>
      <Label size={20} weight="bold" style={styles.centered}>{title}</Label>
      <Label color={colors.secondary} style={styles.emptyDescription}>{description}</Label>
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: { width: 42, height: 44, alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 48, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  secondaryButton: { backgroundColor: colors.field },
  pressed: { opacity: 0.78 },
  artwork: { width: '100%', aspectRatio: 174 / 113, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.field },
  largeArtwork: { aspectRatio: 354 / 217, borderRadius: 20 },
  white: { backgroundColor: colors.white },
  cardFavorite: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  detailFavorite: { height: 42, width: 40, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 32 },
  card: { flexBasis: 0, flexGrow: 1, minWidth: '44%', maxWidth: '49%', minHeight: 200 },
  vendor: { marginTop: 10 },
  cardTitle: { marginTop: 4, marginBottom: 3 },
  empty: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: '39%' },
  emptyIcon: { alignSelf: 'center', minHeight: 60, justifyContent: 'center', marginBottom: 16 },
  centered: { textAlign: 'center' },
  emptyDescription: { textAlign: 'center', marginTop: 4 },
  emptyAction: { marginTop: 26 },
});
