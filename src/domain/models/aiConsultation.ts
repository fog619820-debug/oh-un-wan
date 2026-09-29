export interface AiConsultationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}