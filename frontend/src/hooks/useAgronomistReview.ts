import { useState, useEffect } from 'react';
import { fetchMyReviewedPredictions, fetchPendingPredictions, submitPredictionReview } from '../services/predictionReview.service';
import { PredictionData } from '../types/prediction.types';
import { ReviewData, ReviewedItem, UseAgronomistReviewReturn } from '../types/validation.types';
import { getErrorMessage } from '../utils/errors';

export const useAgronomistReview = (): UseAgronomistReviewReturn => {
  // STATE VARIABLES
  const [pendingPredictions, setPendingPredictions] = useState<PredictionData[]>([]);
  const [reviewedItems, setReviewedItems] = useState<ReviewedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReviewed, setIsLoadingReviewed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPredictionId, setSelectedPredictionId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // EFFECT: Load predictions when hook mounts (component first renders)
  useEffect(() => {
    loadingPendingPredictions();
    loadReviewed();
  }, []);

  /**
   * FUNCTION 1: Load all pending predictions from backend
   * Called on mount and when agronomist refreshes
   */
  const loadingPendingPredictions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPendingPredictions();
      setPendingPredictions(data);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to load predictions'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load this agronomist's review history (past work).
   * Called on mount and refreshed after each submitted review.
   */
  const loadReviewed = async () => {
    setIsLoadingReviewed(true);
    try {
      const data = await fetchMyReviewedPredictions();
      setReviewedItems(data);
    } catch (err: any) {
      console.error('Failed to load review history:', err);
    } finally {
      setIsLoadingReviewed(false);
    }
  };

  /**
   * FUNCTION 2: Select a prediction to review
   * Called when agronomist clicks on a prediction card
   * Stores ID so review form can show details
   */
  const selectPrediction = (id: number | null) => {
    setSelectedPredictionId(id);
  };

  /**
   * FUNCTION 3: Submit agronomist's review (confirm or correct)
   * Called when agronomist clicks "Submit Review"
   * After submission:
   *   - Remove prediction from list (it's now reviewed)
   *   - Close review form
   *   - Show success message
   */
  const submitReview = async (predictionId: number, reviewData: ReviewData): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Send review to backend
      const response = await submitPredictionReview(predictionId, reviewData);
      console.log('Review submitted successfully:', response);

      // REMOVE from pending list (no longer pending)
      setPendingPredictions(prev =>
        prev.filter(p => p.id !== predictionId)
      );

      // Clear selected prediction (close form)
      setSelectedPredictionId(null);

      // Refetch to ensure UI is in sync with backend
      // (backend filters out validated predictions)
      await loadingPendingPredictions();
      await loadReviewed();

    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to submit review'));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * FUNCTION 4: Clear error message
   * Called when user dismisses error
   */
  const clearError = () => {
    setError(null);
  };

  // RETURN all state and functions to components
  return {
    pendingPredictions,
    reviewedItems,
    isLoading,
    isLoadingReviewed,
    error,
    selectPredictionId: selectedPredictionId,
    isSubmitting,
    loadingPendingPredictions,
    loadReviewed,
    selectPrediction,
    submitReview,
    clearError,
  };
};

