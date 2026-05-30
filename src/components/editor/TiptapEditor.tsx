"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { SlashCommandExtension } from "./SlashCommandMenu";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder = "メモを入力... / でコマンド" }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      // underline: false を指定して StarterKit 側の登録を無効化し、明示的に追加して重複を防ぐ
      StarterKit.configure({ codeBlock: false, underline: false }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Typography,
      Highlight,
      SlashCommandExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
    immediatelyRender: false,
  });

  // Sync content when task changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  return (
    <div className="text-sm">
      <EditorContent editor={editor} />
    </div>
  );
}
