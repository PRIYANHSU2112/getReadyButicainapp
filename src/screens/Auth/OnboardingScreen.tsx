import React, {useState, useRef, useMemo} from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
  StatusBar,
  Text,
  Animated,
  Platform,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  image: any;
  title: string;
  description: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "slide_1",
    image: IMAGES.ONBOARDING_ONE,
    title: "Welcome &\nEmpowerment",
    description:
      "Your all-in-one platform to manage bookings, track earnings, and grow your beauty career effortlessly.",
  },
  {
    id: "slide_2",
    image: IMAGES.ONBOARDING_TWO,
    title: "Earn More, Track\nBetter",
    description:
      "Track your service earnings, hit monthly targets, and withdraw your payouts directly to your bank account anytime.",
  },
  {
    id: "slide_3",
    image: IMAGES.ONBOARDING_THREE,
    title: "Bookings at Your\nFingertips",
    description:
      "Receive real-time client requests, navigate to locations easily, and manage your daily schedule with zero stress.",
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export const OnboardingScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Handle scroll events with smooth index calculation
  const handleScroll = useMemo(
    () => Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}], {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        if (index !== currentIndex && index >= 0 && index < ONBOARDING_SLIDES.length) {
          setCurrentIndex(index);
        }
      },
    }),
    [currentIndex, scrollX]
  );

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      navigation.replace("Login");
    }
  };

  const handleSkip = () => {
    navigation.replace("Login");
  };

  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;

  const renderSlide = ({item}: {item: OnboardingSlide}) => {
    return (
      <View style={styles.slideItem}>
        {/* Hero Photo Section with seamless white gradient overlay */}
        <View style={styles.heroContainer}>
          <Image
            source={item.image}
            style={styles.heroImage}
            resizeMode="cover"
            accessible
            accessibilityLabel={item.title}
          />
          <Image
            source={IMAGES.WHITE_GRADIENT_OVERLAY}
            style={styles.gradientOverlay}
            resizeMode="stretch"
          />
        </View>

        {/* Text Details Section */}
        <View style={styles.contentSection}>
          <Text
            maxFontSizeMultiplier={1.3}
            style={styles.titleText}>
            {item.title}
          </Text>

          <Text
            maxFontSizeMultiplier={1.3}
            style={styles.descriptionText}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle="dark-content"
        {...({translucent: true, backgroundColor: "transparent"} as any)}
      />

      {/* Floating Top-Right Skip Button */}
      <TouchableOpacity
        onPress={handleSkip}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        style={[
          styles.skipButton,
          {top: Math.max(insets.top + 8, Platform.OS === "android" ? 36 : 48)},
        ]}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      {/* Horizontal Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Bottom Sticky Action Area: Pagination Indicators + Next Button */}
      <View
        style={[
          styles.bottomActionContainer,
          {paddingBottom: Math.max(insets.bottom + 16, 28)},
        ]}>
        {/* Pagination Dots */}
        <View
          style={styles.paginationContainer}
          accessible
          accessibilityLabel={`Step ${currentIndex + 1} of ${ONBOARDING_SLIDES.length}`}>
          {ONBOARDING_SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [18, 28, 18],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: "clamp",
            });

            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: ["#D1D5DB", "#114B3E", "#D1D5DB"],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button matching Figma screenshot emerald color */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Get Started" : "Next Slide"}
          style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            {isLast ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HERO_HEIGHT = SCREEN_HEIGHT * 0.58;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipButton: {
    position: "absolute",
    right: 20,
    zIndex: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  skipButtonText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.3,
  },
  slideItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#FFFFFF",
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 120,
  },
  contentSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingTop: 10,
    alignItems: "center",
  },
  titleText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 33,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 13.5,
    fontWeight: "400",
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  bottomActionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    height: 10,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  actionButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#114B3E", // Deep emerald matching Figma screenshot
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
