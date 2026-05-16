import React, { useEffect, useMemo, useRef, useState }
  from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, G }
  from "react-native-svg";

import { CategoryTotal }
  from "../../domain/entities/InsightsDashboard";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export function DonutChart({
  categories,
}: {
  categories: CategoryTotal[];
}) {
  const total = useMemo(
    () => categories.reduce(
      (acc, c) => acc + c.value,
      0,
    ),
    [categories],
  );

  const SIZE = 160;
  const STROKE = 22;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE =
    2 * Math.PI * RADIUS;

  const scaleAnim =
    useRef(new Animated.Value(0)).current;
  const opacityAnim =
    useRef(new Animated.Value(0)).current;
  const progressAnim =
    useRef(new Animated.Value(0)).current;

  const [progress, setProgress] = useState(0);

  const segments = useMemo(() => {
    let acc = 0;
    return categories.map((cat) => {
      const percent =
        cat.value / total;
      const dash =
        percent * CIRCUMFERENCE;
      const gapAdjustedDash =
        Math.max(dash - 3, 0);
      const offset =
        CIRCUMFERENCE *
        (1 - acc);
      acc += percent;
      return {
        ...cat,
        percent,
        dash,
        gapAdjustedDash,
        offset,
      };
    });
  }, [
    categories,
    total,
    CIRCUMFERENCE,
  ]);

  useEffect(() => {
    const id = progressAnim.addListener(
      ({ value }) => {
        setProgress(value);
      },
    );

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        easing:
          Easing.out(Easing.circle),
        useNativeDriver: false,
      }),
    ]).start();

    return () => {
      progressAnim.removeListener(id);
    };
  }, []);

  if (total <= 0) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.centerFallback,
            {
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE / 2,
            },
          ]}
        >
          <Text style={styles.centerLabel}>
            Total
          </Text>
          <Text style={styles.centerValue}>
            {formatCurrency(0)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View
        style={{
          width: SIZE,
          height: SIZE,
        }}
      >
        <Svg width={SIZE} height={SIZE}>
          <G
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          >
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#334155"
              strokeWidth={STROKE}
              fill="none"
            />

            {segments.map((seg) => {
              const currentDash =
                seg.gapAdjustedDash *
                progress;
              const currentGap =
                CIRCUMFERENCE -
                currentDash;

              return (
                <Circle
                  key={seg.label}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={seg.color}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeLinecap="butt"
                  strokeDasharray={`${currentDash} ${currentGap}`}
                  strokeDashoffset={
                    seg.offset
                  }
                />
              );
            })}
          </G>
        </Svg>

        <View
          style={[
            styles.center,
            {
              width:
                SIZE - STROKE * 2,
              height:
                SIZE - STROKE * 2,
              borderRadius:
                (SIZE - STROKE * 2) / 2,
              top: STROKE,
              left: STROKE,
            },
          ]}
        >
          <Text style={styles.centerLabel}>
            Total
          </Text>
          <Text style={styles.centerValue}>
            {formatCurrency(
              Math.round(
                total * progress,
              ),
            )}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  centerFallback: {
    backgroundColor: "#1E293B",
    borderWidth: 22,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 2,
  },
  centerValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F1F5F9",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
