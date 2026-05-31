import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { format, addDays, parseISO, isValid } from "date-fns";
import { ja } from "date-fns/locale";

const AT_TRIGGER_REGEX = /@(今日|明日|yesterday|today|tomorrow|\d{4}-\d{2}-\d{2})$/;

function resolveAtDate(token: string): Date | null {
  if (token === "今日" || token === "today") return new Date();
  if (token === "明日" || token === "tomorrow") return addDays(new Date(), 1);
  if (token === "yesterday") return addDays(new Date(), -1);
  const d = parseISO(token);
  if (isValid(d)) return d;
  return null;
}

export const AtDateMention = Extension.create({
  name: "atDateMention",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("atDateMention"),
        props: {
          handleKeyDown(view, event) {
            if (event.key !== "Enter" && event.key !== " ") return false;
            const { state } = view;
            const { selection } = state;
            const { from } = selection;
            const textBefore = state.doc.textBetween(Math.max(0, from - 20), from, "");
            const match = textBefore.match(AT_TRIGGER_REGEX);
            if (!match) return false;
            const token = match[1];
            const date = resolveAtDate(token);
            if (!date) return false;

            const fullMatch = match[0];
            const label = format(date, "yyyy/M/d（E）", { locale: ja });
            const replacement = `@${label} `;
            const start = from - fullMatch.length;
            const tr = state.tr.insertText(replacement, start, from);
            view.dispatch(tr);
            return true;
          },
        },
      }),
    ];
  },
});
