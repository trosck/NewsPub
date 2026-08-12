import { useState, type ChangeEvent } from "react";
import {
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import type { Article, Attachment } from "../types.ts";
import RichTextEditor from "../components/editor/RichTextEditor.tsx";
import Attachments from "../components/editor/Attachments.tsx";
import ArticlePreview from "../components/editor/ArticlePreview.tsx";

interface ArticleEditorProps {
  article?: Article;
  onSave: (article: Article) => Promise<void> | void;
  onCancel: () => void;
}

const TITLE_MIN_LENGTH = 3;

function isBodyEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

function ArticleEditor({ article, onSave, onCancel }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>(
    article?.attachments ?? [],
  );
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.currentTarget.value);
    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
  };

  const onBodyChange = (html: string) => {
    setBody(html);
    if (errors.body) setErrors((prev) => ({ ...prev, body: undefined }));
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const nextErrors: { title?: string; body?: string } = {};

    if (trimmedTitle.length === 0) {
      nextErrors.title = "Title is required";
    } else if (trimmedTitle.length < TITLE_MIN_LENGTH) {
      nextErrors.title = `Title must be at least ${TITLE_MIN_LENGTH} characters`;
    }

    if (isBodyEmpty(body)) {
      nextErrors.body = "Content is required";
    }

    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.body) return;

    setSubmitting(true);
    try {
      await onSave({
        id: article?.id ?? crypto.randomUUID(),
        title: trimmedTitle,
        summary: summary.trim() || undefined,
        category: category.trim() || undefined,
        body,
        attachments,
        createdAt: article?.createdAt ?? Date.now(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const draft: Article = {
    id: article?.id ?? "draft",
    title: title.trim(),
    summary: summary.trim() || undefined,
    category: category.trim() || undefined,
    body,
    attachments,
    createdAt: article?.createdAt ?? Date.now(),
  };

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>{article ? "Edit article" : "New article"}</Title>
        <SegmentedControl
          value={mode}
          onChange={(value) => setMode(value as "write" | "preview")}
          data={[
            { label: "Write", value: "write" },
            { label: "Preview", value: "preview" },
          ]}
        />
      </Group>

      {mode === "write" ? (
        <>
          <TextInput
            label="Title"
            placeholder="Article title"
            required
            value={title}
            error={errors.title}
            onChange={onTitleChange}
          />

          <TextInput
            label="Summary"
            placeholder="Short summary (optional)"
            value={summary}
            onChange={(event) => setSummary(event.currentTarget.value)}
          />

          <TextInput
            label="Category"
            placeholder="Category (optional)"
            value={category}
            onChange={(event) => setCategory(event.currentTarget.value)}
          />

          <Stack gap="xs">
            <Text fw={500}>Content</Text>
            <RichTextEditor
              key={article?.id ?? "new"}
              value={body}
              onChange={onBodyChange}
            />
            {errors.body && (
              <Text c="red" size="xs">
                {errors.body}
              </Text>
            )}
          </Stack>

          <Attachments attachments={attachments} onChange={setAttachments} />
        </>
      ) : (
        <ArticlePreview article={draft} />
      )}

      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSave}>
          Save
        </Button>
      </Group>
    </Stack>
  );
}

export default ArticleEditor;
