import type { AppConfig } from "./configuration";

import configuration from "./configuration";

let cached: AppConfig | null = null;

/**
 * Reads the validated config lazily so schema files (which are instantiated by
 * the Nest CLI at decoration time) can access env-derived values like bcrypt
 * rounds without injecting the ConfigService.
 */
export function appConfig(): AppConfig {
  if (!cached) {
    cached = configuration();
  }
  return cached;
}
