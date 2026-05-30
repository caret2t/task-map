"use client";

import { Extension } from "@tiptap/core";
import { Editor, ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import tippy, { type Instance } from "tippy.js";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import "tippy.js/dist/tippy.css";

interface CommandItem {
  title: string;
  subtitle?: string;
  command: (editor: Editor) => void;
}

const COMMANDS: CommandItem[] = [
  {
    title: "見出し1",
    subtitle: "大見出し",
    command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "見出し2",
    subtitle: "中見出し",
    command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "見出し3",
    subtitle: "小見出し",
    command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "箇条書き",
    subtitle: "順序なしリスト",
    command: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    title: "番号リスト",
    subtitle: "順序あり",
    command: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "タスクリスト",
    subtitle: "チェックボックス",
    command: (e) => e.chain().focus().toggleTaskList().run(),
  },
  {
    title: "引用",
    subtitle: "ブロック引用",
    command: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "区切り線",
    subtitle: "水平線",
    command: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "コード",
    subtitle: "インラインコード",
    command: (e) => e.chain().focus().toggleCode().run(),
  },
  {
    title: "太字",
    command: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    title: "斜体",
    command: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    title: "ハイライト",
    command: (e) => e.chain().focus().toggleHighlight().run(),
  },
  {
    title: "下線",
    command: (e) => e.chain().focus().toggleUnderline().run(),
  },
];

interface SlashMenuProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

const SlashMenu = forwardRef<{ onKeyDown: (e: KeyboardEvent) => boolean }, SlashMenuProps>(
  ({ items, command }, ref) => {
    const [selected, setSelected] = useState(0);

    useEffect(() => setSelected(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown({ key }: KeyboardEvent) {
        if (key === "ArrowUp") {
          setSelected((s) => Math.max(0, s - 1));
          return true;
        }
        if (key === "ArrowDown") {
          setSelected((s) => Math.min(items.length - 1, s + 1));
          return true;
        }
        if (key === "Enter") {
          command(items[selected]);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) return null;

    return (
      <div className="z-50 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)] shadow-lg w-48">
        {items.map((item, i) => (
          <button
            key={item.title}
            className={`flex flex-col w-full px-3 py-2 text-left text-sm hover:bg-[var(--surface)] transition-colors ${
              i === selected ? "bg-[var(--surface)]" : ""
            }`}
            onClick={() => command(item)}
          >
            <span className="font-medium">{item.title}</span>
            {item.subtitle && (
              <span className="text-xs text-[var(--muted)]">{item.subtitle}</span>
            )}
          </button>
        ))}
      </div>
    );
  }
);
SlashMenu.displayName = "SlashMenu";

export const SlashCommandExtension = Extension.create({
  name: "slashCommand",
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        command: ({ editor, range, props }) => {
          props.command(editor);
          editor.chain().focus().deleteRange(range).run();
        },
        items: ({ query }: { query: string }) => {
          return COMMANDS.filter((c) =>
            c.title.toLowerCase().includes(query.toLowerCase())
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (): any => {
          let component: ReactRenderer;
          let popup: Instance[];

          return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onStart(props: any) {
              component = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor,
              });
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              }) as Instance[];
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onUpdate(props: any) {
              component.updateProps(props);
              popup[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
            },
            onKeyDown(props: { event: KeyboardEvent }) {
              if (props.event.key === "Escape") {
                popup[0]?.hide();
                return true;
              }
              return (component.ref as { onKeyDown: (e: KeyboardEvent) => boolean })?.onKeyDown(props.event) ?? false;
            },
            onExit() {
              popup[0]?.destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
