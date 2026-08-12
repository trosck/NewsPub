import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import { Divider, Paper } from "@mantine/core";
import "highlight.js/styles/github.css";
import EditorToolbar from "./EditorToolbar.tsx";
import "./editor.scss";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your article...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: {
          autolink: true,
          HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
        },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      Markdown,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Paper withBorder shadow="xs">
      <EditorToolbar editor={editor} />
      <Divider />
      <div className="rte-content">
        <EditorContent editor={editor} />
      </div>
    </Paper>
  );
}

export default RichTextEditor;
