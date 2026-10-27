'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import apiClient from '@/services/api/axios';
import PredictionDetailModal from '@/components/farmer/PredictionDetailModal';
import { getErrorMessage } from '@/utils/errors';

interface Message {
  id: number;
  title: string;
  body: string;
  agronomist_name?: string;
  is_read: boolean;
  prediction_id?: number;
  created_at: string;
}

const MessagesSection = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [openPredictionId, setOpenPredictionId] = useState<number | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Message[]>('/predictions/messages/inbox');
      setMessages(response.data);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to load messages'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    markAsRead(message.id);
  };

  const markAsRead = async (messageId: number) => {
    try {
      await apiClient.get(`/predictions/messages/${messageId}`);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/2 rounded bg-gray-200"></div>
          <div className="space-y-3">
            <div className="h-20 rounded bg-gray-200"></div>
            <div className="h-20 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">{error}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-xl font-semibold text-gray-900">No messages yet</p>
        <p className="mt-2 text-gray-600">
          Your agronomist will send you messages with advice and guidance about your crops
        </p>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Messages from Your Agronomist</h2>

      <div className="space-y-4">
        {messages.map((message) => (
          <button
            key={message.id}
            onClick={() => handleOpenMessage(message)}
            className={`w-full rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
              message.is_read
                ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                : 'border-brand-300 bg-brand-50 hover:bg-brand-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{message.title}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  From: <span className="font-semibold">{message.agronomist_name || 'Agronomist'}</span>
                </p>
              </div>
              {!message.is_read && (
                <span className="mt-2 inline-block h-3 w-3 flex-shrink-0 rounded-full bg-brand-500"></span>
              )}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {new Date(message.created_at).toLocaleDateString()} at{' '}
              {new Date(message.created_at).toLocaleTimeString()}
            </p>
          </button>
        ))}
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 border-b border-gray-200 bg-brand-50 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.title}</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    From:{' '}
                    <span className="font-semibold">
                      {selectedMessage.agronomist_name || 'Agronomist'}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedMessage.is_read && (
                  <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    Read
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {selectedMessage.body}
              </p>

              {selectedMessage.prediction_id && (
                <button
                  type="button"
                  onClick={() => setOpenPredictionId(selectedMessage.prediction_id!)}
                  className="mt-6 flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 text-left transition-colors hover:bg-blue-100"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    About your scan #{selectedMessage.prediction_id}
                    <span className="mt-0.5 block text-xs font-normal text-blue-700">
                      Tap to see the photos and result you sent
                    </span>
                  </p>
                  <ExternalLink className="h-5 w-5 shrink-0 text-blue-600" />
                </button>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-6">
              <button
                onClick={() => setSelectedMessage(null)}
                className="btn-primary flex-1"
              >
                Back to Messages
              </button>
            </div>
          </div>
        </div>
      )}

      {openPredictionId !== null && (
        <PredictionDetailModal
          predictionId={openPredictionId}
          onClose={() => setOpenPredictionId(null)}
        />
      )}
    </div>
  );
};

export default MessagesSection;
