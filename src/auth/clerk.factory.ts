import { createClerkClient } from "@clerk/backend";
import { ConfigService } from "@nestjs/config";
import { EnvConfig } from "src/config/env.config";

export const ClerkClientFactory = (configService: ConfigService<EnvConfig>) => {
  return createClerkClient({
    publishableKey: configService.get("CLERK_PUBLISHABLE_KEY"),
    secretKey: configService.get("CLERK_SECRET_KEY"),
  });
};