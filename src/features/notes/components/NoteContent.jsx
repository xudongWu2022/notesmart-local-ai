import { useEffect, useRef, useCallback } from 'react';
import useDebounce from '../../../shared/hooks/useDebounce';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import CodeBlock from '@tiptap/extension-code-block';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-border p-2 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            : 'hover:bg-surface-hover'
        }`}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            : 'hover:bg-surface-hover'
        }`}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            : 'hover:bg-surface-hover'
        }`}
      >
        H3
      </button>
      <div className="w-px h-6 bg-border mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('bold')
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            : 'hover:bg-surface-hover'
        }`}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('italic')
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            : 'hover:bg-surface-hover'
        }`}
      >
        Italic
      </button>
      <div className="w-px h-6 bg-border mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('bulletList')
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            : 'hover:bg-surface-hover'
        }`}
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('orderedList')
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            : 'hover:bg-surface-hover'
        }`}
      >
        Ordered List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('codeBlock')
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            : 'hover:bg-surface-hover'
        }`}
      >
        Code Block
      </button>
    </div>
  );
};

export default function NoteContent({
  content,
  onEdit,
  isEditing = false,
  editContent = '',
  onEditChange,
  onSave,
  readOnly = false
}) {
  const editorRef = useRef(null);
  const debouncedContent = useDebounce(editContent, 1000);
  const lastSavedContent = useRef(content);
  const isInitialMount = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Italic,
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
    ],
    content: content,
    editable: isEditing,
    autofocus: isEditing ? 'end' : false,
    onUpdate: ({ editor }) => {
      onEditChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [editor, isEditing]);

  const handleClickOutside = useCallback((event) => {
    if (editorRef.current &&
        !editorRef.current.contains(event.target) &&
        editContent !== lastSavedContent.current) {
      onSave?.();
      lastSavedContent.current = editContent;
    }
  }, [editContent, onSave]);

  useEffect(() => {
    if (!isEditing) return;

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, handleClickOutside]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const shouldSave = isEditing &&
                      debouncedContent !== lastSavedContent.current &&
                      debouncedContent !== content &&
                      debouncedContent.trim() !== '';

    if (shouldSave) {
      onSave?.();
      lastSavedContent.current = debouncedContent;
    }
  }, [debouncedContent, isEditing, onSave, content]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`rounded-xl transition-all duration-300 ${
        isEditing
          ? 'ring-2 ring-blue-400/50 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]'
          : 'hover:ring-1 hover:ring-blue-300/30'
      }`}
      ref={editorRef}
    >
      <div
        className={`${!readOnly && !isEditing ? 'hover:bg-surface-hover/50 hover:backdrop-blur-sm' : ''} rounded-xl transition-all duration-300`}
        onClick={() => !readOnly && !isEditing && onEdit?.()}
      >
        {isEditing && <MenuBar editor={editor} />}
        <div className="p-4 sm:p-5">
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none focus:outline-none min-h-[100px] prose-headings:font-semibold prose-h1:text-3xl prose-h1:mb-6 prose-h1:text-content-primary prose-h2:text-2xl prose-h2:mb-4 prose-h2:text-content-primary prose-h3:text-xl prose-h3:mb-3 prose-h3:text-content-primary prose-h4:text-lg prose-h4:mb-2 prose-h4:text-content-secondary prose-p:mb-3 prose-p:leading-relaxed prose-p:text-content-secondary prose-ul:ml-4 prose-ul:mb-3 prose-ol:ml-4 prose-ol:mb-3 prose-li:mb-1 prose-li:text-content-secondary prose-blockquote:border-l-4 prose-blockquote:border-blue-200/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-content-tertiary selection:bg-blue-100/50 selection:text-blue-900"
          />
        </div>
      </div>
    </div>
  );
}
