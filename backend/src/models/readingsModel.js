import { supabase } from "../config/supabaseClient.js";

const TABLE = "sensor_readings";

function normalize(row) {
  if (!row) return row;
  return {
    ...row,
    temperature: row.temperature === null ? null : Number(row.temperature),
    threshold_value:
      row.threshold_value === null ? null : Number(row.threshold_value),
    difference: row.difference === null ? null : Number(row.difference),
  };
}

export const ReadingsModel = {
  async list() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, temperature, threshold_value, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data.map(normalize);
  },

  async listWithDifference() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, temperature, threshold_value, difference, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data.map(normalize);
  },

  async getStatistics() {
    const { data, error } = await supabase
      .from("sensor_readings_statistics")
      .select("*")
      .single();

    if (error) throw error;

    if (!data || data.total_readings === 0) {
      return {
        total: 0,
        average_difference: null,
        max_difference: null,
        min_difference: null,
        average_temperature: null,
        average_threshold: null,
        stddev_difference: null,
        latest_reading: null,
        earliest_reading: null,
      };
    }

    return {
      total: Number(data.total_readings),
      average_difference: data.average_difference ? Number(data.average_difference) : null,
      max_difference: data.max_difference ? Number(data.max_difference) : null,
      min_difference: data.min_difference ? Number(data.min_difference) : null,
      average_temperature: data.average_temperature ? Number(data.average_temperature) : null,
      average_threshold: data.average_threshold ? Number(data.average_threshold) : null,
      stddev_difference: data.stddev_difference ? Number(data.stddev_difference) : null,
      latest_reading: data.latest_reading,
      earliest_reading: data.earliest_reading,
    };
  },

  async getTopReadingsByDifference(limit = 10) {
    const { data, error } = await supabase
      .rpc("get_top_readings_by_difference", { limit_count: limit });

    if (error) throw error;
    return data.map(normalize);
  },

  async getReadingsByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .rpc("get_readings_by_date_range", {
        start_date: startDate,
        end_date: endDate,
      });

    if (error) throw error;
    return data.map(normalize);
  },

  async latest() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, temperature, threshold_value, difference, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return normalize(data);
  },

  async create(payload) {
    const { temperature, threshold_value } = payload;

    if (typeof temperature !== "number") {
      throw new Error("temperature must be a number");
    }

    const newRow = {
      temperature,
      threshold_value: threshold_value ?? null,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(newRow)
      .select("id, temperature, threshold_value, difference, recorded_at")
      .single();

    if (error) throw error;
    return normalize(data);
  },
};