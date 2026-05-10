import { BadRequestError } from "@/lib/utils/errors";

export function getParam(
  params: Record<string, string>,
  key: string
): string {
  const value = params[key];
  if (!value) {
    throw new BadRequestError(`Missing required parameter: ${key}`);
  }
  return value;
}
