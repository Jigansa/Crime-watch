import axios from 'axios';

const ML_API_URL = 'http://localhost:8000';

export interface HotspotData {
  state: string;
  latitude: number;
  longitude: number;
  risk: 'Low' | 'Medium' | 'High';
  cluster: number;
  top_crime: string;
  crime_color: string;
  rate_of_crime: number | null;
  crime_breakdown: Record<string, number>;
  [key: string]: any; // For year columns
}

export interface TrendData {
  years: number[];
  actual_values: number[];
  predicted_values: number[];
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  year_over_year_changes: number[];
}

export const mlApi = {
  async getHotspots(file: File): Promise<HotspotData[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${ML_API_URL}/hotspots-ml`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getCrimeTrend(file: File): Promise<TrendData> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${ML_API_URL}/crime-trend`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 