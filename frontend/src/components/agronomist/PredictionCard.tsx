'use client';

import React from 'react';
import { Mail, MapPin, Navigation, Phone } from 'lucide-react';
import { PredictionData } from '../../types/prediction.types';
import PredictionImage from '../prediction/PredictionImage';
import WeatherPanel from '../prediction/WeatherPanel';
import { diseaseLabel } from '@/utils/disease';
import { useTranslation } from '@/i18n/LocaleContext';

interface PredictionCardProps {
  prediction: PredictionData;
  isSelected: boolean;
  onSelectPrediction: (id: number) => void;
}


const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  isSelected,
  onSelectPrediction,
}) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={() => onSelectPrediction(prediction.id)}
      className={`
        rounded-lg p-6 cursor-pointer transition-all
        ${isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' 
          : 'bg-white border border-gray-200 hover:shadow-md'
        }
      `}
    >
      {/* Disease Image(s) — primary photo + any extras the farmer attached */}
      <div className="mb-4">
        <PredictionImage imageId={prediction.image_id} />
        {(prediction.image_ids?.length ?? 0) > 1 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {prediction.image_ids!.slice(1).map((id) => (
              <PredictionImage key={id} imageId={id} className="h-16" />
            ))}
          </div>
        )}
      </div>

      {/* Confidence Score Badge */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-gray-900">
          Prediction #{prediction.id}
        </h3>
        <span className={`
          px-3 py-1 rounded-full text-sm font-semibold
          ${prediction.confidence > 0.8 
            ? 'bg-green-100 text-green-800' 
            : prediction.confidence > 0.6
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
          }
        `}>
          {(prediction.confidence * 100).toFixed(1)}%
        </span>
      </div>

      {/* Farmer Information */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-xs font-medium uppercase">Farmer Details</p>
        {prediction.farmer_name && (
          <p className="text-gray-900 font-semibold mt-1">{prediction.farmer_name}</p>
        )}
        {prediction.farmer_phone && (
          <p className="flex items-center gap-1.5 text-gray-700 text-sm">
            <Phone className="h-3.5 w-3.5 text-gray-500" /> {prediction.farmer_phone}
          </p>
        )}
        {prediction.farmer_email && (
          <p className="flex items-center gap-1.5 text-gray-700 text-sm">
            <Mail className="h-3.5 w-3.5 text-gray-500" /> {prediction.farmer_email}
          </p>
        )}
        {prediction.farmer_location && (
          <p className="mt-1 flex items-start gap-1.5 text-gray-700 text-sm">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span>{prediction.farmer_location}</span>
          </p>
        )}
        {prediction.farmer_latitude != null && prediction.farmer_longitude != null ? (
          <p className="flex items-center gap-1.5 text-gray-700 text-sm">
            <Navigation className="h-3.5 w-3.5 text-sky-600" />
            <span>
              GPS: {prediction.farmer_latitude.toFixed(5)}, {prediction.farmer_longitude.toFixed(5)}
              {prediction.farmer_location_source === 'gps' ? ' (precise)' : ''}
            </span>
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs italic text-gray-500">
            <Navigation className="h-3.5 w-3.5" /> No GPS — location from admin area only
          </p>
        )}
        {!prediction.farmer_name && !prediction.farmer_phone && !prediction.farmer_email && !prediction.farmer_location && (
          <p className="text-gray-500 text-sm italic">No farmer details available</p>
        )}
      </div>

      {/* Disease Prediction */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm font-medium">AI Predicted Disease:</p>
        <p className="text-xl font-bold text-blue-600 mt-1">
          {diseaseLabel(t, prediction.predicted_disease)}
        </p>
      </div>

      {/* Crop Type (if available) */}
      {prediction.crop_type && (
        <div className="mb-4">
          <p className="text-gray-600 text-sm font-medium">Crop Type:</p>
          <p className="text-gray-900 font-semibold">{prediction.crop_type}</p>
        </div>
      )}

      {/* Climate context for the reviewer — rain history + forecast */}
      {prediction.weather_snapshot && (
        <WeatherPanel snapshot={prediction.weather_snapshot} />
      )}

      {/* Date */}
      <div className="mt-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
        {new Date(prediction.created_at).toLocaleDateString()} at{' '}
        {new Date(prediction.created_at).toLocaleTimeString()}
      </div>

      {/* Click Hint */}
      {!isSelected && (
        <p className="text-xs text-blue-600 mt-3">Click to review</p>
      )}
    </div>
  );
};

export default PredictionCard;