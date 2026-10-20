import { useState } from 'react';
import predictionsService, { PredictionResponse, SavedPrediction } from '../services/predictions.service';

interface UsePredictionReturn {
  predict: (file: File, cropType?: string) => Promise<SavedPrediction | null>;
  prediction: SavedPrediction | null;
  inferenceResult: PredictionResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  clearPrediction: () => void;
}

export const usePrediction = (): UsePredictionReturn => {
  const [prediction, setPrediction] = useState<SavedPrediction | null>(null);
  const [inferenceResult, setInferenceResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async (file: File, cropType?: string): Promise<SavedPrediction | null> => {
    setPrediction(null);
    setInferenceResult(null);
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Get prediction from ML model
      const result = await predictionsService.predictDisease(file);
      setInferenceResult(result);
      
      // Step 2: Save prediction to database
      setIsSaving(true);
      const savedPrediction = await predictionsService.savePrediction(
        file,
        result,
        cropType
      );
      setPrediction(savedPrediction);
      setError(null);
      return savedPrediction;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process prediction';
      setError(errorMessage);
      setPrediction(null);
      return null;
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const clearPrediction = (): void => {
    setPrediction(null);
    setInferenceResult(null);
    setError(null);
  };

  return { predict, prediction, inferenceResult, isLoading, isSaving, error, clearPrediction };
};

export default usePrediction;