'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { JSONContent } from '@tiptap/react';

interface NoteEditorProps {
  initialContent?: JSONContent;
  onUpdate?: (content: JSONContent) => void;
}

export default function NoteEditor({ initialContent, onUpdate }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <Toolbar editor={editor} />
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `px-2 py-1 rounded text-sm ${
      active ? 'bg-purple-600 text-white' : 'text-white/60 hover:bg-white/10'
    }`;

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap gap-1 border-b border-white/10 bg-white/5 p-2"
    >
      <button
        type="button"
        aria-label="Bold"
        aria-pressed={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive('bold'))}
      >
        Bold
      </button>
      <button
        type="button"
        aria-label="Italic"
        aria-pressed={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive('italic'))}
      >
        Italic
      </button>
      <button
        type="button"
        aria-label="Heading 1"
        aria-pressed={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btn(editor.isActive('heading', { level: 1 }))}
      >
        H1
      </button>
      <button
        type="button"
        aria-label="Heading 2"
        aria-pressed={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive('heading', { level: 2 }))}
      >
        H2
      </button>
      <button
        type="button"
        aria-label="Heading 3"
        aria-pressed={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive('heading', { level: 3 }))}
      >
        H3
      </button>
      <button
        type="button"
        aria-label="Paragraph"
        aria-pressed={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={btn(editor.isActive('paragraph'))}
      >
        P
      </button>
      <button
        type="button"
        aria-label="Bullet list"
        aria-pressed={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive('bulletList'))}
      >
        Bullet List
      </button>
      <button
        type="button"
        aria-label="Inline code"
        aria-pressed={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btn(editor.isActive('code'))}
      >
        Code
      </button>
      <button
        type="button"
        aria-label="Code block"
        aria-pressed={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btn(editor.isActive('codeBlock'))}
      >
        Code Block
      </button>
      <button
        type="button"
        aria-label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-2 py-1 rounded text-sm text-white/60 hover:bg-white/10"
      >
        HR
      </button>
    </div>
  );
}
