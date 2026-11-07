import { Global, Module } from "@nestjs/common";
import { AppLogger, LOG_SINK } from "./logger";

@Global()
@Module({
  providers: [AppLogger, { provide: LOG_SINK, useValue: (line: string) => process.stdout.write(line + "\n") }],
  exports: [AppLogger, LOG_SINK],
})
export class ObservabilityModule {}
