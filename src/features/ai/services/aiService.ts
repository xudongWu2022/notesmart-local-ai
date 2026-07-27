import { generateAiText } from '../../../shared/lib/aiClient';
import { relatedLearningContext } from '../../learning/services/learningMemory';

export const askQuestion = async (
  noteContent: string,
  question: string,
  onData: (content: string) => void,
): Promise<void> => {
  if (!question.trim()) throw new Error('Question is required.');

  const instruction = noteContent
    ? 'You are a careful learning assistant. Answer using the supplied note; say clearly when the note does not contain enough evidence.'
    : 'You are a helpful learning assistant.';
  const memory = await relatedLearningContext(question, noteContent);
  const input = noteContent
    ? `Note:\n${noteContent}\n\nQuestion: ${question}`
    : question;

  const answer = await generateAiText({
    instruction: memory ? `${instruction}\n\nRelevant local study notes (use only when helpful):\n${memory}` : instruction,
    input,
    temperature: 0.5,
    maxTokens: 2400,
  });
  onData(answer);
};
