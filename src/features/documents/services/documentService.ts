import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { generateNote } from '../../notes/services/noteGenerationService';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

interface DocumentResult {
  content: string;
  title: string;
  originalText: string;
  metadata: { fileName: string; fileType: string; fileSize: number; documentLanguage: string; noteLanguage: string; uploadDate: string };
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = await Promise.all(Array.from({ length: pdf.numPages }, async (_, index) => {
    const content = await (await pdf.getPage(index + 1)).getTextContent();
    return content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
  }));
  return pages.join('\n').trim();
}

function xmlText(xml: string): string {
  return xml
    .replace(/<w:tab\/>/g, '\t').replace(/<w:br\s*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n').replace(/<\/a:p>/g, '\n')
    .replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim();
}

async function extractTextFromOffice(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const names = Object.keys(zip.files);
  const isWord = names.includes('word/document.xml');
  const isSheet = names.includes('xl/sharedStrings.xml') || names.some((name) => name.startsWith('xl/worksheets/'));
  const files = isWord
    ? ['word/document.xml']
    : isSheet
      ? names.filter((name) => name === 'xl/sharedStrings.xml' || name.startsWith('xl/worksheets/'))
      : names.filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  if (!files.length) throw new Error('This Office document could not be read.');
  const contents = await Promise.all(files.map(async (name) => xmlText(await zip.file(name)!.async('text'))));
  return contents.filter(Boolean).join('\n').trim();
}

export async function handleDocumentUpload(file: File, documentLanguage: string, noteLanguage: string): Promise<DocumentResult> {
  let text: string;
  if (file.type === 'application/pdf') text = await extractTextFromPDF(file);
  else if (file.type === 'text/plain' || file.type === 'text/csv') text = await file.text();
  else if (file.name.toLowerCase().match(/\.(docx|xlsx|pptx)$/)) text = await extractTextFromOffice(file);
  else throw new Error('Unsupported file type. Use PDF, TXT, CSV, DOCX, XLSX, or PPTX.');
  if (!text.trim()) throw new Error('No readable text was found in this document.');

  return {
    content: await generateNote(text, noteLanguage),
    title: file.name.replace(/\.[^/.]+$/, ''),
    originalText: text,
    metadata: { fileName: file.name, fileType: file.type, fileSize: file.size, documentLanguage, noteLanguage, uploadDate: new Date().toISOString() },
  };
}

const SUPPORTED_TYPES = new Set([
  'application/pdf', 'text/plain', 'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

export const isSupportedFileType = (file: File): boolean => SUPPORTED_TYPES.has(file.type) || /\.(docx|xlsx|pptx)$/i.test(file.name);
export const getFileSizeLimit = (): number => 50 * 1024 * 1024;
export const isFileSizeValid = (file: File): boolean => file.size <= getFileSizeLimit();
export function validateFile(file: File): boolean {
  if (!isSupportedFileType(file)) throw new Error('Unsupported file type.');
  if (!isFileSizeValid(file)) throw new Error('File size exceeds the 50 MB limit.');
  return true;
}
