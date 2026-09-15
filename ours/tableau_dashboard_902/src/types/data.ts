/**
 * Normalized data record after parsing
 * CSV source: /data/clients (techmadness).csv
 * Headers are triple-quoted (e.g., """campaign""") and normalized to clean field names
 */
export interface DataRecord {
  campaign: string;
  channel: string;
  control: number;
  uid: number;
  event: string;
  ts: string;
  dadd: string;
}

/**
 * Control group display name mapping
 */
export const CONTROL_LABELS: Record<number, string> = {
  0: 'Целевая', // Target
  1: 'Контрольная', // Control
};

/**
 * Channel color mapping from Tableau spec
 */
export const CHANNEL_COLORS: Record<string, string> = {
  chat: '#4e79a7',
  sms: '#e15759',
  email: '#f28e2b',
};

/**
 * Control group color mapping from Tableau spec
 */
export const CONTROL_COLORS: Record<number, string> = {
  0: '#59a14f', // Target (Целевая)
  1: '#e15759', // Control (Контрольная)
};

/**
 * Filter state for cross-sheet filtering
 */
export interface FilterState {
  control: number | null;
  channel: string | null;
  campaign: string | null;
}

/**
 * Aggregated metrics for bubble charts
 */
export interface BubbleData {
  key: string;
  value: number;
  users_count: number;
  record_count: number;
}

/**
 * Control group aggregated data for Sheet 4
 */
export interface ControlGroupData extends BubbleData {
  control: number;
  controlLabel: string;
}

/**
 * Channel aggregated data for Sheet 3
 */
export interface ChannelData extends BubbleData {
  channel: string;
}

/**
 * Funnel data for Sheet 2
 */
export interface FunnelData {
  event: string;
  control: number;
  controlLabel: string;
  users_count: number;
}

/**
 * Campaign data for Sheet 5
 */
export interface CampaignData {
  campaign: string;
  channel: string;
  users_count: number;
}

/**
 * Highlight selection state
 */
export interface HighlightState {
  type: 'control' | 'channel' | 'campaign' | null;
  value: string | number | null;
}
