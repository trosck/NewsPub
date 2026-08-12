import { useState } from "react";
import {
  Alert,
  Button,
  Paper,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useAuth } from "../context/AuthContext.tsx";

type Mode = "login" | "register";

function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack align="center" pt="xl">
      <Paper withBorder shadow="md" p="xl" w={{ base: 380 }}>
        <Stack gap="md">
          <Title order={2}>
            {mode === "login" ? "Sign in" : "Create account"}
          </Title>

          <SegmentedControl
            fullWidth
            value={mode}
            onChange={(value) => setMode(value as Mode)}
            data={[
              { label: "Sign in", value: "login" },
              { label: "Register", value: "register" },
            ]}
          />

          {mode === "register" && (
            <TextInput
              label="Name"
              placeholder="Your name"
              required
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          )}

          <TextInput
            label="Email"
            placeholder="you@example.com"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />

          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <Button fullWidth loading={submitting} onClick={handleSubmit}>
            {mode === "login" ? "Sign in" : "Register"}
          </Button>

          <Text c="dimmed" size="sm" ta="center">
            News updates arrive live over WebSocket once signed in.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default Login;
