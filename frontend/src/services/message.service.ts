/**
 * MESSAGE SERVICE - Handle agronomist-to-farmer messaging
 */

import apiClient from './api/axios';

export interface Message {
  id: number;
  agronomist_id: number;
  agronomist_name?: string;
  farmer_id: number;
  prediction_id?: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageCreate {
  title: string;
  body: string;
  prediction_id?: number;
}

/**
 * Send a message from agronomist to farmer about a prediction
 */
export const sendMessageToFarmer = async (
  predictionId: number,
  messageData: MessageCreate
): Promise<Message> => {
  try {
    const response = await apiClient.post<Message>(
      `/predictions/${predictionId}/message`,
      messageData
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get all messages for current farmer
 */
export const getFarmerMessages = async (): Promise<Message[]> => {
  try {
    const response = await apiClient.get<Message[]>(
      '/predictions/messages/inbox'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Get full message details (marks as read)
 */
export const getMessageDetail = async (messageId: number): Promise<Message> => {
  try {
    const response = await apiClient.get<Message>(
      `/predictions/messages/${messageId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
};
