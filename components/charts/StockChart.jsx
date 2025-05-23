import { useEffect, useRef, useState } from "react";
// Import Highcharts properly
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { ipoBlackLogo } from "../../constants/images";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  stockOverView,
  stockQuote,
  stockTimeSeries,
} from "../../store/stockSlice";
import moment from "moment-timezone";
const API_BASE_URI = process.env.NEXT_PUBLIC_API_BASE_URI;

const formatSmartDecimal = (num) => {
  if (typeof num !== "number" || isNaN(num)) return "N/A";

  // Convert to a fixed precision string to handle float issues
  const fixedStr = num.toFixed(10); // Gives something like '0.0012000000'
  const [intPart, decPart] = fixedStr.split(".");

  // Count leading zeros in the decimal part
  const leadingZerosMatch = decPart.match(/^0+/);
  const leadingZerosCount = leadingZerosMatch ? leadingZerosMatch[0].length : 0;

  let result;

  if (leadingZerosCount >= 2) {
    // Keep more decimal places if many leading zeros
    result = parseFloat(num.toFixed(8)); // Convert back to remove trailing zeroes
  } else {
    result = parseFloat(num.toFixed(2)); // Round to 2 decimals and strip trailing zeros
  }

  return result.toString();
};

const StockChart = ({ tickerSymbol, brandingResult }) => {
  const [selectedRange, setSelectedRange] = useState("1D");
  const [filteredData, setFilteredData] = useState([]);
  const [isIOS, setIsIOS] = useState(false);
  const chartComponentRef = useRef(null);
  // console.log("ticketSymbol",tickerSymbol)
  console.log("brandingResult",brandingResult);

  const [stockOverview, setStockOverview] = useState({});
  const [quote, setQuote] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  // For filter loading state
  const [isFiltering, setIsFiltering] = useState(false);

  // Add loading flags to track which operations are complete
  const [apiCallComplete, setApiCallComplete] = useState(false);
  const [dataProcessingComplete, setDataProcessingComplete] = useState(false);

  const [stockDetails, setStockDetails] = useState(null)

  // Detect iOS devices on component mount
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  function getYRange(data) {
    if (!data || data.length === 0) {
      return { min: 240, max: 250 };
    }

    const closes = data.map((point) => point[1]);

    const minValue = Math.min(...closes);
    const maxValue = Math.max(...closes);

    // Use consistent padding approach for all timeframes including 1D
    const range = maxValue - minValue;
    const padding = range < 0.01 ? maxValue * 0.02 : range * 0.05;

    return {
      min: minValue - padding,
      max: maxValue + padding,
    };
  }

  const fetch5DDataAndSet1DView = async () => {
    try {
      const res =
        await fetch(`${API_BASE_URI}/stock-data/optimal/${tickerSymbol}?range=5D&t=${new Date().getTime()};}`);
      const result = await res.json();
      const fallbackSeries = result.timeSeries || [];

      console.log("result data:", result);

      if (fallbackSeries.length > 0) {
        const parsed5D = fallbackSeries
          .map((entry) => {
            const dateParts = entry.date.split(" ");
            const dateStr = dateParts[0];
            const timeStr = dateParts[1] || "00:00:00";
            const [year, month, day] = dateStr.split("-").map(Number);
            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            const timestamp = new Date(
              year,
              month - 1,
              day,
              hours,
              minutes,
              seconds
            ).getTime();
            const close = parseFloat(entry.close || 0);
            const open = parseFloat(entry.open || close);
            const high = parseFloat(entry.high || Math.max(open, close));
            const low = parseFloat(entry.low || Math.min(open, close));
            const volume = parseFloat(entry.volume || 0);
            return [timestamp, close, open, high, low, volume, entry.date];
          })
          .filter(Boolean);

        // Now do the same 1D filtering using latest date from 5D
        const dateMap = {};
        parsed5D.forEach((point) => {
          const date = new Date(point[0]);
          const key = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
          if (!dateMap[key]) dateMap[key] = [];
          dateMap[key].push(point);
        });

        const availableDates = Object.keys(dateMap).sort((a, b) =>
          b.localeCompare(a)
        );
        const mostRecent = availableDates[0];
        const fallback1D =
          dateMap[mostRecent]?.sort((a, b) => a[0] - b[0]) || [];

        setFilteredData(fallback1D);
      } else {
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching 5D fallback:", error);
      setFilteredData([]);
    } finally {
      setDataProcessingComplete(true);
    }
  };

  useEffect(() => {
    if (timeSeries?.length > 0) {
      // Set loading flag
      setDataProcessingComplete(false);

      // Look for unique dates in the data
      const uniqueDates = new Set();
      timeSeries.forEach((entry) => {
        if (entry.date) {
          const datePart = entry.date.split(" ")[0]; // Extract date without time
          uniqueDates.add(datePart);
        }
      });

      // Sort the time series data by date string
      const sortedSeries = [...timeSeries].sort((a, b) =>
        (a.date || "").localeCompare(b.date || "")
      );

      // Format data for chart rendering
      const formattedData = sortedSeries
        .map((entry) => {
          try {
            if (!entry.date) {
              return null;
            }

            // Convert the date string to a timestamp for proper chart rendering
            // Format: "2025-04-16 08:00:00 EDT"
            const dateParts = entry.date.split(" ");
            const dateStr = dateParts[0]; // "2025-04-16"
            const timeStr = dateParts[1] || "00:00:00"; // "08:00:00"

            // Parse date and time parts
            const [year, month, day] = dateStr.split("-").map(Number);
            const [hours, minutes, seconds] = timeStr.split(":").map(Number);

            // Create timestamp (month is 0-indexed in JS Date)
            const timestamp = new Date(
              year,
              month - 1,
              day,
              hours,
              minutes,
              seconds
            ).getTime();

            // For 1D view specifically, verify we have valid timestamps
            if (selectedRange === "1D" && isNaN(timestamp)) {
              return null;
            }

            // Parse and validate data points
            const closePrice = parseFloat(entry.close || 0);
            const openPrice = parseFloat(entry.open || 0);
            const highPrice = parseFloat(entry.high || 0);
            const lowPrice = parseFloat(entry.low || 0);
            const volumeValue = parseFloat(entry.volume || 0);

            // Data validation
            const validClose =
              !isNaN(closePrice) && closePrice !== 0 ? closePrice : null;
            const validOpen =
              !isNaN(openPrice) && openPrice !== 0 ? openPrice : validClose;
            const validHigh =
              !isNaN(highPrice) && highPrice !== 0
                ? highPrice
                : Math.max(validOpen || 0, validClose || 0) || null;
            const validLow =
              !isNaN(lowPrice) && lowPrice !== 0
                ? lowPrice
                : Math.min(validOpen || Infinity, validClose || Infinity) !==
                  Infinity
                ? Math.min(validOpen || Infinity, validClose || Infinity)
                : null;
            const validVolume =
              !isNaN(volumeValue) && volumeValue !== 0 ? volumeValue : null;

            // Only include points that have at least a valid close price
            // if (validClose === null) {
            //   return null;
            // }

            return [
              timestamp, // Use timestamp for proper chart rendering
              validClose,
              validOpen,
              validHigh,
              validLow,
              validVolume,
              entry.date, // Keep original date string
            ];
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean); // Remove any null entries from failed parsing

      // Set the chart data
      setChartData(formattedData);

      // For 1D view, immediately filter the data
      if (selectedRange === "1D" && formattedData.length > 0) {
        // Find all available dates, sorted from newest to oldest
        const dateMap = {};
        formattedData.forEach((point) => {
          const date = new Date(point[0]);
          const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
          if (!dateMap[dateKey]) {
            dateMap[dateKey] = [];
          }
          dateMap[dateKey].push(point);
        });

        // Get dates sorted newest first
        const availableDates = Object.keys(dateMap).sort((a, b) =>
          b.localeCompare(a)
        );

        if (availableDates.length > 0) {
          // Use most recent date
          const mostRecentDate = availableDates[0];
          const dayData = dateMap[mostRecentDate];

          if (dayData && dayData.length > 0) {
            // Sort by timestamp
            dayData.sort((a, b) => a[0] - b[0]);

            // Set as filtered data
            setFilteredData(dayData);
          } else {
            setFilteredData(formattedData);
          }
        } else {
          setFilteredData(formattedData);
        }
      }

      // if (selectedRange === "1D" && formattedData.length === 0) {
      //   fetch5DDataAndSet1DView();
      //   return;
      // }

      // Mark data processing as complete
      setDataProcessingComplete(true);
    } else {
      setChartData([]);
      setFilteredData([]);
      // If no data, processing is complete
      setDataProcessingComplete(true);
    }
  }, [timeSeries, selectedRange]);

  useEffect(() => {
    // Only update the loading state after all data is processed
    if (apiCallComplete && dataProcessingComplete && filteredData.length > 0) {
      // Add a small delay for smoother transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [apiCallComplete, dataProcessingComplete, filteredData]);

  const formatDateUs = () => {
    const now = new Date();
    return (
      now.toLocaleString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }) + " EST"
    );
  };

  // Add back the filtering functionality
  useEffect(() => {
    if (chartData.length > 0) {
      // Show filtering loader
      setIsFiltering(true);

      const nowTimestamp = new Date().getTime();
      let startTimestamp;

      switch (selectedRange) {
        case "1D":
          // For 1D view, ensure we get all data for the most recent trading day
          const now = new Date();
          // Get the beginning of current day in user's timezone
          const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0
          ).getTime();
          // Use yesterday if it's early morning and we might not have today's data yet
          const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

          // Start with more data to ensure we get the full trading day
          startTimestamp = startOfYesterday;
          break;
        case "5D":
          // Get data from the last 7 days to ensure we get 5 trading days
          startTimestamp = nowTimestamp - 10 * 24 * 60 * 60 * 1000; // Looking back 10 days to be safe
          break;
        case "6M":
          // Get data from the last 6 months - precise calculation
          const sixMonthsAgo = moment().subtract(180, "days"); // Use 180 days instead of 6 months for better precision
          startTimestamp = sixMonthsAgo.valueOf();
          break;
        case "YTD":
          // Get data from the start of the year
          const startOfYear = new Date();
          startOfYear.setMonth(0, 1);
          startOfYear.setHours(0, 0, 0, 0);
          startTimestamp = startOfYear.getTime();
          break;
        case "1Y":
          // Get data from the last year
          startTimestamp = nowTimestamp - 365 * 24 * 60 * 60 * 1000;
          break;
        case "5Y":
          // Get data from the last 5 years
          startTimestamp = nowTimestamp - 5 * 365 * 24 * 60 * 60 * 1000;
          break;
        case "Max":
        default:
          // Use all data
          startTimestamp = 0;
      }

      // Always include at least some data points
      let filteredResult = chartData;

      // Try filtering if there's enough data
      if (chartData.length > 5) {
        // For time ranges other than Max, filter by timestamp if possible
        if (selectedRange !== "Max") {
          const filtered = chartData.filter(
            (point) => point[0] >= startTimestamp
          );
          // Only use filtered result if it actually has data
          if (filtered.length > 0) {
            filteredResult = filtered;
          }
        }

        // For 1D view, we need special handling - ensure we're showing the latest trading day's data
        if (selectedRange === "1D") {
          // Find all available trading days in the data
          const tradingDays = {};
          filteredResult.forEach((point) => {
            const date = new Date(point[0]);
            const dayKey = `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

            if (!tradingDays[dayKey]) {
              tradingDays[dayKey] = [];
            }
            tradingDays[dayKey].push(point);
          });

          // Get all available dates sorted newest to oldest
          const availableDates = Object.keys(tradingDays).sort((a, b) =>
            b.localeCompare(a)
          );

          if (availableDates.length > 0) {
            // Use the most recent day that has data
            const mostRecentDay = availableDates[0];

            // Get the data for this day
            const dayData = tradingDays[mostRecentDay];

            // Ensure it's sorted chronologically
            dayData.sort((a, b) => a[0] - b[0]);

            // Only use this if we have at least some data points
            if (dayData.length > 0) {
              filteredResult = dayData;
            }
          }
        }
      }

      setFilteredData(filteredResult);

      // Hide filtering loader after a short delay for smoother transition
      setTimeout(() => {
        setIsFiltering(false);
      }, 300);
    } else {
      setFilteredData([]);
      setIsFiltering(false);
    }
  }, [selectedRange, chartData]);

  // Set the chart zones for all timeframes
  const getConsistentZones = () => {
    // For 5D style, we don't use colored zones for any timeframe
    return [];
  };

  // For a 1D chart, remove market zones to match 5D style
  function getMarketZonesFor1D(data) {
    // Return empty array for consistent styling with 5D
    return [];
  }

  const chartZones = getConsistentZones();
  const { max, min } = getYRange(filteredData);

  // Helper function to check if current range is a longer timeframe (6M, YTD, 1Y, 5Y, Max)
  const isLongerTimeframe = () => {
    return ["6M", "YTD", "1Y", "5Y", "Max"].includes(selectedRange);
  };

  const options = {
    chart: {
      type: "area",
      backgroundColor: "#fff",
      spacing: [20, 20, 20, 20],
      zoomType: null,
      panning: false,
      panKey: null,
      resetZoomButton: {
        enabled: false,
      },
      zooming: {
        mouseWheel: {
          enabled: false,
        },
      },
      pinchType: null,
      ignoreHiddenSeries: false,
      marginTop: 20,
      marginBottom: 30,
      events: {
        load: function () {},
        selection: function () {
          return false;
        },
        mouseWheel: function () {
          return false;
        },
      },
      // Add responsive rules for better mobile adaptation
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              chart: {
                spacing: [10, 10, 10, 10],
                marginBottom: 20,
              },
              legend: {
                enabled: false,
              },
              yAxis: {
                labels: {
                  style: {
                    fontSize: "10px",
                  },
                },
              },
              xAxis: {
                labels: {
                  style: {
                    fontSize: "10px",
                  },
                  y: 15,
                },
              },
            },
          },
        ],
      },
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    rangeSelector: {
      enabled: false,
      inputEnabled: false,
    },
    title: {
      text: "", // No title for consistent styling
    },
    accessibility: { enabled: false },
    yAxis: {
      title: { text: "" },
      max: max,
      min: min,
      gridLineDashStyle: "ShortDot",
      labels: {
        align: "left",
        x: 0,
        style: { fontSize: "12px", fontWeight: "normal" },
        formatter: function () {
          return formatSmartDecimal(this.value);
        },
      },
      lineWidth: 0,
      tickWidth: 0,
    },
    xAxis: {
      type: "datetime",
      // Apply consistent padding
      min: undefined,
      max: undefined,
      showFirstLabel: true,
      showLastLabel: true,
      tickPixelInterval: null,
      tickmarkPlacement: "on",
      dateTimeLabelFormats: {
        millisecond: "%H:%M",
        second: "%H:%M",
        minute: "%H:%M",
        hour: "%H:%M",
        day: "%e %b",
        week: "%e %b",
        month: "%b '%y",
        year: "%Y",
      },
      gridLineWidth: 0,
      gridLineDashStyle: "ShortDot",
      tickPositioner: function () {
        if (filteredData && filteredData.length > 0) {
          const points = filteredData.map((point) => point[0]);
          const minTime = Math.min(...points);
          const maxTime = Math.max(...points);

          // Get chart width for responsive formatting
          let chartWidth = 800; // Default width
          if (this.chart && this.chart.chartWidth) {
            chartWidth = this.chart.chartWidth;
          } else if (
            chartComponentRef &&
            chartComponentRef.current &&
            chartComponentRef.current.chart &&
            chartComponentRef.current.chart.chartWidth
          ) {
            chartWidth = chartComponentRef.current.chart.chartWidth;
          }

          if (selectedRange === "Max") {
              const ticks = [];
              const startYear = new Date(minTime).getFullYear();
              const endYear = new Date(maxTime).getFullYear();

              if (startYear === endYear) {
              ticks.push(new Date(startYear, 0, 1).getTime());
              ticks.push(new Date(startYear, 3, 1).getTime());
              ticks.push(new Date(startYear, 6, 1).getTime());
              ticks.push(new Date(startYear, 9, 1).getTime());
              if (maxTime > new Date(startYear, 9, 1).getTime()) {
                ticks.push(maxTime);
              }
            } else {
             
                for (let year = startYear; year <= endYear; year++) {
                  const tickTime = new Date(year, 0, 1).getTime();
                  ticks.push(tickTime);
                }
                // const lastTick = ticks[ticks.length - 1];
                // if (maxTime - lastTick > 3 * 30 * 24 * 60 * 60 * 1000) { // ~3 months
                //   ticks.push(maxTime);
                // }
            }

              return [...new Set(ticks)].sort((a, b) => a - b);
            }

         if (selectedRange === "5Y") {
            const ticks = [];
            const startYear = new Date(minTime).getFullYear();
            const endYear = new Date(maxTime).getFullYear();
            if (startYear === endYear) {
              
              ticks.push(new Date(startYear, 0, 1).getTime()); 
              ticks.push(new Date(startYear, 3, 1).getTime()); 
              ticks.push(new Date(startYear, 6, 1).getTime());
              ticks.push(new Date(startYear, 9, 1).getTime());
            
              if (maxTime > new Date(startYear, 9, 1).getTime()) {
                ticks.push(maxTime);
              }
            } else {
              
              for (let year = startYear; year <= endYear; year++) {
                const tickTime = new Date(year, 0, 1).getTime(); 
                ticks.push(tickTime);
              }
        }

      
        return [...new Set(ticks)].sort((a, b) => a - b);
          }

          // Ensure minimum 5 ticks regardless of chart width
          const pixelsPerLabel = chartWidth < 768 ? 100 : 80;
          const maxLabels = Math.max(
            5,
            Math.floor(chartWidth / pixelsPerLabel)
          );

          // Create evenly spaced ticks
          const ticks = [];
          const step = Math.ceil(filteredData.length / maxLabels);

          // Always include first point
          ticks.push(minTime);

          // Add evenly spaced points in between, ensuring we have at least 5 ticks total
          if (filteredData.length > 5) {
            for (let i = step; i < filteredData.length - step; i += step) {
              if (filteredData[i]) {
                ticks.push(filteredData[i][0]);
              }
            }
          } else {
            // For sparse data, ensure we at least have 3 points between start and end
            const timeRange = maxTime - minTime;
            for (let i = 1; i <= 3; i++) {
              ticks.push(minTime + (timeRange * i) / 4);
            }
          }

          // Add last point if not already included
          if (ticks[ticks.length - 1] !== maxTime) {
            ticks.push(maxTime);
          }

          // Ensure we have evenly distributed ticks for all timeframes
          ticks.sort((a, b) => a - b);
          if (ticks.length < 5) {
            const timeRange = maxTime - minTime;
            const newTicks = [];
            for (let i = 0; i <= 4; i++) {
              newTicks.push(minTime + (timeRange * i) / 4);
            }
            return newTicks;
          }

          // For non-1D views, remove duplicate dates to prevent repetition
          if (selectedRange !== "1D") {
            const uniqueTicksByDate = {};
            const finalTicks = [];

            ticks.forEach((timestamp) => {
              const date = new Date(timestamp);
              const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

              // Only keep one timestamp per day
              if (!uniqueTicksByDate[dateKey]) {
                uniqueTicksByDate[dateKey] = timestamp;
                finalTicks.push(timestamp);
              }
            });

            // Ensure we have at least 5 labels
            if (finalTicks.length < 5 && points.length >= 5) {
              return [
                points[0],
                points[Math.floor(points.length * 0.25)],
                points[Math.floor(points.length * 0.5)],
                points[Math.floor(points.length * 0.75)],
                points[points.length - 1],
              ];
            }

            // Sort the final ticks
            finalTicks.sort((a, b) => a - b);
            return finalTicks;
          }

          return ticks;
        }
        return undefined;
      },
      labels: {
        staggerLines: 1,
        step: null,
        overflow: "justify",
        // Auto rotation to prevent overlapping
        autoRotation: [-45],
        autoRotationLimit: 45,
        distance: 0,
        formatter: function () {
          const date = new Date(this.value);
          if (selectedRange === "5Y") {
            return date.getFullYear().toString();
          }else if (selectedRange === "Max"){
            return new Date(date).toLocaleDateString("en-US", {
              // month: "short",
              year: "numeric",
            });
          }
          else if (selectedRange === "1D") {
            // Simplified format for 1D similar to 5D style
            const isPM = date.getHours() >= 12;
            const hour12 = date.getHours() % 12 || 12;
            const minutes = date.getMinutes();

            // For exact hour marks, just show the hour with am/pm
            if (minutes === 0) {
              return `${hour12}${isPM ? "pm" : "am"}`;
            }

            // For 15, 30, 45 min marks, show hour:minute
            return `${hour12}:${minutes.toString().padStart(2, "0")}${
              isPM ? "pm" : "am"
            }`;
          } else {
            // For all other views (5D and longer timeframes)
            // Get month and date in a consistent format without repetition
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }
        },
        style: {
          fontSize: "11px",
          fontWeight: "normal",
          color: "#333333",
        },
        y: 20,
      },
      ordinal: true,
      minPadding: 0.01,
      maxPadding: 0.01,
      breaks: [],
    },
    tooltip: {
      shared: true,
      useHTML: true,
      followTouchMove: false,
      formatter: function () {
        if (!this.points) return "";
        const point = this.points[0].point;

        const originalDate =
          point.originalDate ||
          (point.series.data && point.series.data[point.index]
            ? point.series.data[point.index][6]
            : new Date(point.x).toLocaleString("en-US"));

        // Check screen width to adjust tooltip content for mobile
        const isSmallScreen = window.innerWidth < 576;
        const formattedDate = isSmallScreen
          ? originalDate.split(" ")[0] // Just the date part for small screens
          : originalDate;

        // Create consistent tooltip style for all timeframes
        return `
          <div style="font-size: ${
            isSmallScreen ? "12px" : "14px"
          }; padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 3px;">
              ${formattedDate}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color:#A855F7; font-size: 12px;">●</span> <b>Price:</b> $${formatSmartDecimal(
                point.y
              )}
            </div>
            ${
              point.open
                ? `<div style="margin-bottom: 4px;"><b>Open:</b> $${formatSmartDecimal(
                    point.open
                  )}</div>`
                : ""
            }
            ${
              point.high
                ? `<div style="margin-bottom: 4px;"><b>High:</b> $${formatSmartDecimal(
                    point.high
                  )}</div>`
                : ""
            }
            ${
              point.low
                ? `<div style="margin-bottom: 4px;"><b>Low:</b> $${formatSmartDecimal(
                    point.low
                  )}</div>`
                : ""
            }
            ${
              point.volume
                ? `<div><b>Volume:</b> ${point.volume.toLocaleString()}</div>`
                : ""
            }
          </div>
        `;
      },
      valueDecimals: 2,
      valuePrefix: "$",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderWidth: 1,
      borderRadius: 8,
      borderColor: "#A855F7",
      style: {
        fontSize: "12px",
        padding: "10px",
      },
    },
    series: [
      {
        name: "Stock Price",
        connectNulls: true,
        data: filteredData.map((point) => ({
          x: point[0],
          y: point[1],
          open: point[2] || null,
          high: point[3] || null,
          low: point[4] || null,
          volume: point[5] || null,
          originalDate: point[6],
        })),
        lineWidth: 2,
        color: "#A855F7",
        fillColor: {
          linearGradient: [0, 0, 0, 200],
          stops: [
            [0, "rgba(168, 85, 247, 0.2)"],
            [1, "rgba(168, 85, 247, 0)"],
          ],
        },
        marker: {
          enabled: false,
          radius: 3,
          symbol: "circle",
          fillColor: "#A855F7",
          lineWidth: 1,
          lineColor: "#FFFFFF",
          states: {
            hover: {
              enabled: true,
              radiusPlus: 2,
            },
          },
        },
        zoneAxis: "x",
        zones: chartZones,
        turboThreshold: 0,
        shadow: false,
        states: {
          hover: {
            lineWidth: 3,
            halo: {
              size: 5,
              opacity: 0.2,
            },
          },
        },
        gapSize: 0,
        gapUnit: "relative",
        boostThreshold: 1,
      },
    ],
    credits: { enabled: false },
    plotOptions: {
      series: {
        connectNulls: true,
        gapSize: 0,
        gapUnit: "relative",
        dataGrouping: {
          enabled: false,
        },
        threshold: null,
        pointPlacement: "on",
        states: {
          inactive: {
            opacity: 1,
          },
          hover: {
            enabled: true,
          },
        },
        step: false,
        lineWidth: 2, // 5D lineWidth
        animation: {
          duration: 500,
        },
        allowPointSelect: false,
        stickyTracking: true,
        enableMouseTracking: true,
        point: {
          events: {
            click: null,
            mouseWheel: null,
          },
        },
        events: {
          mouseWheel: null,
        },
      },
    },
    time: {
      useUTC: false,
    },
  };

  // For debugging - log filtered data length
  useEffect(() => {
    // Removed console.log
  }, [filteredData]);

  // For API call
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // Set loading state to true at the start of the API call
        setIsLoading(true);
        setApiCallComplete(false);
        setDataProcessingComplete(false);

        // For debugging purposes, add timestamp to prevent caching
        const timestamp = new Date().getTime();

        // For 1D view, always use 1D range directly from the API
        const rangeParam = selectedRange;

        // Use direct API call with specified range
        const response = await axios.get(
          `${API_BASE_URI}/yahoo-finance/${tickerSymbol}?range=${rangeParam}&t=${timestamp}`
        );

        console.log(response, "response");

        // Process quote data
        let quoteData = response.data?.quote;

        // Convert any change percent values with % symbols to numerical values
        // if (quoteData && quoteData.regularMarketChangePercent) {
        //   quoteData = {
        //     ...quoteData,
        //     // Store numerical version to ensure consistency
        //     regularMarketChangePercent: parseFloat(
        //       typeof quoteData.regularMarketChangePercent === "string"
        //         ? quoteData.regularMarketChangePercent.replace("%", "")
        //         : quoteData.regularMarketChangePercent
        //     ),
        //   };
        // }

        // Store the data from API response
        setStockOverview(response.data?.overview || {});
        setQuote(quoteData || null);

        // Log the time series data for debugging
        const timeSeriesData = response.data?.timeSeries || [];
        const timeSeriesCount = timeSeriesData.length || 0;

        if (timeSeriesCount > 0) {
          // Use the data directly
          setTimeSeries(timeSeriesData);
          dispatch(stockTimeSeries(timeSeriesData));
        } else {
          // Try 5D as fallback for 1D
          if (selectedRange === "1D") {
            try {
              const fallbackResponse = await axios.get(
                `${API_BASE_URI}/yahoo-finance/${tickerSymbol}?range=5D&t=${timestamp}`
              );

              if (fallbackResponse.data?.timeSeries?.length > 0) {
                setTimeSeries(fallbackResponse.data.timeSeries);
                dispatch(stockTimeSeries(fallbackResponse.data.timeSeries));
              } else {
                setTimeSeries([]);
                dispatch(stockTimeSeries([]));
              }
            } catch (fallbackErr) {
              setTimeSeries([]);
              dispatch(stockTimeSeries([]));
            }
          } else {
            setTimeSeries([]);
            dispatch(stockTimeSeries([]));
          }
        }

        // Dispatch overview and quote data
        dispatch(stockOverView(response.data?.overview || {}));
        dispatch(stockQuote(quoteData || null));

        // Mark API call as complete
        setApiCallComplete(true);
      } catch (err) {
        // Set loading state to false in case of error
        setIsLoading(false);
        setApiCallComplete(true);
        setDataProcessingComplete(true);

        // Clear state in case of error
        setTimeSeries([]);
        dispatch(stockTimeSeries([]));
      }
    };

    // const fetchStockDetails = async () => {
    //   const formData = new URLSearchParams();
    //   formData.append("ticker", tickerSymbol);
    //   try {
    //     const stockDetailsResponse = await axios.post(
    //       "https://api.getirnow.com/api/getirnow/stock-details",
    //       formData,
    //       {
    //         headers: {
    //           "Content-Type": "application/x-www-form-urlencoded",
    //         },
    //       }
    //     );

    //     console.log("stockDetailsResponse", stockDetailsResponse);
        
    //     // setStockDetails(stockDetailsResponse)
    //   } catch (error) {
    //     console.error("fetchStockDetails", error)
    //   }
    // };

    if (tickerSymbol) {
      fetchStocks();
      // fetchStockDetails();
    } else {
      setIsLoading(false);
      setApiCallComplete(true);
      setDataProcessingComplete(true);
    }
  }, [tickerSymbol, selectedRange, dispatch]);

  // Add a safety timeout to ensure loading state doesn't get stuck
  useEffect(() => {
    if (isLoading) {
      // Safety timeout - don't let loading state persist for more than 15 seconds
      const safetyTimer = setTimeout(() => {
        setIsLoading(false);
      }, 15000); // Increased to 15 seconds to allow more time for slow responses

      return () => clearTimeout(safetyTimer);
    }
  }, [isLoading]);

  // Make loading state dependent on the selectedRange
  // but with a max timeout to prevent it from getting stuck
  useEffect(() => {
    // Reset loading state when range changes
    setIsLoading(true);
    setApiCallComplete(false);
    setDataProcessingComplete(false);

    // Safety timer to ensure loading state doesn't stay forever
    const rangeChangeTimer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 10000); // Increased to 10 seconds to allow more time after range change

    return () => clearTimeout(rangeChangeTimer);
  }, [selectedRange]);

  const formatMarketCap = (value) => {
    if (!value) return "0"; // Handle missing values
    const num = parseFloat(value);

    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"; // Trillion
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"; // Billion
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"; // Million
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"; // Thousand

    return num.toString(); // Return as-is if less than 1000
  };

  const formatDate = () => {
    // Use the timezone from backend data
    if (timeSeries && timeSeries.length > 0 && timeSeries[0].date) {
      // Extract timezone from a sample date string (e.g., "2025-04-22 08:00:00 EDT")
      const sampleDate = timeSeries[0].date;
      const timezonePart = sampleDate.split(" ")[2] || "EDT"; // Default to EDT if not found

      // Get current date in local format
      const now = new Date();
      const time =
        now.toLocaleString("en-US", {
          timeZone: "America/New_York",
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " EST";

      console.log(timezonePart, time);

      // For 1D view, add information about which trading day is shown
      if (selectedRange === "1D" && filteredData.length > 0) {
        const dataDate = new Date(filteredData[0][0]);
        const today = new Date();
        const isWeekend = today.getDay() === 0 || today.getDay() === 6;

        // If viewing on a weekend or data is not from today, add clarification
        if (isWeekend || dataDate.toDateString() !== today.toDateString()) {
          const dataOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          };

          return `${time} | Showing data from: ${dataDate.toLocaleDateString(
            "en-US",
            dataOptions
          )}`;
        }
      }

      return time;
    }

    const now = new Date();
    const time =
      now.toLocaleString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }) + " EST";
    // Fallback if no timezone found
    return time;
  };

  const formatUSVolume = (value) => {
    if (!value) return "0";
    return Number(value).toLocaleString("en-US");
  };

  // Helper function to determine tickPixelInterval based on selected range
  function getTickPixelInterval() {
    // Responsive tick interval based on screen size
    // Check if we're in a component with refs
    let screenWidth = typeof window !== "undefined" ? window.innerWidth : 1024;

    // If we have access to the chart, use its width instead
    if (
      chartComponentRef &&
      chartComponentRef.current &&
      chartComponentRef.current.chart &&
      chartComponentRef.current.chart.chartWidth
    ) {
      screenWidth = chartComponentRef.current.chart.chartWidth;
    }

    // For small mobile screens
    if (screenWidth < 576) {
      return selectedRange === "1D" ? 80 : 60;
    }
    // For medium screens (tablets)
    else if (screenWidth < 768) {
      return selectedRange === "1D" ? 100 : 80;
    }
    // For laptops
    else if (screenWidth < 992) {
      return selectedRange === "1D" ? 120 : 100;
    }
    // For larger screens
    else {
      switch (selectedRange) {
        case "1D":
          return 150; // More space on larger screens
        case "5D":
        case "6M":
          return 250;
        case "YTD":
          return 100;
        case "1Y":
        case "5Y":
        case "Max":
          return 120;
        default:
          return 100;
      }
    }
  }

  // Add useEffect to handle mouse wheel events
  useEffect(() => {
    if (chartComponentRef.current) {
      const chart = chartComponentRef.current.chart;
      if (chart && chart.container) {
        // Add event listener to prevent mouse wheel scrolling on the chart
        const preventScroll = (e) => {
          if (e.target.closest(".highcharts-container")) {
            e.preventDefault();
            e.stopPropagation();
          }
        };

        // Add the event listener to the chart container
        chart.container.addEventListener("wheel", preventScroll, {
          passive: false,
        });

        // Return cleanup function
        return () => {
          if (chart && chart.container) {
            chart.container.removeEventListener("wheel", preventScroll);
          }
        };
      }
    }
  }, [chartComponentRef.current, filteredData]);

  // console.log("stockOverview",stockOverview);
  return (
    <div className="bg-white p-md-5 p-3 rounded-5 w-100">
      <div className="d-flex align-items-center mb-3">
        <div className="fw-bold d-flex align-items-center mb-3">
          {brandingResult?.branding_second_logo ? (
            <img
              src={brandingResult?.branding_second_logo}
              style={{
                width: "auto",
                height: "42px",
              }}
              alt=""
              className="me-3 overview_logo"
            />
          ) : (
            ""
          )}

          <span className="text-black display-5 fw-bold">
            ({tickerSymbol})
          </span>
        </div>
      </div>

      <div className="row align-items-center mb-3">
        <div className="col-lg-6 col-sm-4 col-12">
          {/* <h2 className="fw-bold">
            $
            {quote?.regularMarketPrice
              ? parseFloat(formatSmartDecimal(quote.regularMarketPrice))
              : quote?.["05. price"]
              ? parseFloat(formatSmartDecimal(quote["05. price"]))
              : "0"}{" "}
          </h2> */}
          <h2 className="fw-bold">
            $
            {quote
              ? parseFloat(formatSmartDecimal(parseFloat(quote?.["05. price"])))
              : "0"}{" "}
          </h2>
        </div>

        {/* Range Buttons */}
        <div className="d-flex mt-3 col-lg-6 col-sm-8 col-12 btns-main justify-content-md-end justify-content-center">
          <div
            className="btn-group fs-4"
            role="group"
            aria-label="Chart timeframe selector"
          >
            {["1D", "5D", "6M", "YTD", "1Y", "5Y", "Max"].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`btn ${
                  selectedRange === range
                    ? "btn-primary active"
                    : "btn-outline-secondary"
                } px-lg-3 px-md-2 px-2`}
                style={{
                  // fontSize: window.innerWidth < 576 ? "0.75rem" : "inherit",
                  backgroundColor: selectedRange === range ? "#A855F7" : "",
                  borderColor: selectedRange === range ? "#A855F7" : "",
                  minWidth: window.innerWidth < 576 ? "30px" : "40px",
                }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container with consistent height */}
      <div
        className="chart-outer-container"
        style={{ minHeight: "400px", position: "relative" }}
      >
        {isLoading ? (
          <div className="text-center py-5 chart-loader-container">
            <div
              className="spinner-border"
              style={{ color: "#A855F7" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading chart data...</p>
          </div>
        ) : isFiltering ? (
          <div className="chart-loader-container" style={{ opacity: 0.7 }}>
            <div className="position-absolute top-50 start-50 translate-middle text-center">
              <div
                className="spinner-border"
                style={{ color: "#A855F7" }}
                role="status"
              >
                <span className="visually-hidden">Filtering data...</span>
              </div>
              <p className="mt-3 text-muted">
                Applying {selectedRange} filter...
              </p>
            </div>

            {/* Show faded chart in background during filtering */}
            <div style={{ opacity: 0.3 }}>
              <HighchartsReact
                highcharts={Highcharts}
                constructorType={"stockChart"}
                options={options}
                ref={chartComponentRef}
              />
            </div>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="chart-container">
            <HighchartsReact
              highcharts={Highcharts}
              constructorType={"stockChart"}
              options={options}
              ref={chartComponentRef}
            />

            {selectedRange === "1D" && filteredData.length > 0 && (
              <div className="text-center fs-4">
                <small className="text-muted fs-4">
                  Showing data for{" "}
                  {new Date(filteredData[0][0]).toLocaleDateString()}
                </small>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-5">
            <p className="alert alert-warning">
              No data available for {selectedRange} view. Please try another
              time range.
            </p>
          </div>
        )}
      </div>

      {/* Add responsive styling */}
      <style jsx="true">{`
        .chart-outer-container {
          transition: height 0.3s ease;
        }
        .chart-loader-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: rgba(255, 255, 255, 0.8);
          transition: opacity 0.3s ease;
        }
        .chart-container {
          width: 100%;
          height: 100%;
          min-height: 400px;
        }
        @media (max-width: 576px) {
          .chart-outer-container {
            min-height: 300px;
          }
          .btn-group .btn {
            padding: 0.25rem 0.5rem;
          }
        }
      `}</style>

      {/* Stock Quote Section */}
      <div className="mt-4 p-3 rounded stockChart-main">
        <h5 className="fw-bold fs-1 mb-5">Stock Quote</h5>
        <div className="row gx-5 gy-4">
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="p-3 rounded bg-light h-100">
              <ul className="p-0 m-0 list-unstyled">
                <li className="d-flex justify-content-between align-items-center mb-3">
                  <p className="mb-0 text-muted">Previous Close:</p>{" "}
                  {/* <b>
                    $
                    {quote?.regularMarketPreviousClose
                      ? parseFloat(
                          formatSmartDecimal(quote.regularMarketPreviousClose)
                        )
                      : quote?.["08. previous close"]
                      ? parseFloat(
                          formatSmartDecimal(quote["08. previous close"])
                        )
                      : "0"}
                  </b> */}
                  <b className="fs-4">
                    $
                    {quote
                      ? parseFloat(
                          formatSmartDecimal(
                            parseFloat(quote["08. previous close"])
                          )
                        )
                      : "0"}
                  </b>
                </li>
                <li className="d-flex justify-content-between align-items-center mb-3">
                  <p className="mb-0 text-muted">Open:</p>{" "}
                  {/* <b className="text-success">
                    $
                    {quote?.regularMarketOpen
                      ? parseFloat(formatSmartDecimal(quote.regularMarketOpen))
                      : quote?.["02. open"]
                      ? parseFloat(formatSmartDecimal(quote["02. open"]))
                      : "0"}
                  </b> */}
                  <b className="text-success fs-4">
                    $
                    {quote
                      ? parseFloat(
                          formatSmartDecimal(parseFloat(quote["02. open"]))
                        )
                      : "0"}
                  </b>
                </li>
                <li className="d-flex justify-content-between align-items-center mb-3">
                  <p className="mb-0 text-muted">Intraday High:</p>{" "}
                  {/* <b>
                    $
                    {quote?.regularMarketDayHigh
                      ? parseFloat(
                          formatSmartDecimal(quote.regularMarketDayHigh)
                        )
                      : quote?.["03. high"]
                      ? parseFloat(formatSmartDecimal(quote["03. high"]))
                      : "0"}
                  </b> */}
                  <b className="fs-4">
                    $
                    {quote
                      ? parseFloat(
                          formatSmartDecimal(parseFloat(quote["03. high"]))
                        )
                      : "0"}
                  </b>
                </li>
                <li className="d-flex justify-content-between align-items-center">
                  {" "}
                  <p className="mb-0 text-muted">Intraday Low:</p>{" "}
                  {/* <b>
                    $
                    {quote?.regularMarketDayLow
                      ? parseFloat(
                          formatSmartDecimal(quote.regularMarketDayLow)
                        )
                      : quote?.["04. low"]
                      ? parseFloat(formatSmartDecimal(quote["04. low"]))
                      : "0"}
                  </b> */}
                  <b className="fs-4">
                    $
                    {quote
                      ? parseFloat(
                          formatSmartDecimal(parseFloat(quote["04. low"]))
                        )
                      : "0"}
                  </b>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="p-3 rounded bg-light h-100">
              <ul className="p-0 m-0 list-unstyled">
                <li className="d-flex justify-content-between align-items-center mb-3">
                  {" "}
                  <p className="mb-0 text-muted">Volume:</p>{" "}
                  {/* <b>
                    {quote?.regularMarketVolume
                      ? formatUSVolume(
                          formatSmartDecimal(quote.regularMarketVolume)
                        )
                      : quote?.["06. volume"]
                      ? formatUSVolume(formatSmartDecimal(quote["06. volume"]))
                      : "0"}
                  </b> */}
                  <b className="fs-4">
                    {quote
                      ? formatUSVolume(
                          formatSmartDecimal(parseFloat(quote["06. volume"]))
                        )
                      : "0"}
                  </b>
                </li>
                <li className="d-flex justify-content-between align-items-center mb-3">
                  {" "}
                  <p className="mb-0 text-muted">Price:</p>{" "}
                  {/* <b>
                    $
                    {quote?.regularMarketPrice
                      ? parseFloat(formatSmartDecimal(quote.regularMarketPrice))
                      : quote?.["05. price"]
                      ? parseFloat(formatSmartDecimal(quote["05. price"]))
                      : "0"}
                  </b> */}
                  <b className="fs-4">
                    $
                    {quote
                      ? parseFloat(
                          formatSmartDecimal(parseFloat(quote["05. price"]))
                        )
                      : "0"}
                  </b>
                </li>
                <li className="d-flex justify-content-between align-items-center mb-3">
                  <p className="mb-0 text-muted">%Change:</p>{" "}
                  <b
                    className={
                      quote?.regularMarketChangePercent
                        ? parseFloat(
                            formatSmartDecimal(quote.regularMarketChangePercent)
                          ) >= 0
                          ? "text-success fs-4"
                          : "text-danger fs-4"
                        : quote?.["10. change percent"]
                        ? parseFloat(
                            formatSmartDecimal(quote["10. change percent"])
                          ) >= 0
                          ? "text-success fs-4"
                          : "text-danger fs-4"
                        : ""
                    }
                  >
                    {(() => {
                      if (quote?.regularMarketChangePercent !== undefined) {
                        return (
                          parseFloat(quote.regularMarketChangePercent).toFixed(
                            2
                          ) + "%"
                        );
                      } else if (quote?.["10. change percent"]) {
                        // Original format handler
                        let changeValue = quote["10. change percent"];
                        // Handle string values with % already included
                        if (typeof changeValue === "string") {
                          if (changeValue.includes("%")) {
                            // Return as is if already formatted
                            return changeValue;
                          }
                          // Otherwise parse and format
                          changeValue = parseFloat(changeValue);
                        }
                        // Format as 2 decimal places with % sign
                        return changeValue.toFixed(2) + "%";
                      }
                      return "0%";
                    })()}
                  </b>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="p-3 rounded bg-light h-100">
              <ul className="p-0 m-0 list-unstyled">
                <li className="d-flex justify-content-between align-items-center mb-3">
                  <p className="mb-0 text-muted">52 Week High:</p>{" "}
                  {/* <b>
                    $
                    {quote?.fiftyTwoWeekHigh
                      ? parseFloat(formatSmartDecimal(quote.fiftyTwoWeekHigh))
                      : quote?.["13. 52-week high"]
                      ? parseFloat(
                          formatSmartDecimal(quote["13. 52-week high"])
                        )
                      : "0"}
                  </b> */}
                  <b className="fs-4">
                    $
                    {quote?.["13. 52-week high"] &&
                    quote["13. 52-week high"] !== "N/A"
                      ? parseFloat(
                          formatSmartDecimal(
                            parseFloat(quote["13. 52-week high"])
                          )
                        )
                      : "0"}
                  </b>
                </li>
                <li className="d-flex justify-content-between align-items-center mb-3">
                  <p className="mb-0 text-muted">52 Week Low: </p>
                  {/* <b>
                    $
                    {quote?.fiftyTwoWeekLow
                      ? parseFloat(formatSmartDecimal(quote.fiftyTwoWeekLow))
                      : quote?.["14. 52-week low"]
                      ? parseFloat(formatSmartDecimal(quote["14. 52-week low"]))
                      : "0"}
                  </b> */}
                  <b className="fs-4">
                    $
                    {quote?.["14. 52-week low"] &&
                    quote["14. 52-week low"] !== "N/A"
                      ? parseFloat(
                          formatSmartDecimal(
                            parseFloat(quote["14. 52-week low"])
                          )
                        )
                      : "0"}
                  </b>
                </li>
                <li className="d-flex justify-content-between align-items-center">
                  {" "}
                  <p className="mb-0 text-muted">Market Cap:</p>{" "}
                  {/* <b>
                    $
                    {quote?.MarketCapitalization
                      ? formatMarketCap(
                          formatSmartDecimal(quote.MarketCapitalization)
                        )
                      : quote?.marketCap
                      ? formatMarketCap(formatSmartDecimal(quote.marketCap))
                      : "0"}
                  </b> */}
                  <b className="fs-4">
                    $
                    {quote?.["11. market cap (intraday)"] !== "N/A"
                      ? quote?.["11. market cap (intraday)"] ?? "0"
                      : "0"}
                  </b>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 small text-center text-muted fs-4">
        {isLoading ? "Loading data..." : `Date and time: ${formatDate()}`}
      </p>

      {/* Add responsive styling via CSS */}
      <style jsx>{`
        @media (max-width: 576px) {
          .stockChart-main h5 {
            font-size: 1.5rem !important;
            margin-bottom: 1rem !important;
          }

          .stockChart-main ul li p,
          .stockChart-main ul li b {
            font-size: 0.8rem;
          }

          .btns-main {
            flex-wrap: wrap;
            justify-content: center;
          }

          .btns-main button {
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StockChart;
