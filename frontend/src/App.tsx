import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Badge,
  Button,
  Container,
  Group,
  Loader,
  NavLink,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import ArticleEditor from "./pages/ArticleEditor.tsx";
import ArticleList from "./pages/ArticleList.tsx";
import Login from "./pages/Login.tsx";
import {
  createArticle,
  deleteArticle,
  listArticles,
  updateArticle,
} from "./services/news.ts";
import { NEWS_EVENT_TYPE, type Article, type NewsEvent } from "./types.ts";

type RouteName = "articles" | "editor";
type RouteParams = { article?: Article };
type Route = { name: RouteName; params?: RouteParams };

const navItems: { label: string; route: RouteName }[] = [
  { label: "Articles", route: "articles" },
  { label: "New article", route: "editor" },
];

function Root() {
  const { user, loading, logout } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [route, setRoute] = useState<Route>({ name: "articles" });

  const navigate = (name: RouteName, params?: RouteParams) =>
    setRoute({ name, params });

  const handleSave = async (article: Article) => {
    const exists = articles.some((item) => item.id === article.id);
    const payload = {
      title: article.title,
      body: article.body,
      summary: article.summary,
      category: article.category,
      attachments: article.attachments,
    };

    try {
      if (exists) {
        const updated = await updateArticle(article.id, payload);
        setArticles((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await createArticle(payload);
        setArticles((prev) => [created, ...prev]);
      }
      navigate("articles");
    } catch (err) {
      notifications.show({
        title: "Save failed",
        message: err instanceof Error ? err.message : "Something went wrong",
        color: "red",
      });
    }
  };

  const handleDelete = async (article: Article) => {
    if (!window.confirm(`Delete "${article.title}"?`)) return;

    try {
      await deleteArticle(article.id);
      setArticles((prev) => prev.filter((item) => item.id !== article.id));
    } catch (err) {
      notifications.show({
        title: "Delete failed",
        message: err instanceof Error ? err.message : "Something went wrong",
        color: "red",
      });
    }
  };

  const refresh = useCallback(async () => {
    try {
      const items = await listArticles();
      setArticles(items);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    void refresh();
  }, [user, refresh]);

  if (loading) {
    return (
      <Group justify="center" mt="xl">
        <Loader />
      </Group>
    );
  }

  if (!user) {
    return <Login />;
  }

  const routes: Record<RouteName, ReactNode> = {
    articles: (
      <ArticleList
        articles={articles}
        onEdit={(article) => navigate("editor", { article })}
        onDelete={handleDelete}
        onCreate={() => navigate("editor")}
      />
    ),
    editor: (
      <ArticleEditor
        article={route.params?.article}
        onSave={handleSave}
        onCancel={() => navigate("articles")}
      />
    ),
  };

  const statusColor =
    status === "connected"
      ? "green"
      : status === "connecting"
        ? "yellow"
        : status === "error"
          ? "red"
          : "gray";

  return (
    <Container size="md" p="md">
      <Stack>
        <Group justify="space-between">
          <Group gap="xs">
            {navItems.map((item) => (
              <NavLink
                key={item.route}
                label={item.label}
                active={route.name === item.route}
                onClick={() => navigate(item.route)}
              />
            ))}
          </Group>
          <Group gap="sm">
            <Badge color={statusColor} variant="light">
              {status}
            </Badge>
            <Button variant="default" onClick={() => void logout()}>
              Sign out
            </Button>
          </Group>
        </Group>

        {routes[route.name]}
      </Stack>
    </Container>
  );
}

function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

export default App;
