
import { PredictionData } from '../types/prediction.types';
import apiClient from "./api/axios";
import { ReviewData, ReviewedItem, ReviewResponse } from '../types/validation.types';

/**
 * FUNCTION 1: Fetch all pending predictions for agronomist
 * Called when agronomist opens dashboard
 * Backend endpoint filters by agronomist's assigned regions
 */
export const fetchPendingPredictions = async (): Promise<PredictionData[]> => {
  try {
    const response = await apiClient.get<PredictionData[]>('/predictions/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending predictions:', error);
    throw error;
  }
};

/**
 * FUNCTION 2: Submit agronomist's review for a prediction
 * Called when agronomist clicks "Confirm" or "Correct"
 * Saves the review to create training data
 */
export const submitPredictionReview = async (
  predictionId: number,
  reviewData: ReviewData
): Promise<ReviewResponse> => {
  try {
    const response = await apiClient.post<ReviewResponse>(
      `/predictions/${predictionId}/review`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

/**
 * FUNCTION 3: Fetch the agronomist's review history
 * Past predictions this agronomist confirmed or corrected.
 */
export const fetchMyReviewedPredictions = async (): Promise<ReviewedItem[]> => {
  try {
    const response = await apiClient.get<ReviewedItem[]>('/predictions/reviewed/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching review history:', error);
    throw error;
  }
};





