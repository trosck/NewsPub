import { useState } from "react";
import {
  ActionIcon,
  Anchor,
  Button,
  FileButton,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import type { Attachment } from "../../types.ts";
import { postUpload } from "../../services/upload.ts";

interface AttachmentsProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Attachments({ attachments, onChange }: AttachmentsProps) {
  const [uploading, setUploading] = useState(false);

  const handleAdd = async (files: File[] | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((file) => postUpload(file)));
      const next: Attachment[] = uploaded.map((item) => ({
        id: crypto.randomUUID(),
        name: item.name,
        size: item.size,
        type: item.type,
        url: item.url,
      }));
      onChange([...attachments, ...next]);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((item) => item.id !== id));
  };

  return (
    <Stack gap="xs">
      <Text fw={500}>Attachments</Text>
      <FileButton onChange={handleAdd} multiple>
        {(props) => (
          <Button variant="default" loading={uploading} {...props}>
            Add files
          </Button>
        )}
      </FileButton>

      {uploading && <Progress size="xs" value={100} animated />}

      {attachments.length === 0 ? (
        <Text c="dimmed" size="sm">
          No files attached.
        </Text>
      ) : (
        attachments.map((item) => (
          <Paper key={item.id} p="xs" withBorder>
            <Group justify="space-between">
              <Stack gap={2}>
                <Text size="sm">{item.name}</Text>
                <Text size="xs" c="dimmed">
                  {formatBytes(item.size)}
                </Text>
              </Stack>
              <Group gap="xs">
                <Anchor href={item.url} download={item.name} size="sm">
                  Download
                </Anchor>
                <ActionIcon
                  variant="default"
                  color="red"
                  onClick={() => handleRemove(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  &times;
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        ))
      )}
    </Stack>
  );
}

export default Attachments;
