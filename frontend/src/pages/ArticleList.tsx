import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { Article } from "../types.ts";

interface ArticleListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onCreate: () => void;
}

function ArticleList({
  articles,
  onEdit,
  onDelete,
  onCreate,
}: ArticleListProps) {
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Articles</Title>
        <Button onClick={onCreate}>New article</Button>
      </Group>

      {articles.length === 0 ? (
        <Text c="dimmed">No articles yet. Create one to get started.</Text>
      ) : (
        <Stack>
          {articles.map((article) => (
            <Paper key={article.id} p="md" withBorder shadow="xs">
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                  <Group gap="xs" align="center">
                    <Title order={4}>{article.title}</Title>
                    {article.category && (
                      <Badge variant="light">{article.category}</Badge>
                    )}
                  </Group>
                  {article.summary && (
                    <Text lineClamp={2} c="dimmed">
                      {article.summary}
                    </Text>
                  )}
                </Stack>
                <Group gap="xs">
                  <Button variant="default" onClick={() => onEdit(article)}>
                    Edit
                  </Button>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    aria-label="Delete article"
                    onClick={() => onDelete(article)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default ArticleList;
