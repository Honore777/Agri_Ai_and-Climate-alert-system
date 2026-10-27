

import { WeatherSnapshot } from '@/services/predictions.service';

export interface PredictionData{
  id:number;
  farmer_id:number;
  farmer_name?: string | null;
  farmer_email?: string | null;
  farmer_phone?: string | null;
  farmer_location?: string | null;
  farmer_latitude?: number | null;
  farmer_longitude?: number | null;
  farmer_location_source?: string | null;
  image_id:number;
  image_ids?: number[];
  crop_type:string | null;
  predicted_disease:string;
  confidence:number;
  all_predictions:Record<string,number> | null;
  created_at:string;
  weather_snapshot?: WeatherSnapshot | null;
}

export interface PredictionCardProps {
  // DATA flowing DOWN from parent
  prediction: PredictionData;
  isSelected: boolean;
  
  // CALLBACK flowing DOWN from parent
  onSelectPrediction: (id: number) => void;
}