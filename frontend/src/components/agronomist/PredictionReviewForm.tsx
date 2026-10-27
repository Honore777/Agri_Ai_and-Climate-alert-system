'use client';

import React, { useState } from 'react';
import { CheckCircle2, Mail, PencilLine } from 'lucide-react';
import { PredictionData } from '../../types/prediction.types';
import { ReviewData } from '../../types/validation.types';
import { getErrorMessage } from '../../utils/errors';
import { diseaseLabel } from '@/utils/disease';
import { useTranslation } from '@/i18n/LocaleContext';

interface PredictionReviewFormProps {
  prediction: PredictionData;
  onSubmit: (reviewData: ReviewData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

/**
 * Form for agronomist to confirm or correct AI prediction
 * 
 * KEY FORM CONCEPTS:
 * 1. useState for form inputs
 * 2. Conditional rendering based on status toggle
 * 3. Form validation
 * 4. Loading states
 */
const PredictionReviewForm: React.FC<PredictionReviewFormProps> = ({
  prediction,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const { t } = useTranslation();
  // FORM STATE
  const [status, setStatus] = useState<'confirmed' | 'corrected'>('confirmed');
  const [cropType, setCropType] = useState('');
  const [correctedDisease, setCorrectedDisease] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sendMessage, setSendMessage] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');

  /**
   * TAILWIND LESSON: Form Validation
   * Validate before submission
   */
  const validateForm = (): boolean => {
    if (!cropType.trim()) {
      setError('Crop type is required');
      return false;
    }
    if (status === 'corrected' && !correctedDisease.trim()) {
      setError('Please specify the corrected disease');
      return false;
    }
    if (sendMessage) {
      if (!messageTitle.trim()) {
        setError('Message title is required');
        return false;
      }
      if (!messageBody.trim()) {
        setError('Message body is required');
        return false;
      }
    }
    return true;
  };

  /**
   * Handle form submission
   * Prevents default form behavior, validates, then calls parent's onSubmit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const reviewData: ReviewData = {
      status,
      crop_type: cropType,
      corrected_disease: status === 'corrected' ? correctedDisease : null,
      notes: notes || null,
    };

    try {
      // Submit review
      await onSubmit(reviewData);
      
      // Send message to farmer if checkbox is checked
      if (sendMessage) {
        const { sendMessageToFarmer } = await import('../../services/message.service');
        await sendMessageToFarmer(prediction.id, {
          title: messageTitle,
          body: messageBody,
          prediction_id: prediction.id,
        });
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to submit review'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* 
        TAILWIND LESSON: Modal Overlay
        - fixed: stuck to screen
        - inset-0: covers entire screen (top: 0, bottom: 0, left: 0, right: 0)
        - bg-black bg-opacity-50: semi-transparent dark background
        - flex items-center justify-center: centers content
        - z-50: appears on top of everything
      */}

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
          {/* 
            TAILWIND LESSON: Sticky Header with Gradient
            - sticky top-0: stays at top when scrolling
            - bg-gradient-to-r: left to right gradient
            - from-blue-50 to-indigo-50: light blue gradient
            - border-b: bottom border only
          */}
          <h2 className="text-2xl font-bold text-gray-900">
            Review Prediction #{prediction.id}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(prediction.created_at).toLocaleString()}
          </p>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 
            TAILWIND LESSON: Spacing with space-y
            - space-y-6: adds margin-bottom: 1.5rem to each child (except last)
            - Creates consistent vertical rhythm without individual margin classes
          */}

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              {/* 
                TAILWIND LESSON: Error State Styling
                - bg-red-50: very light red background
                - border border-red-200: light red border
                - flex items-start gap-3: horizontal layout with gap
              */}
              <div className="text-red-600 font-bold text-lg mt-0.5">!</div>
              <div>
                <p className="font-semibold text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* AI PREDICTION DISPLAY (READ-ONLY INFO) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {/* 
              TAILWIND LESSON: Info Box with Background Color
              - Used for displaying AI's original prediction
              - Different from form inputs (read-only)
            */}
            <h3 className="font-semibold text-blue-900 mb-3">AI Prediction</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700">Disease:</p>
                <p className="font-bold text-blue-900 text-lg">
                  {diseaseLabel(t, prediction.predicted_disease)}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Confidence:</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-blue-900 text-lg">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </p>
                  {/* 
                    TAILWIND LESSON: Dynamic Width Indicator
                    - width based on confidence (0-100)
                    - visual representation of certainty
                  */}
                  <div className="w-32 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CROP TYPE INPUT (REQUIRED) */}
          <div>
            {/* 
              TAILWIND LESSON: Form Group Pattern
              - Wrapper div groups label + input
              - Consistent spacing between elements
            */}
            <label htmlFor="cropType" className="block text-sm font-semibold text-gray-900 mb-2">
              Crop Type 
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="cropType"
              type="text"
              placeholder="e.g., Maize, Wheat, Beans..."
              value={cropType}
              onChange={(e) => {
                setCropType(e.target.value);
                setError(null); // Clear error on change
              }}
              className={`
                w-full px-4 py-2 rounded-lg border-2 transition-all
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-400
                ${cropType 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
              disabled={isSubmitting}
            />
            {/* 
              TAILWIND LESSON: Conditional Input Styling
              - border-2: thicker border for prominence
              - transition-all: smooth color change
              - focus:outline-none: remove default outline
              - focus:ring-2 focus:ring-blue-400: custom focus state
              - Dynamic className using ternary:
                - If has value: blue tint
                - If empty: gray background
            */}
          </div>

          {/* STATUS TOGGLE: CONFIRM vs CORRECT */}
          <div>
            {/* 
              TAILWIND LESSON: Toggle Button Group
              - Two buttons acting as radio buttons
              - Only one can be selected
            */}
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Is the prediction correct?
            </label>
            <div className="flex gap-3">
              {/* CONFIRM BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setStatus('confirmed');
                  setCorrectedDisease(''); // Clear when switching to confirm
                }}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-semibold transition-all
                  ${status === 'confirmed'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {/* 
                  TAILWIND LESSON: Active State Styling
                  - When active: green with shadow
                  - When inactive: gray, ho hover effect
                  - shadow-lg shadow-green-500/50: colored shadow
                */}
                <span className="inline-flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Confirm
                </span>
              </button>

              {/* CORRECT BUTTON */}
              <button
                type="button"
                onClick={() => setStatus('corrected')}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-semibold transition-all
                  ${status === 'corrected'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <PencilLine className="h-4 w-4" /> Correct
                </span>
              </button>
            </div>
          </div>

          {/* CORRECTED DISEASE INPUT (SHOWS ONLY IF "CORRECT" SELECTED) */}
          {status === 'corrected' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              {/* 
                TAILWIND LESSON: Conditional Rendering + Animation
                - Only shows when status === 'corrected'
                - animate-in: Tailwind animation
                - fade-in: opacity animation
                - slide-in-from-top-2: moves in from top slightly
              */}
              <label htmlFor="correctedDisease" className="block text-sm font-semibold text-gray-900 mb-2">
                What is the correct disease?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="correctedDisease"
                type="text"
                placeholder="Enter the correct disease..."
                value={correctedDisease}
                onChange={(e) => setCorrectedDisease(e.target.value)}
                className={`
                  w-full px-4 py-2 rounded-lg border-2 transition-all
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-orange-400
                  ${correctedDisease
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                `}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* NOTES TEXTAREA (OPTIONAL) */}
          <div>
            {/* 
              TAILWIND LESSON: Textarea Styling
              - Same pattern as input but for multiline text
              - resize-none: prevent user from resizing (for consistent design)
            */}
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              placeholder="Add any additional observations about this prediction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`
                w-full px-4 py-2 rounded-lg border-2 transition-all resize-none
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-400
                ${notes
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
              disabled={isSubmitting}
            />
          </div>

          {/* SEND MESSAGE TO FARMER SECTION */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="sendMessage"
                checked={sendMessage}
                onChange={(e) => setSendMessage(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                disabled={isSubmitting}
              />
              <label htmlFor="sendMessage" className="text-sm font-semibold text-gray-900 cursor-pointer flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-indigo-600" /> Send message to farmer
              </label>
            </div>

            {sendMessage && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="messageTitle" className="block text-sm font-semibold text-gray-900 mb-1">
                    Message Title
                  </label>
                  <input
                    id="messageTitle"
                    type="text"
                    placeholder="e.g., 'Advice for your tomato crop'"
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded border-2 border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="messageBody" className="block text-sm font-semibold text-gray-900 mb-1">
                    Message Body
                  </label>
                  <textarea
                    id="messageBody"
                    placeholder="Write your message to the farmer..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded border-2 border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {/* 
              TAILWIND LESSON: Button Group
              - gap-3: space between buttons
              - pt-4 border-t: adds top padding and border line
            */}
            
            {/* CANCEL BUTTON */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={`
                flex-1 px-4 py-2 rounded-lg font-semibold transition-all
                ${isSubmitting
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }
              `}
            >
              Cancel
            </button>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                flex-1 px-4 py-2 rounded-lg font-semibold transition-all
                flex items-center justify-center gap-2
                ${isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : status === 'confirmed'
                  ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                  : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                }
              `}
            >
              {/* 
                TAILWIND LESSON: Loading States
                - active:scale-95: button shrinks slightly when clicked (tactile feedback)
                - Disabled state with changed colors
                - Dynamic button color based on status
              */}
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PredictionReviewForm;