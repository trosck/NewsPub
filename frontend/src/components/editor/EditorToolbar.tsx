import { useState } from "react";
import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { IconLink, IconPhoto } from "@tabler/icons-react";
import {
  ActionIcon,
  Button,
  Divider,
  FileButton,
  Group,
  Modal,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { postUpload } from "../../services/upload.ts";

interface EditorToolbarProps {
  editor: Editor;
}

interface ToolBtnProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolBtn({ label, active, disabled, onClick, children }: ToolBtnProps) {
  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        variant={active ? "filled" : "default"}
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  );
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const openLink = () => {
    const href = editor.getAttributes("link").href;
    setLinkUrl(typeof href === "string" ? href : "");
    setLinkOpen(true);
  };

  const submitLink = () => {
    setLinkOpen(false);
    const href = linkUrl.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href, target: "_blank", rel: "noopener noreferrer" })
      .run();
  };

  const handleImageSelect = async (file: File | null) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const { url } = await postUpload(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <>
      <Group gap={4} wrap="wrap" p={6}>
        <ToolBtn
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolBtn>
        <ToolBtn
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span style={{ textDecoration: "underline" }}>U</span>
        </ToolBtn>
        <ToolBtn
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </ToolBtn>

        <Divider orientation="vertical" />

        <ToolBtn
          label="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </ToolBtn>
        <ToolBtn
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolBtn>
        <ToolBtn
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolBtn>

        <Divider orientation="vertical" />

        <ToolBtn
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          &bull;
        </ToolBtn>
        <ToolBtn
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolBtn>
        <ToolBtn
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo;
        </ToolBtn>

        <Divider orientation="vertical" />

        <ToolBtn
          label="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          {"</>"}
        </ToolBtn>
        <ToolBtn
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"{ }"}
        </ToolBtn>

        <Divider orientation="vertical" />

        <ToolBtn
          label="Insert link"
          active={editor.isActive("link")}
          onClick={openLink}
        >
          <IconLink size={16} stroke={1.75} />
        </ToolBtn>

        <FileButton onChange={handleImageSelect} accept="image/*">
          {(props) => (
            <Tooltip label="Insert image" withArrow>
              <ActionIcon
                {...props}
                variant="default"
                loading={uploadingImage}
                aria-label="Insert image"
              >
                <IconPhoto size={16} stroke={1.75} />
              </ActionIcon>
            </Tooltip>
          )}
        </FileButton>

        <Divider orientation="vertical" />

        <ToolBtn
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          &#8630;
        </ToolBtn>
        <ToolBtn
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          &#8631;
        </ToolBtn>
      </Group>

      <Modal
        opened={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Insert link"
      >
        <TextInput
          label="URL"
          placeholder="https://example.com"
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitLink();
          }}
          autoFocus
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setLinkOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submitLink}>Apply</Button>
        </Group>
      </Modal>
    </>
  );
}

export default EditorToolbar;
