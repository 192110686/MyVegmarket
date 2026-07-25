"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AreaSeries,
  CrosshairMode,
  LineSeries,
  type BusinessDay,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
  createChart,
} from "lightweight-charts";

export type TVPoint = {
  time: string;
  value: number;
};

export type RangeKey =
  | "1D"
  | "1W"
  | "1M"
  | "3M"
  | "6M"
  | "1Y"
  | "52W"
  | "ALL"
  | "MAX";

type ViewMode = "MY" | "MARKET" | "COMPARE";
type PriceMode = "ABS" | "PCT";
type BucketUnit = "RAW" | "DAY" | "WEEK" | "MONTH" | "YEAR";

export type AggregatedPricePoint = {
  time: UTCTimestamp;
  sourceTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  average: number;
  median: number;
  updateCount: number;
};

export type VisiblePriceStats = {
  from: string;
  to: string;
  current: number | null;
  average: number | null;
  high: number | null;
  low: number | null;
  median: number | null;
  updateCount: number;
  change: number | null;
  changePercent: number | null;
};

type Props = {
  title: string;
  myveg: TVPoint[];
  market?: TVPoint[];
  height?: number;
  range: RangeKey;
  onAvgTextChange?: (text: string) => void;
  onVisibleStatsChange?: (stats: VisiblePriceStats | null) => void;
};

type CleanPoint = {
  time: UTCTimestamp;
  sourceTime: string;
  value: number;
};

const EMPTY_STATS: VisiblePriceStats = {
  from: "",
  to: "",
  current: null,
  average: null,
  high: null,
  low: null,
  median: null,
  updateCount: 0,
  change: null,
  changePercent: null,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseTime(value: string): UTCTimestamp | null {
  if (!value) return null;

  if (isDateOnly(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const seconds = Date.UTC(year, month - 1, day, 0, 0, 0) / 1000;
    return Number.isFinite(seconds) ? (seconds as UTCTimestamp) : null;
  }

  const milliseconds = new Date(value).getTime();
  if (!Number.isFinite(milliseconds)) return null;

  return Math.floor(milliseconds / 1000) as UTCTimestamp;
}

function cleanSeries(points: TVPoint[]): CleanPoint[] {
  const byTimestamp = new Map<number, CleanPoint>();

  for (const point of points ?? []) {
    const time = parseTime(point.time);
    const value = Number(point.value);

    if (time == null || !Number.isFinite(value) || value <= 0) continue;

    byTimestamp.set(Number(time), {
      time,
      sourceTime: point.time,
      value,
    });
  }

  return [...byTimestamp.values()].sort(
    (first, second) => Number(first.time) - Number(second.time),
  );
}

function median(values: number[]) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function startOfUtcDay(timestamp: UTCTimestamp): UTCTimestamp {
  const date = new Date(Number(timestamp) * 1000);
  return Math.floor(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ) / 1000,
  ) as UTCTimestamp;
}

function startOfUtcWeek(timestamp: UTCTimestamp): UTCTimestamp {
  const dayStart = startOfUtcDay(timestamp);
  const date = new Date(Number(dayStart) * 1000);
  const weekday = date.getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;

  return (Number(dayStart) - daysFromMonday * 86_400) as UTCTimestamp;
}

function startOfUtcMonth(timestamp: UTCTimestamp): UTCTimestamp {
  const date = new Date(Number(timestamp) * 1000);

  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1) / 1000,
  ) as UTCTimestamp;
}

function startOfUtcYear(timestamp: UTCTimestamp): UTCTimestamp {
  const date = new Date(Number(timestamp) * 1000);

  return Math.floor(
    Date.UTC(date.getUTCFullYear(), 0, 1) / 1000,
  ) as UTCTimestamp;
}

function bucketStart(
  timestamp: UTCTimestamp,
  unit: BucketUnit,
): UTCTimestamp {
  switch (unit) {
    case "DAY":
      return startOfUtcDay(timestamp);
    case "WEEK":
      return startOfUtcWeek(timestamp);
    case "MONTH":
      return startOfUtcMonth(timestamp);
    case "YEAR":
      return startOfUtcYear(timestamp);
    case "RAW":
    default:
      return timestamp;
  }
}

function unitForRange(range: RangeKey): BucketUnit {
  switch (range) {
    case "1D":
      return "RAW";
    case "1W":
    case "1M":
      return "DAY";
    case "3M":
    case "6M":
    case "52W":
      return "WEEK";
    case "1Y":
      return "MONTH";
    case "ALL":
    case "MAX":
      return "MONTH";
    default:
      return "DAY";
  }
}

function aggregateSeries(
  points: CleanPoint[],
  unit: BucketUnit,
): AggregatedPricePoint[] {
  if (!points.length) return [];

  if (unit === "RAW") {
    return points.map((point) => ({
      time: point.time,
      sourceTime: point.sourceTime,
      open: point.value,
      high: point.value,
      low: point.value,
      close: point.value,
      average: point.value,
      median: point.value,
      updateCount: 1,
    }));
  }

  const groups = new Map<number, CleanPoint[]>();

  for (const point of points) {
    const key = Number(bucketStart(point.time, unit));
    const current = groups.get(key) ?? [];
    current.push(point);
    groups.set(key, current);
  }

  return [...groups.entries()]
    .sort(([first], [second]) => first - second)
    .map(([time, group]) => {
      const sorted = [...group].sort(
        (first, second) => Number(first.time) - Number(second.time),
      );
      const values = sorted.map((point) => point.value);
      const total = values.reduce((sum, value) => sum + value, 0);

      return {
        time: time as UTCTimestamp,
        sourceTime: sorted[sorted.length - 1].sourceTime,
        open: sorted[0].value,
        high: Math.max(...values),
        low: Math.min(...values),
        close: sorted[sorted.length - 1].value,
        average: total / values.length,
        median: median(values),
        updateCount: values.length,
      };
    });
}

function toPercentSeries(points: AggregatedPricePoint[]) {
  if (!points.length) return [];

  const base = points[0].close;
  if (!Number.isFinite(base) || base === 0) return [];

  return points.map((point) => ({
    time: point.time,
    value: ((point.close - base) / base) * 100,
  }));
}

function toPriceSeries(points: AggregatedPricePoint[]) {
  return points.map((point) => ({
    time: point.time,
    value: point.close,
  }));
}

function timeToSeconds(time: Time): number | null {
  if (typeof time === "number") return time;

  if (typeof time === "string") {
    return parseTime(time);
  }

  const businessDay = time as BusinessDay;
  const seconds =
    Date.UTC(
      businessDay.year,
      businessDay.month - 1,
      businessDay.day,
    ) / 1000;

  return Number.isFinite(seconds) ? seconds : null;
}

function formatAED(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "-";
  return `AED ${value.toFixed(2)}`;
}

function formatPercent(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatDateTime(timestamp: number) {
  const date = new Date(timestamp * 1000);

  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000);

  return date.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getIsoWeek(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const target = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );

  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
}

function visibleDurationDays(
  from: Time | undefined,
  to: Time | undefined,
) {
  if (from == null || to == null) return null;

  const fromSeconds = timeToSeconds(from);
  const toSeconds = timeToSeconds(to);

  if (fromSeconds == null || toSeconds == null) return null;

  return Math.abs(toSeconds - fromSeconds) / 86_400;
}

function createDynamicTickFormatter(
  visibleDurationRef: React.MutableRefObject<number | null>,
) {
  return (time: Time) => {
    const seconds = timeToSeconds(time);
    if (seconds == null) return "";

    const date = new Date(seconds * 1000);
    const visibleDays = visibleDurationRef.current ?? 30;

    if (visibleDays <= 2) {
      return date.toLocaleTimeString("en-US", {
        timeZone: "Asia/Dubai",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (visibleDays <= 10) {
      return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        weekday: "short",
      });
    }

    if (visibleDays <= 45) {
      return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        day: "numeric",
        month: "short",
      });
    }

    if (visibleDays <= 400) {
      return `W${String(getIsoWeek(seconds)).padStart(2, "0")}`;
    }

    if (visibleDays <= 1_500) {
      return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "short",
        year: "2-digit",
      });
    }

    return String(date.getUTCFullYear());
  };
}

function calculateVisibleStats(
  rawPoints: CleanPoint[],
  from: Time,
  to: Time,
): VisiblePriceStats | null {
  const fromSeconds = timeToSeconds(from);
  const toSeconds = timeToSeconds(to);

  if (fromSeconds == null || toSeconds == null) return null;

  const lower = Math.min(fromSeconds, toSeconds);
  const upper = Math.max(fromSeconds, toSeconds);

  const visible = rawPoints.filter(
    (point) =>
      Number(point.time) >= lower && Number(point.time) <= upper,
  );

  if (!visible.length) return null;

  const values = visible.map((point) => point.value);
  const first = visible[0].value;
  const current = visible[visible.length - 1].value;
  const change = current - first;
  const changePercent = first === 0 ? null : (change / first) * 100;

  return {
    from: visible[0].sourceTime,
    to: visible[visible.length - 1].sourceTime,
    current,
    average:
      values.reduce((sum, value) => sum + value, 0) / values.length,
    high: Math.max(...values),
    low: Math.min(...values),
    median: median(values),
    updateCount: visible.length,
    change,
    changePercent,
  };
}

function visibleBarsForRange(range: RangeKey) {
  switch (range) {
    case "1D":
      return 20;
    case "1W":
      return 7;
    case "1M":
      return 30;
    case "3M":
      return 13;
    case "6M":
      return 26;
    case "1Y":
      return 12;
    case "52W":
      return 52;
    case "ALL":
    case "MAX":
      return null;
    default:
      return 30;
  }
}

export default function ProductTrendTVChart({
  title,
  myveg,
  market = [],
  height = 430,
  range,
  onAvgTextChange,
  onVisibleStatsChange,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const mySeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const marketSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeTooltipRef = useRef<HTMLDivElement | null>(null);

  const rawMyRef = useRef<CleanPoint[]>([]);
  const rawMarketRef = useRef<CleanPoint[]>([]);
  const aggregatedMyRef = useRef<AggregatedPricePoint[]>([]);
  const aggregatedMarketRef = useRef<AggregatedPricePoint[]>([]);

  const viewRef = useRef<ViewMode>("MY");
  const modeRef = useRef<PriceMode>("ABS");
  const visibleDurationRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastAverageTextRef = useRef("");
  const lastStatsSignatureRef = useRef("");

  const cleanMy = useMemo(() => cleanSeries(myveg), [myveg]);
  const cleanMarket = useMemo(() => cleanSeries(market), [market]);
  const bucketUnit = useMemo(() => unitForRange(range), [range]);

  const aggregatedMy = useMemo(
    () => aggregateSeries(cleanMy, bucketUnit),
    [cleanMy, bucketUnit],
  );

  const aggregatedMarket = useMemo(
    () => aggregateSeries(cleanMarket, bucketUnit),
    [cleanMarket, bucketUnit],
  );

  const hasMy = cleanMy.length > 0;
  const hasMarket = cleanMarket.length > 0;

  const initialView: ViewMode =
    hasMy && hasMarket ? "COMPARE" : hasMarket ? "MARKET" : "MY";

  const [view, setView] = useState<ViewMode>(initialView);
  const [mode, setMode] = useState<PriceMode>("ABS");
  const [visibleStats, setVisibleStats] =
    useState<VisiblePriceStats | null>(null);

  useEffect(() => {
    if (view === "MY" && !hasMy && hasMarket) setView("MARKET");
    if (view === "MARKET" && !hasMarket && hasMy) setView("MY");
    if (view === "COMPARE" && !(hasMy && hasMarket)) {
      setView(hasMarket ? "MARKET" : "MY");
    }
  }, [hasMarket, hasMy, view]);

  useEffect(() => {
    rawMyRef.current = cleanMy;
    rawMarketRef.current = cleanMarket;
    aggregatedMyRef.current = aggregatedMy;
    aggregatedMarketRef.current = aggregatedMarket;
  }, [aggregatedMarket, aggregatedMy, cleanMarket, cleanMy]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const publishVisibleStats = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const visibleRange = chart.timeScale().getVisibleRange();
    if (!visibleRange) return;

    visibleDurationRef.current = visibleDurationDays(
      visibleRange.from,
      visibleRange.to,
    );

    const activeRaw =
      viewRef.current === "MARKET"
        ? rawMarketRef.current
        : rawMyRef.current.length
          ? rawMyRef.current
          : rawMarketRef.current;

    const stats = calculateVisibleStats(
      activeRaw,
      visibleRange.from,
      visibleRange.to,
    );

    const nextStats = stats ?? EMPTY_STATS;
    const signature = JSON.stringify(nextStats);

    if (signature !== lastStatsSignatureRef.current) {
      lastStatsSignatureRef.current = signature;
      setVisibleStats(stats);
      onVisibleStatsChange?.(stats);
    }

    const parts: string[] = [];

    if (viewRef.current !== "MARKET" && rawMyRef.current.length) {
      const myStats = calculateVisibleStats(
        rawMyRef.current,
        visibleRange.from,
        visibleRange.to,
      );
      parts.push(
        `MyVeg Avg: ${formatAED(myStats?.average ?? null)}`,
      );
    }

    if (viewRef.current !== "MY" && rawMarketRef.current.length) {
      const marketStats = calculateVisibleStats(
        rawMarketRef.current,
        visibleRange.from,
        visibleRange.to,
      );
      parts.push(
        `Market Avg: ${formatAED(marketStats?.average ?? null)}`,
      );
    }

    const averageText = parts.length
      ? parts.join("  •  ")
      : "Average: -";

    if (averageText !== lastAverageTextRef.current) {
      lastAverageTextRef.current = averageText;
      onAvgTextChange?.(averageText);
    }

    chart.applyOptions({
      timeScale: {
        tickMarkFormatter: createDynamicTickFormatter(
          visibleDurationRef,
        ),
      } as never,
    });
  }, [onAvgTextChange, onVisibleStatsChange]);

  const scheduleVisibleUpdate = useCallback(() => {
    if (animationFrameRef.current != null) return;

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      publishVisibleStats();
    });
  }, [publishVisibleStats]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || chartRef.current) return;

    const chart = createChart(container, {
      width: container.clientWidth || 900,
      height,
      autoSize: false,

      layout: {
        background: { color: "transparent" },
        textColor: "rgba(17, 23, 19, 0.82)",
        attributionLogo: false,
      },

      localization: {
        locale: "en-US",
        priceFormatter: (price: number) =>
          modeRef.current === "PCT"
            ? formatPercent(price)
            : formatAED(price),
      },

      grid: {
        vertLines: { color: "rgba(17, 23, 19, 0.055)" },
        horzLines: { color: "rgba(17, 23, 19, 0.055)" },
      },

      rightPriceScale: {
        visible: true,
        borderVisible: true,
        borderColor: "rgba(17, 23, 19, 0.14)",
        ticksVisible: true,
        entireTextOnly: true,
        autoScale: true,
        scaleMargins: {
          top: 0.14,
          bottom: 0.14,
        },
      },

      leftPriceScale: {
        visible: false,
      },

      timeScale: {
        visible: true,
        borderVisible: true,
        borderColor: "rgba(17, 23, 19, 0.14)",
        ticksVisible: true,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
        rightOffset: 2,
        rightBarStaysOnScroll: false,
        barSpacing: 18,
        minBarSpacing: 2,
        lockVisibleTimeRangeOnResize: true,
        tickMarkFormatter: createDynamicTickFormatter(
          visibleDurationRef,
        ),
      },

      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          visible: true,
          labelVisible: false,
          width: 1,
          style: 2,
          color: "rgba(17, 23, 19, 0.38)",
        },
        horzLine: {
          visible: true,
          labelVisible: true,
          width: 1,
          style: 2,
          color: "rgba(17, 23, 19, 0.2)",
        },
      },

      handleScroll: {
        pressedMouseMove: true,
        mouseWheel: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },

      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
        mouseWheel: true,
        pinch: true,
      },

      kineticScroll: {
        mouse: true,
        touch: true,
      },
    });

    chartRef.current = chart;

    mySeriesRef.current = chart.addSeries(AreaSeries, {
      lineWidth: 3,
      lineColor: "rgba(22, 163, 74, 0.96)",
      topColor: "rgba(22, 163, 74, 0.18)",
      bottomColor: "rgba(22, 163, 74, 0.01)",
      priceLineVisible: true,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    });

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !chartRef.current) return;

      const width = Math.max(
        320,
        Math.floor(entry.contentRect.width),
      );

      chartRef.current.resize(width, height);
      scheduleVisibleUpdate();
    });

    resizeObserver.observe(container);

    const onVisibleRangeChange = () => scheduleVisibleUpdate();
    chart
      .timeScale()
      .subscribeVisibleTimeRangeChange(onVisibleRangeChange);

    const onCrosshairMove = (param: {
      time?: Time;
      point?: { x: number; y: number };
      seriesData: Map<ISeriesApi<"Area" | "Line">, unknown>;
    }) => {
      const tooltip = tooltipRef.current;
      const timeTooltip = timeTooltipRef.current;
      const wrapper = wrapperRef.current;

      if (!tooltip || !timeTooltip || !wrapper) return;

      if (!param.time || !param.point) {
        tooltip.style.opacity = "0";
        timeTooltip.style.opacity = "0";
        return;
      }

      const mySeries = mySeriesRef.current;
      const marketSeries = marketSeriesRef.current;

      const myValue = mySeries
        ? Number(
            (
              param.seriesData.get(
                mySeries as ISeriesApi<"Area" | "Line">,
              ) as { value?: number } | undefined
            )?.value,
          )
        : Number.NaN;

      const marketValue = marketSeries
        ? Number(
            (
              param.seriesData.get(
                marketSeries as ISeriesApi<"Area" | "Line">,
              ) as { value?: number } | undefined
            )?.value,
          )
        : Number.NaN;

      const seconds = timeToSeconds(param.time);
      const selectedPoint =
        seconds == null
          ? null
          : aggregatedMyRef.current.find(
              (point) => Number(point.time) === seconds,
            ) ??
            aggregatedMarketRef.current.find(
              (point) => Number(point.time) === seconds,
            ) ??
            null;

      const formatter =
        modeRef.current === "PCT"
          ? formatPercent
          : formatAED;

      const lines: string[] = [];

      if (
        viewRef.current !== "MARKET" &&
        Number.isFinite(myValue)
      ) {
        lines.push(`MyVeg: ${formatter(myValue)}`);
      }

      if (
        viewRef.current !== "MY" &&
        Number.isFinite(marketValue)
      ) {
        lines.push(`Market: ${formatter(marketValue)}`);
      }

      if (selectedPoint && modeRef.current === "ABS") {
        lines.push(
          `High ${formatAED(selectedPoint.high)}  •  Low ${formatAED(
            selectedPoint.low,
          )}`,
        );
        lines.push(
          `Avg ${formatAED(
            selectedPoint.average,
          )}  •  Median ${formatAED(selectedPoint.median)}`,
        );
        lines.push(
          `${selectedPoint.updateCount} update${
            selectedPoint.updateCount === 1 ? "" : "s"
          }`,
        );
      }

      tooltip.textContent = lines.join("\n");
      tooltip.style.opacity = "1";

      const wrapperRect = wrapper.getBoundingClientRect();
      const timeWidth = 190;
      const left = clamp(
        param.point.x - timeWidth / 2,
        8,
        wrapperRect.width - timeWidth - 8,
      );

      timeTooltip.textContent =
        seconds == null
          ? ""
          : visibleDurationRef.current != null &&
              visibleDurationRef.current <= 2
            ? formatDateTime(seconds)
            : formatDate(seconds);

      timeTooltip.style.transform = `translateX(${left}px)`;
      timeTooltip.style.opacity = "1";
    };

    chart.subscribeCrosshairMove(onCrosshairMove as never);

    return () => {
      resizeObserver.disconnect();

      try {
        chart
          .timeScale()
          .unsubscribeVisibleTimeRangeChange(
            onVisibleRangeChange,
          );
      } catch {}

      try {
        chart.unsubscribeCrosshairMove(
          onCrosshairMove as never,
        );
      } catch {}

      try {
        chart.remove();
      } catch {}

      chartRef.current = null;
      mySeriesRef.current = null;
      marketSeriesRef.current = null;

      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = null;
    };
  }, [height, scheduleVisibleUpdate]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.applyOptions({
      localization: {
        locale: "en-US",
        priceFormatter: (price: number) =>
          mode === "PCT"
            ? formatPercent(price)
            : formatAED(price),
      },
    });
  }, [mode]);

  useEffect(() => {
    const chart = chartRef.current;
    const mySeries = mySeriesRef.current;

    if (!chart || !mySeries) return;

    const myData =
      mode === "PCT"
        ? toPercentSeries(aggregatedMy)
        : toPriceSeries(aggregatedMy);

    const marketData =
      mode === "PCT"
        ? toPercentSeries(aggregatedMarket)
        : toPriceSeries(aggregatedMarket);

    mySeries.setData(myData);

    mySeries.applyOptions({
      visible: view !== "MARKET" && myData.length > 0,
    });

    const shouldShowMarket =
      view !== "MY" && marketData.length > 0;

    if (shouldShowMarket && !marketSeriesRef.current) {
      marketSeriesRef.current = chart.addSeries(LineSeries, {
        lineWidth: 2,
        color: "rgba(37, 99, 235, 0.94)",
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        priceFormat: {
          type: "price",
          precision: 2,
          minMove: 0.01,
        },
      });
    }

    if (marketSeriesRef.current) {
      marketSeriesRef.current.setData(marketData);
      marketSeriesRef.current.applyOptions({
        visible: shouldShowMarket,
      });
    }

    scheduleVisibleUpdate();
  }, [
    aggregatedMarket,
    aggregatedMy,
    mode,
    scheduleVisibleUpdate,
    view,
  ]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const active =
      view === "MARKET"
        ? aggregatedMarket
        : aggregatedMy.length
          ? aggregatedMy
          : aggregatedMarket;

    if (!active.length) {
      setVisibleStats(null);
      onVisibleStatsChange?.(null);
      return;
    }

    requestAnimationFrame(() => {
      const timeScale = chart.timeScale();
      const bars = visibleBarsForRange(range);

      if (bars == null || active.length <= bars) {
        timeScale.fitContent();
      } else {
        timeScale.setVisibleLogicalRange({
          from: Math.max(0, active.length - bars - 0.5),
          to: active.length - 0.5,
        });
      }

      scheduleVisibleUpdate();
    });
  }, [
    aggregatedMarket,
    aggregatedMy,
    onVisibleStatsChange,
    range,
    scheduleVisibleUpdate,
    view,
  ]);

  const showViewControls = hasMy && hasMarket;
  const periodLabel =
    visibleStats?.from && visibleStats?.to
      ? `${new Date(visibleStats.from).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} – ${new Date(visibleStats.to).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`
      : "Move or zoom the chart to explore history";

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <div className="mb-3 flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="truncate font-black text-[#111713]">
            {title}
          </div>
          <div className="text-sm font-medium text-[#648770]">
            Drag to scroll • Mouse-wheel or pinch to zoom
          </div>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
          {showViewControls ? (
            [
              { key: "MY", label: "MyVeg" },
              { key: "MARKET", label: "Market" },
              { key: "COMPARE", label: "Compare" },
            ].map((button) => (
              <button
                key={button.key}
                type="button"
                onClick={() =>
                  setView(button.key as ViewMode)
                }
                className={[
                  "shrink-0 rounded-full border px-3 py-2 text-sm font-black transition",
                  view === button.key
                    ? "border-[#111713] bg-[#111713] text-white"
                    : "border-[#e0e8e3] bg-white text-[#111713] hover:bg-[#f6f8f7]",
                ].join(" ")}
              >
                {button.label}
              </button>
            ))
          ) : (
            <span className="shrink-0 rounded-full border border-[#e0e8e3] bg-white px-3 py-2 text-sm font-black text-[#111713]">
              {hasMarket ? "Market" : "MyVeg"}
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              setMode((current) =>
                current === "ABS" ? "PCT" : "ABS",
              )
            }
            className="shrink-0 rounded-full border border-[#e0e8e3] bg-white px-3 py-2 text-sm font-black text-[#111713] hover:bg-[#f6f8f7]"
          >
            {mode === "ABS" ? "Price (AED)" : "% Change"}
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {[
          ["Visible period", periodLabel],
          ["Current", formatAED(visibleStats?.current ?? null)],
          ["Average", formatAED(visibleStats?.average ?? null)],
          ["High", formatAED(visibleStats?.high ?? null)],
          ["Low", formatAED(visibleStats?.low ?? null)],
          ["Median", formatAED(visibleStats?.median ?? null)],
          ["Updates", String(visibleStats?.updateCount ?? 0)],
          [
            "Change",
            visibleStats?.changePercent == null
              ? "-"
              : formatPercent(visibleStats.changePercent),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-[#e0e8e3] bg-white px-3 py-2"
          >
            <div className="truncate text-xs font-bold uppercase tracking-wide text-[#648770]">
              {label}
            </div>
            <div
              className="mt-1 truncate text-sm font-black text-[#111713]"
              title={value}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        ref={wrapperRef}
        className="relative w-full select-none overflow-hidden rounded-2xl"
      >
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-24px)] whitespace-pre-line rounded-lg border border-black/10 bg-white/95 px-3 py-2 text-sm font-black text-[#111713] opacity-0 shadow-md transition-opacity"
        />

        <div
          ref={timeTooltipRef}
          className="pointer-events-none absolute bottom-2 z-10 w-[190px] rounded-md bg-[#111713] px-3 py-1 text-center text-xs font-black text-white opacity-0 shadow-md transition-opacity"
        />

        <div
          ref={containerRef}
          className="w-full touch-pan-y"
          style={{ height }}
        />
      </div>
    </div>
  );
}