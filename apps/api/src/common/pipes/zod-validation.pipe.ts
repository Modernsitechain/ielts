import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";
import { z } from "zod";

/**
 * Validates and parses request input with a Zod schema.
 * Usage: `@Body(new ZodValidationPipe(schema)) body: z.infer<typeof schema>`.
 */
@Injectable()
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<unknown, z.infer<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: z.flattenError(result.error),
      });
    }
    return result.data;
  }
}
