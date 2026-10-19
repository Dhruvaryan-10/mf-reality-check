export type Plan = "direct" | "regular";
export type Category = "index" | "large_cap" | "flexi_cap" | "mid_cap" | "small_cap";

/** One row of data/out/summary.json (one fund + plan). */
export interface FundSummary {
  scheme_code: string;
  fund_name: string;
  category: Category;
  plan: Plan;
  first_date: string;
  last_date: string;
  latest_nav: number;
  cagr_since_2013: number | null;
  cagr_1y: number | null;
  cagr_3y: number | null;
  cagr_5y: number | null;
  cagr_10y: number | null;
  roll3_min: number | null;
  roll3_median: number | null;
  roll3_max: number | null;
  roll3_pct_positive: number | null;
  roll3_beat_index: number | null;
  roll5_min: number | null;
  roll5_median: number | null;
  roll5_max: number | null;
  roll5_pct_positive: number | null;
  roll5_beat_index: number | null;
  max_drawdown: number;
  max_drawdown_date: string;
  covid_drop: number | null;
  volatility: number;
  sip_invested: number;
  sip_value: number;
  sip_xirr: number | null;
}

export interface CategoryRow {
  category: Category;
  funds: number;
  median_cagr_5y: number;
  median_roll5: number;
  avg_roll5_beat_index: number;
  avg_max_drawdown: number;
  avg_volatility: number;
  avg_sip_xirr: number;
}

export interface DirectVsRegular {
  fund_name: string;
  category: Category;
  start_date: string;
  years: number;
  direct_cagr: number;
  regular_cagr: number;
  yearly_gap: number;
  direct_value: number;
  regular_value: number;
  rupees_lost: number;
}

export interface WeeklyPoint {
  date: string;
  nav: number | null;
  drawdown: number | null;
  index_drawdown: number | null;
  roll3: number | null;
  roll5: number | null;
  index_roll3: number | null;
  index_roll5: number | null;
}

export interface FundSeries {
  scheme_code: string;
  fund_name: string;
  plan: Plan;
  category: Category;
  weekly: WeeklyPoint[];
}

/** A fund with both plans, as used across the site. */
export interface Fund {
  slug: string;
  name: string;
  category: Category;
  direct: FundSummary;
  regular: FundSummary;
  dvr: DirectVsRegular | null;
  /** ~60 points of direct-plan NAV for small sparklines */
  spark: number[];
}
