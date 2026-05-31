"use client";

import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import { SlashCommandExtension } from "./SlashCommandMenu";
import { AtDateMention } from "./AtMentionExtension";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder = "メモを入力... / でコマンド" }: TiptapEditorProps) {
  // useMemo で拡張機能インスタンスを安定化し、毎レンダーの再生成を防ぐ
  // StarterKit には Underline が含まれているため別途追加しない（重複防止）
  const extensions = useMemo(() => [
    StarterKit.configure({ codeBlock: false }),
    Placeholder.configure({ placeholder }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Typography,
    Highlight,
    SlashCommandExtension,
    AtDateMention,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [placeholder]);

  const editor = useEditor({
    extensions,
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
