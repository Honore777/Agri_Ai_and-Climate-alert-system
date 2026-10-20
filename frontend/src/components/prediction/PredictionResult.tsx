'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PredictionResponse, SavedPrediction } from '../../services/predictions.service';
import WeatherPanel from './WeatherPanel';

interface PredictionResultProps {
  prediction: SavedPrediction | null;
  inferenceResult: PredictionResponse | null;
  error: string | null;
  isSaving?: boolean;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ 
  prediction,
  inferenceResult,
  error,
  isSaving = false
}) => {
  // Exit early if nothing to show
  if (!prediction && !inferenceResult && !error && !isSaving) {
    return null;
  }

  // Show saving state
  if (isSaving) {
    return (
      <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg flex items-center gap-3">
        <div className="animate-spin">⏳</div>
        <p className="text-blue-700 font-semibold">Saving prediction to database...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
        <p className="text-red-700 font-semibold">Error</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  // Use whichever result we have (prefer saved prediction)
  const resultData = prediction || inferenceResult;
  
  if (!resultData) {
    return null;
  }

  // Determine which data to use for display
  const disease = 'predicted_disease' in resultData ? resultData.predicted_disease : resultData.disease;
  const confidence = resultData.confidence;
  const allPredictions = resultData.all_predictions;

  // Calculate confidence percentage
  const confidencePercent = (confidence * 100).toFixed(1);

  // Color based on confidence level
  const confidenceColor =
    confidence > 0.8 ? 'bg-green-500' :
    confidence > 0.6 ? 'bg-yellow-500' :
    'bg-orange-500';

  // Get top 5 predictions
  const sortedPredictions = Object.entries(allPredictions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 border border-green-300 rounded-lg">
      {/* Success Badge if saved */}
      {prediction && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-semibold text-sm">Prediction saved to database successfully!</p>
        </div>
      )}

      {/* Main Result */}
      <div className="mb-6">
        <p className="text-gray-600 text-sm font-medium mb-2">DETECTED DISEASE</p>
        <p className="text-3xl font-bold text-green-700">{disease}</p>
      </div>

      {/* Confidence Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-700 font-medium">Confidence</p>
          <p className="text-lg font-bold text-gray-800">{confidencePercent}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full ${confidenceColor} transition-all duration-500`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>

      {/* All Predictions */}
      <div>
        <p className="text-gray-700 font-semibold mb-3">All Predictions (Top 5)</p>
        <div className="space-y-2">
          {sortedPredictions.map(([pred_disease, score]) => (
            <div key={pred_disease} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 w-24 truncate">
                {pred_disease}
              </span>
              <div className="flex-1 bg-white rounded-full h-6 overflow-hidden border border-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                  style={{ width: `${score * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-12 text-right">
                {(score * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> If confidence is low, try taking clearer photos of the affected areas.
        </p>
      </div>

      {/* Climate context — attached when the prediction was saved */}
      {prediction?.weather_snapshot && (
        <WeatherPanel snapshot={prediction.weather_snapshot} />
      )}

      {/* Database Status */}
      {prediction && (
        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700">
          <strong>Prediction ID:</strong> {prediction.id} |
          <strong className="ml-2">Saved At:</strong> {new Date(prediction.created_at).toLocaleString()}
        </div>
      )}
    </div>
  );
};