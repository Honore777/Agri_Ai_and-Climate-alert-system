import { PredictionData } from "./prediction.types";

export interface ReviewData{
  status:'confirmed'|'corrected';
  crop_type:string;
  corrected_disease:string | null;
  notes:string | null;
}

export interface ReviewResponse{
  id:number;
  production_id:number;
  agronomist_id:number;
  status:'confirmed' |'corrected';
  crop_type:string;
  corrected_disease:string | null;
  notes: string | null;
  reviewed_at:string;
}

/** One entry in the agronomist's review history (review + prediction context). */
export interface ReviewedItem {
  review_id: number;
  status: 'confirmed' | 'corrected';
  crop_type: string;
  corrected_disease: string | null;
  notes: string | null;
  reviewed_at: string;
  prediction: {
    id: number;
    image_id: number;
    image_ids?: number[];
    farmer_id: number;
    farmer_name?: string | null;
    farmer_email?: string | null;
    farmer_location?: string | null;
    farmer_latitude?: number | null;
    farmer_longitude?: number | null;
    farmer_location_source?: string | null;
    predicted_disease: string;
    confidence: number;
    crop_type?: string | null;
    created_at: string;
    weather_snapshot?: PredictionData['weather_snapshot'];
  };
}

export interface UseAgronomistReviewReturn {
  pendingPredictions: PredictionData[];
  reviewedItems: ReviewedItem[];
  isLoading:boolean;
  isLoadingReviewed:boolean;
  error:string| null;
  selectPredictionId:number | null;
  isSubmitting:boolean;

  loadingPendingPredictions:()=> Promise<void>;
  loadReviewed:()=> Promise<void>;
  selectPrediction:(id:number| null)=> void;
  submitReview: (predictionId:number, reviewData:ReviewData) => Promise<void>;
  clearError:() => void;
}