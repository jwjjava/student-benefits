import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import {
  BackHandler, Keyboard, Modal, Platform, Pressable, ScrollView, StatusBar,
  StyleSheet, TextInput, useWindowDimensions, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { benefits, categories, findBenefits, sorts, type Benefit, type Category, type Sort } from './benefits';
import { Artwork, BenefitGrid, Button, colors, EmptyState, FavoriteButton, fonts, Icon, IconButton, Label } from './ui';

type Route = { page: 'home' | 'search' | 'favorites' | 'recent' } | { page: 'detail'; benefit: Benefit };
type Overlay = 'menu' | 'location' | 'campus' | 'use' | null;

const home: Route = { page: 'home' };
const startingFavorites = ['notion', 'ediya', 'github', 'roundlab'];
const popularSearches = ['구독 할인', '음식점 할인', 'IT 학생 혜택'];
const titles = { home: '로고 들어감', search: '혜택 검색', favorites: '찜', recent: '최근 본 항목', detail: '혜택 상세' };

const fontFiles = {
  [fonts.regular]: require('./assets/Pretendard-Regular.ttf'),
  [fonts.medium]: require('./assets/Pretendard-Medium.ttf'),
  [fonts.semibold]: require('./assets/Pretendard-SemiBold.ttf'),
  [fonts.bold]: require('./assets/Pretendard-Bold.ttf'),
  [fonts.extrabold]: require('./assets/Pretendard-ExtraBold.ttf'),
};

export default function App() {
  const [loaded, error] = useFonts(fontFiles);
  if (!loaded && !error) return <View style={styles.background} />;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <BenefitsApp />
    </SafeAreaProvider>
  );
}

function BenefitsApp() {
  const { width } = useWindowDimensions();
  const [routes, setRoutes] = useState<Route[]>([home]);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [category, setCategory] = useState<Category>('전체');
  const [sort, setSort] = useState<Sort>('추천순');
  const [sortOpen, setSortOpen] = useState(false);
  const [position, setPosition] = useState<'current' | 'campus'>();
  const [favorites, setFavorites] = useState(startingFavorites);
  const [recent, setRecent] = useState<string[]>([]);
  const [used, setUsed] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [history, setHistory] = useState(['학생 할인']);
  const route = routes[routes.length - 1];
  const page = route.page;

  const goBack = () => {
    if (overlay) setOverlay(null);
    else if (sortOpen) setSortOpen(false);
    else if (routes.length > 1) setRoutes((stack) => stack.slice(0, -1));
    else return false;
    return true;
  };

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => listener.remove();
  }, [overlay, routes.length, sortOpen]);

  function open(next: Route) {
    Keyboard.dismiss();
    setOverlay(null);
    setSortOpen(false);
    setRoutes((stack) => [...stack, next]);
  }

  function goHome() {
    setOverlay(null);
    setRoutes([home]);
    setCategory('전체');
  }

  function toggleFavorite(id: string) {
    setFavorites((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }

  function rememberSearch(value: string) {
    const term = value.trim();
    if (term) setHistory((terms) => [term, ...terms.filter((item) => item !== term)].slice(0, 8));
  }

  function submitSearch(value: string) {
    setQuery(value);
    rememberSearch(value);
    Keyboard.dismiss();
  }

  function openDetail(benefit: Benefit) {
    if (page === 'search') rememberSearch(query);
    setRecent((ids) => [benefit.id, ...ids.filter((id) => id !== benefit.id)]);
    open({ page: 'detail', benefit });
  }

  function applySort(value: Sort) {
    setSortOpen(false);
    setSort(value);
    if (value === '가까운 순' && !position) {
      setCategory('전체');
      setOverlay('location');
    }
  }

  function setLocation(allowed: boolean) {
    setPosition(allowed ? 'current' : 'campus');
    setOverlay(allowed ? null : 'campus');
  }

  const grid = (items: Benefit[], distance?: 'current' | 'campus') => (
    <BenefitGrid items={items} distance={distance} favorites={favorites} onFavorite={toggleFavorite} onOpen={openDetail} />
  );

  const showMenu = () => {
    Keyboard.dismiss();
    setSortOpen(false);
    setOverlay('menu');
  };

  function renderHome() {
    const nearby = sort === '가까운 순';
    const items = benefits.filter((item) =>
      (category === '전체' || item.category === category) && (!nearby || item.distances));
    if (sort === '인기순') items.sort((a, b) => b.popularity - a.popularity);
    if (nearby) {
      const reference = position ?? 'current';
      items.sort((a, b) => a.distances![reference] - b.distances![reference]);
    }
    const heading = nearby
      ? position === 'current' ? '내 주변 혜택' : position === 'campus' ? '에리카 주변 혜택' : '가까운 혜택'
      : `${category} 혜택`;

    return (
      <>
        <Pressable accessibilityRole="button" onPress={() => { setQuery(''); open({ page: 'search' }); }} style={styles.searchField}>
          <Icon name="search" />
          <Label color={colors.secondary}>혜택 검색</Label>
        </Pressable>
        <View style={styles.filters}>
          {categories.map((item) => (
            <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }}
              style={[styles.chip, category === item && styles.selectedChip]} onPress={() => {
                setCategory(item);
                setSortOpen(false);
                if (nearby && item !== '전체' && item !== '음식점') setSort('추천순');
              }}>
              <Label size={13} weight={category === item ? 'bold' : 'medium'}
                color={category === item ? colors.white : colors.secondary}>{item}</Label>
            </Pressable>
          ))}
        </View>
        <View style={styles.homeList}>
          <View style={[styles.listHeading, sortOpen && styles.listHeadingExpanded]}>
            <Label size={16} weight="bold">{heading}</Label>
            <Pressable accessibilityRole="button" accessibilityLabel={`정렬 선택, ${sort}`}
              accessibilityState={{ expanded: sortOpen }} onPress={() => setSortOpen((value) => !value)} style={styles.sortButton}>
              <Icon name="sort" />
              <Label size={13} color={colors.secondary}>{sort}</Label>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.cards} showsVerticalScrollIndicator={false}>
            {grid(items, nearby ? position ?? 'current' : undefined)}
          </ScrollView>
          {sortOpen && (
            <>
              <Pressable accessibilityLabel="정렬 닫기" onPress={() => setSortOpen(false)}
                style={styles.sortBackdrop} />
              <View style={styles.sortPanel}>
                {sorts.map((value) => (
                  <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: sort === value }}
                    onPress={() => applySort(value)} style={styles.sortOption}>
                    <Label size={14} weight={sort === value ? 'bold' : 'medium'} color={sort === value ? colors.primary : colors.text}>{value}</Label>
                    {sort === value && <Icon name="check" />}
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>
      </>
    );
  }

  function renderSearch() {
    const hasQuery = Boolean(query.trim());
    const matches = hasQuery ? findBenefits(query) : [];
    return (
      <>
        <View style={[styles.searchField, searchFocused && styles.searchFieldFocused]}>
          <Icon name="search" />
          <TextInput accessibilityLabel="혜택 이름 검색" value={query} onChangeText={setQuery}
            placeholder="혜택 이름을 입력하세요" placeholderTextColor={colors.secondary} returnKeyType="search"
            onSubmitEditing={() => submitSearch(query)} onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)} autoCorrect={false} style={[styles.input, Platform.OS === 'web' && styles.webInput]} />
          {query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="검색어 지우기"
            style={styles.clearButton} onPress={() => setQuery('')}><Icon name="clear" /></Pressable>}
        </View>
        {!hasQuery ? (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.searchHints}>
            <View style={styles.rowBetween}>
              <Label size={16} weight="bold">최근 검색어</Label>
              {history.length > 0 && <Pressable accessibilityRole="button" onPress={() => setHistory([])}>
                <Label size={13} color={colors.secondary}>전체 삭제</Label>
              </Pressable>}
            </View>
            <View style={styles.history}>
              {history.map((term) => (
                <View key={term} style={styles.historyChip}>
                  <Pressable accessibilityRole="button" onPress={() => submitSearch(term)}>
                    <Label size={12} color={colors.secondary}>{term}</Label>
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`${term} 삭제`} hitSlop={5}
                    onPress={() => setHistory((items) => items.filter((item) => item !== term))}><Icon name="close" /></Pressable>
                </View>
              ))}
            </View>
            <View style={styles.rule} />
            <Label size={16} weight="bold" style={styles.popularTitle}>인기 검색어</Label>
            {popularSearches.map((term, index) => (
              <Pressable key={term} accessibilityRole="button" onPress={() => submitSearch(term)} style={styles.popularRow}>
                <Label size={15} color={colors.accent}>{String(index + 1).padStart(2, '0')}</Label>
                <Label size={15} color={colors.body}>{term}</Label>
              </Pressable>
            ))}
          </ScrollView>
        ) : matches.length ? (
          <ScrollView contentContainerStyle={styles.cards} keyboardShouldPersistTaps="handled">
            <Label size={16} weight="bold" style={styles.resultsTitle}>검색 결과</Label>
            {grid(matches)}
          </ScrollView>
        ) : (
          <EmptyState icon="searchEmpty" title="검색 결과가 없어요" description="다른 혜택 이름이나 브랜드명으로 검색해 보세요." />
        )}
      </>
    );
  }

  function renderCollection() {
    const isFavorite = page === 'favorites';
    const ids = isFavorite ? favorites : recent;
    const items = ids.flatMap((id) => benefits.filter((benefit) => benefit.id === id));
    if (!items.length) {
      return <EmptyState icon={isFavorite ? 'bookmark' : 'recentEmpty'}
        title={isFavorite ? '아직 저장한 혜택이 없어요' : '아직 본 혜택이 없어요'}
        description={isFavorite ? '마음에 드는 혜택의 북마크를 눌러보세요.' : '혜택을 열어보면 여기에 모아볼 수 있어요.'}
        action={<Button onPress={goHome}>혜택 둘러보기</Button>} />;
    }
    return (
      <>
        <View style={[styles.rule, styles.collectionRule]} />
        <Label weight="bold" size={16} style={styles.collectionCount}>혜택 {items.length}개</Label>
        <ScrollView contentContainerStyle={styles.cards} showsVerticalScrollIndicator={false}>{grid(items)}</ScrollView>
      </>
    );
  }

  function renderDetail(benefit: Benefit) {
    const usedAlready = used.includes(benefit.id);
    return (
      <>
        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <View style={styles.vendorLogo} accessible={false}>
              <Icon name="vendor" />
              <Label size={5} style={styles.vendorPlaceholder}>관련 이미지/로고</Label>
            </View>
            <Label weight="semibold" color={colors.primary}>{benefit.category}</Label>
            <Label weight="semibold" color={colors.secondary}>/</Label>
            <Label weight="semibold" color={colors.body} style={styles.brandName}>{benefit.vendor}</Label>
          </View>
          <View style={styles.detailTitle}>
            <Label size={20} weight="extrabold" style={styles.brandName}>{benefit.title}</Label>
            <FavoriteButton detail saved={favorites.includes(benefit.id)} onPress={() => toggleFavorite(benefit.id)} />
          </View>
          <Artwork benefit={benefit} large />
          {(benefit.expired || usedAlready) && (
            <View style={styles.statusBox}>
              <Label weight="semibold" color={colors.secondary}>{benefit.expired ? '종료된 혜택이에요' : '이용한 혜택이에요'}</Label>
            </View>
          )}
          <View style={styles.eligibility}>
            <Label size={16} weight="bold">이용 대상</Label>
            <Label color={colors.body} style={styles.eligibilityText}>한양대학교 ERICA 재학생 · 학생증 소지자</Label>
          </View>
          <View style={styles.rule} />
          <Label size={16} weight="bold" style={styles.detailHeading}>기간 및 이용 방법</Label>
          <View style={styles.detailLine}>
            <Label weight="semibold" style={styles.detailKey}>기간</Label>
            <Label color={colors.body}>{benefit.expired ? '2026.09.01 – 2026.10.31' : '2026.09.01 – 2026.12.18'}</Label>
          </View>
          <View style={styles.detailLine}>
            <Label weight="semibold" style={styles.detailKey}>이용</Label>
            <Label color={colors.body} style={styles.brandName}>{benefit.instructions ?? benefit.note}</Label>
          </View>
        </ScrollView>
        <View style={styles.detailFooter}>
          <Button onPress={benefit.expired || usedAlready ? goHome : () => setOverlay('use')}>
            {benefit.expired || usedAlready ? '혜택 둘러보기' : '혜택 신청 페이지 열기'}
          </Button>
        </View>
      </>
    );
  }

  function renderOverlay() {
    const close = () => setOverlay(null);
    return (
      <Modal visible={overlay !== null} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
        <View style={styles.modalViewport}>
          <View style={styles.modalScreen}>
            <Pressable accessibilityLabel="팝업 닫기" onPress={close} style={styles.scrim} />
            {overlay === 'menu' ? (
              <SafeAreaView edges={['top', 'bottom']} style={styles.drawer} accessibilityViewIsModal>
                <View style={styles.drawerHeader}>
                  <IconButton icon="back" label="메뉴 닫기" onPress={close} />
                  <Label size={17} weight="bold">메뉴</Label>
                </View>
                {(['favorites', 'recent'] as const).map((item) => (
                  <Pressable key={item} accessibilityRole="button" style={styles.drawerRow} onPress={() => open({ page: item })}>
                    <Icon name={item === 'favorites' ? 'bookmark' : 'clock'} />
                    <Label size={15} style={styles.drawerLabel}>{titles[item]}</Label>
                    <Icon name="next" />
                  </Pressable>
                ))}
              </SafeAreaView>
            ) : (
              <View style={styles.dialog} accessibilityViewIsModal>
                {overlay === 'location' || overlay === 'campus' ? (
                  <>
                    <View style={styles.dialogIcon}><Icon name="pin" /></View>
                    <Label size={17} weight="bold">{overlay === 'location' ? '현재 위치를 사용하도록 허용할까요?' : '에리카 기준으로 보여드릴게요'}</Label>
                    <Label size={14} color={colors.secondary} style={styles.dialogDescription}>
                      {overlay === 'location' ? '내 위치에서 가까운 매장 혜택을 찾을 수 있어요.' : '위치 접근을 허용하지 않아 캠퍼스를 기준으로 정렬해요.'}
                    </Label>
                    {overlay === 'location' ? (
                      <View style={styles.dialogActions}>
                        <View style={styles.action}><Button secondary onPress={() => setLocation(false)}>허용 안 함</Button></View>
                        <View style={styles.action}><Button onPress={() => setLocation(true)}>허용</Button></View>
                      </View>
                    ) : <View style={styles.dialogActions}><View style={styles.action}><Button onPress={close}>확인</Button></View></View>}
                  </>
                ) : overlay === 'use' && route.page === 'detail' ? (
                  <>
                    <Label size={20} weight="bold" style={styles.dialogCenter}>혜택을 이용하셨나요?</Label>
                    <View style={styles.useActions}>
                      <Button onPress={() => { setUsed((ids) => [...ids, route.benefit.id]); close(); }}>네, 이용했어요</Button>
                      <Button secondary onPress={close}>아직 이용하지 않았어요</Button>
                      <Pressable accessibilityRole="button" onPress={close} style={styles.later}>
                        <Label size={13} color={colors.secondary}>나중에</Label>
                      </Pressable>
                    </View>
                  </>
                ) : null}
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.viewport}>
      <SafeAreaView style={[styles.screen, Platform.OS === 'web' && styles.webSafeTop, width > 520 && styles.desktopScreen]}>
        <View style={[styles.header, page === 'home' ? styles.homeHeader : styles.innerHeader]}>
          {page !== 'home' && <IconButton icon="back" label="뒤로 가기" onPress={goBack} />}
          <Label size={page === 'home' ? 24 : 17} weight="bold" color={page === 'home' ? colors.primary : colors.text}
            accessibilityRole="header" style={styles.headerTitle}>{titles[page]}</Label>
          {(page === 'home' || page === 'detail' || page === 'search') &&
            <IconButton icon="menu" label="메뉴 열기" onPress={showMenu} />}
        </View>
        {page === 'home' ? renderHome() : page === 'search' ? renderSearch()
          : route.page === 'detail' ? renderDetail(route.benefit) : renderCollection()}
      </SafeAreaView>
      {overlay && renderOverlay()}
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.background },
  viewport: { flex: 1, alignItems: 'center', backgroundColor: colors.background },
  screen: { flex: 1, width: '100%', maxWidth: 520, backgroundColor: colors.background },
  desktopScreen: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.field },
  webSafeTop: { marginTop: 44 },
  header: { height: 66, flexDirection: 'row', alignItems: 'center', paddingRight: 16 },
  homeHeader: { paddingLeft: 24 },
  innerHeader: { paddingLeft: 10, gap: 6 },
  headerTitle: { flex: 1 },
  searchField: { height: 42, marginHorizontal: 20, paddingHorizontal: 10, gap: 10, borderRadius: 10,
    backgroundColor: colors.field, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'transparent' },
  searchFieldFocused: { borderColor: colors.primary },
  input: { flex: 1, alignSelf: 'stretch', paddingVertical: 0, fontSize: 14, color: colors.body, fontFamily: fonts.regular },
  webInput: { outlineWidth: 0 },
  clearButton: { height: 38, width: 22, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 7, paddingHorizontal: 24, paddingTop: 16 },
  chip: { flexShrink: 1, width: 60, minHeight: 30, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 999 },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  homeList: { flex: 1, marginTop: 26 },
  listHeading: { paddingLeft: 24, paddingRight: 20, paddingBottom: 8, height: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listHeadingExpanded: { height: 53 },
  sortButton: { minHeight: 40, gap: 4, flexDirection: 'row', alignItems: 'center' },
  sortBackdrop: { position: 'absolute', top: 45, bottom: 0, left: 0, right: 0 },
  sortPanel: { position: 'absolute', top: 43, right: 20, width: 129, borderRadius: 16, paddingVertical: 2,
    backgroundColor: colors.white, shadowColor: '#000000', shadowOpacity: 0.14,
    shadowRadius: 5, shadowOffset: { width: 0, height: 1 }, elevation: 6 },
  sortOption: { minHeight: 40, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cards: { paddingHorizontal: 20, paddingBottom: 24 },
  searchHints: { paddingTop: 42, paddingHorizontal: 24, paddingBottom: 24 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  history: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 21, marginBottom: 36 },
  historyChip: { flexDirection: 'row', gap: 20, alignItems: 'center', minHeight: 30,
    paddingHorizontal: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  rule: { height: 1, backgroundColor: colors.field },
  popularTitle: { marginTop: 29, marginBottom: 19 },
  popularRow: { minHeight: 38, flexDirection: 'row', gap: 20, alignItems: 'center' },
  resultsTitle: { marginTop: 33, marginBottom: 16, marginLeft: 4 },
  collectionRule: { marginHorizontal: 24, marginTop: -3 },
  collectionCount: { marginTop: 16, marginBottom: 22, marginHorizontal: 24 },
  detailContent: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vendorLogo: { alignItems: 'center', justifyContent: 'center' },
  vendorPlaceholder: { position: 'absolute', left: -2, right: -2, textAlign: 'center' },
  brandName: { flex: 1 },
  detailTitle: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 9 },
  eligibility: { marginTop: 39, marginBottom: 17 },
  eligibilityText: { marginTop: 15 },
  detailHeading: { marginTop: 18, marginBottom: 17 },
  detailLine: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  detailKey: { width: 43 },
  statusBox: { marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: colors.field },
  detailFooter: { borderTopWidth: 1, borderColor: colors.field, paddingTop: 18, paddingBottom: 28, paddingHorizontal: 24 },
  modalViewport: { flex: 1, alignItems: 'center' },
  modalScreen: { flex: 1, width: '100%', maxWidth: 520, justifyContent: 'center' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(35, 38, 50, 0.38)' },
  drawer: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '79%', maxWidth: 316,
    borderTopLeftRadius: 24, borderBottomLeftRadius: 24, backgroundColor: colors.white, paddingTop: 8, paddingHorizontal: 14 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 23 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: 31, paddingHorizontal: 10 },
  drawerLabel: { flex: 1 },
  dialog: { marginHorizontal: 24, padding: 20, borderRadius: 20, backgroundColor: colors.white },
  dialogIcon: { marginLeft: 4, marginBottom: 13 },
  dialogDescription: { marginTop: 4 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 25 },
  action: { flex: 1 },
  dialogCenter: { textAlign: 'center' },
  useActions: { gap: 8, marginTop: 22 },
  later: { alignItems: 'center', paddingVertical: 8 },
});
