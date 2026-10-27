import apiClient from './api/axios';
import { getErrorMessage } from '../utils/errors';

export interface PredictionResponse {
  disease: string;
  confidence: number;
  all_predictions: Record<string, number>;
}

export interface WeatherDay {
  date: string;
  temp_max: number | null;
  temp_min: number | null;
  rain_mm: number | null;
  humidity: number | null;
}

export interface WeatherSummary {
  avg_temp_max_7d: number | null;
  avg_temp_min_7d: number | null;
  avg_humidity_7d: number | null;
  total_rain_7d_mm: number | null;
  total_rain_30d_mm: number | null;
  alerts: { type: string; message: string }[];
}

export interface WeatherSnapshot {
  id: number;
  prediction_id: number;
  latitude: number;
  longitude: number;
  location_source: string;
  fetched_at: string;
  data: {
    summary: WeatherSummary;
    history: WeatherDay[];
    forecast: WeatherDay[];
  };
}

export interface SavedPrediction {
  id: number;
  farmer_id: number;
  image_id: number;
  /** Primary image first, then farmer-attached extras */
  image_ids?: number[];
  crop_type: string | null;
  predicted_disease: string;
  confidence: number;
  all_predictions: Record<string, number>;
  model_version: string;
  created_at: string;
  weather_snapshot?: WeatherSnapshot | null;
  farmer_name?: string | null;
  farmer_email?: string | null;
  farmer_phone?: string | null;
  farmer_location?: string | null;
  farmer_latitude?: number | null;
  farmer_longitude?: number | null;
  farmer_location_source?: string | null;
}

const INFERENCE_API = '/inference/predict';
const PREDICTIONS_SAVE_API = '/predictions/save';

// Convert File to base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 from data:image/...;base64,... format
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const predictionsService = {
  async predictDisease(file: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<PredictionResponse>(
        INFERENCE_API,
        formData
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(getErrorMessage(error, 'Invalid image file'));
      }
      if (error.response?.status === 500) {
        throw new Error(getErrorMessage(error, 'Prediction failed on server'));
      }
      throw new Error(error.message || 'Failed to predict disease');
    }
  },

  async savePrediction(
    file: File,
    predictionResult: PredictionResponse,
    cropType?: string,
    modelVersion?: string
  ): Promise<SavedPrediction> {
    try {
      // Convert image to base64
      const imageBase64 = await fileToBase64(file);

      // Save prediction with image data
      const response = await apiClient.post<SavedPrediction>(
        PREDICTIONS_SAVE_API,
        {
          image_base64: imageBase64,
          predicted_disease: predictionResult.disease,
          confidence: predictionResult.confidence,
          all_predictions: predictionResult.all_predictions,
          crop_type: cropType || null,
          model_version: modelVersion || 'plant_disease_resnet18_v1',
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(getErrorMessage(error, 'Invalid prediction data'));
      }
      if (error.response?.status === 500) {
        throw new Error(getErrorMessage(error, 'Failed to save prediction'));
      }
      throw new Error(error.message || 'Failed to save prediction to database');
    }
  },

  /** Farmer's own prediction history (newest first). */
  async getMyPredictions(): Promise<SavedPrediction[]> {
    const res = await apiClient.get<SavedPrediction[]>('/predictions/user/me');
    return res.data;
  },

  /** Attach extra photos to an existing prediction (agronomist may ask for more angles). */
  async addAttachments(predictionId: number, files: File[]): Promise<number[]> {
    const images = await Promise.all(files.map(fileToBase64));
    const res = await apiClient.post<number[]>(
      `/predictions/${predictionId}/attachments`,
      { images }
    );
    return res.data;
  },
};

export default predictionsService;