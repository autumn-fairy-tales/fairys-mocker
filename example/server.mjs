import express from "express";
import { createRsbuild, loadConfig } from "@rsbuild/core";
import { fairysMockerExpress } from "@fairys/mocker-cli"

export async function startDevServer() {
  const { content } = await loadConfig({});

  // Init Rsbuild
  const rsbuild = await createRsbuild({
    rsbuildConfig: content,
  });

  const app = fairysMockerExpress.createApp();

  // Create Rsbuild DevServer instance
  const rsbuildServer = await rsbuild.createDevServer();

  // Apply Rsbuild’s built-in middlewares
  app.use(rsbuildServer.middlewares);

  const httpServer = await fairysMockerExpress.listen(rsbuildServer.port, () => {
    // Notify Rsbuild that the custom server has started
    rsbuildServer.afterListen();
  });

  rsbuildServer.connectWebSocket({ server: httpServer });

  return {
    close: async () => {
      await rsbuildServer.close();
      fairysMockerExpress.base.server.close();
    },
  };
}

startDevServer();