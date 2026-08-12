import { Badge, Divider, Stack, Text, Title } from "@mantine/core";
import type { Article } from "../../types.ts";
import "./editor.scss";

interface ArticlePreviewProps {
  article: Article;
}

function ArticlePreview({ article }: ArticlePreviewProps) {
  const attachments = article.attachments ?? [];

  return (
    <Stack gap="md">
      {article.category && <Badge>{article.category}</Badge>}

      <Title order={1}>{article.title}</Title>

      {article.summary && (
        <Text size="lg" c="dimmed" fs="italic">
          {article.summary}
        </Text>
      )}

      <Divider />

      <div
        className="rte-content"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />

      {attachments.length > 0 && (
        <>
          <Divider />
          <Stack gap="xs">
            <Text fw={500}>Attachments</Text>
            {attachments.map((att) => (
              <Text
                key={att.id}
                component="a"
                href={att.url}
                target="_blank"
                rel="noreferrer"
              >
                {att.name}
              </Text>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}

export default ArticlePreview;
