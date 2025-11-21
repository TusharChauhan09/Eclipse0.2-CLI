"use client";

import React from "react";

import GitHubCalendar from "react-github-calendar";

import { useIsMobile } from "@/hooks/use-mobile";
import { useThemeMode } from "@/hooks/useThemeMode";

import type { ReactElement, CSSProperties, RefObject } from "react";
import { Tooltip } from "react-tooltip";

// ... rest of your types and code remains the same
type Activity = any;
type BlockElement = any;
type DayName = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type Labels = Record<string, string>;

export type ColorScale = string[];
export type ThemeInput = {
  dark: ColorScale;
  light?: ColorScale;
};

export type GitHubCalendarProps = {
  username: string;
  year?: number | "last";
  blockMargin?: number;
  blockRadius?: number;
  blockSize?: number;
  colorScheme?: "light" | "dark";
  errorMessage?: string;
  eventHandlers?: Record<
    string,
    (event: React.SyntheticEvent, data: Activity) => void
  >;
  fontSize?: number;
  hideColorLegend?: boolean;
  hideMonthLabels?: boolean;
  hideTotalCount?: boolean;
  labels?: Labels;
  loading?: boolean;
  ref?: RefObject<HTMLElement>;
  renderBlock?: (block: BlockElement, activity: Activity) => ReactElement;
  renderColorLegend?: (block: BlockElement, level: number) => ReactElement;
  showWeekdayLabels?: boolean | DayName[];
  style?: CSSProperties;
  theme?: ThemeInput;
  throwOnError?: boolean;
  totalCount?: number;
  transformData?: (data: Activity[]) => Activity[];
  transformTotalCount?: boolean;
  weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

// 6 months
export const selectLastHalfYear = (contributions: Activity[]) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const shownMonths = 6;

  return contributions.filter((activity) => {
    const date = new Date(activity.date);
    const monthOfDay = date.getMonth();

    return (
      date.getFullYear() === currentYear &&
      monthOfDay > currentMonth - shownMonths &&
      monthOfDay <= currentMonth
    );
  });
};

const GitHubHeatmap = ({ username }: { username: string }) => {
  const themeMode = useThemeMode();
  const isMobile = useIsMobile();

  // Define custom color scales
  const customTheme = {
    dark: [
      "#232323", // light black
      "#7a1f1f", // dark red
      "#b22222", // firebrick
      "#ff0000", // red
      "#ff4d4d", // light red
    ],
    light: [
      "#000000", // background black
      "#7AF2FF", // soft neon aqua
      "#00E7FF", // strong neon cyan
      "#00B8D6", // deeper neon cyan
      "#006F7F", // darker neon teal
    ],
  };

  //hover commits
  const tooltipId = "gh-heatmap-tooltip";
  const defaultRenderBlock = (block: BlockElement, activity: Activity) =>
    activity && block ? (
      <>
        {React.cloneElement(block, {
          "data-tooltip-id": tooltipId,
          "data-tooltip-content": `${activity.count} contributions on ${activity.date}`,
        })}
      </>
    ) : (
      block
    );

  // Responsive block size and margin
  const blockSize = isMobile ? 7 : 9;
  const blockMargin = isMobile ? 2 : 3;
  const blockRadius = isMobile ? 2 : 3;
  const fontSize = isMobile ? 8 : 10;

  // Only show last 6 months on mobile
  const transformData = isMobile
    ? (contributions: Activity[]) => {
        // Get the last 26 weeks (6 months)
        const last26Weeks = contributions.slice(-18 * 7);
        return last26Weeks;
      }
    : undefined;

  return (
    <div>
      <GitHubCalendar
        username={username}
        blockMargin={blockMargin}
        blockRadius={blockRadius}
        blockSize={blockSize}
        colorScheme={themeMode}
        fontSize={fontSize}
        transformData={transformData}
        // hideColorLegend={true}
        renderBlock={defaultRenderBlock}
        theme={customTheme}
      />
      <Tooltip
        id={tooltipId}
        style={{
          fontSize: fontSize,
          padding: isMobile ? "2px 6px" : "3px 8px",
        }}
      />
    </div>
  );
};

export default GitHubHeatmap;
