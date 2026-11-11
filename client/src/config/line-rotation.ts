export const LINE_ROTATION_INTERVAL_MS = 20_000;
export const ASSEMBLY_ROTATION_INTERVAL_MS = 20_000;

export const ROTATING_LINE_CODES: string[] = ['F11-FINISHING', 'ASSEMBLY'];

export const isRotatingLine = (code: string): boolean =>
  ROTATING_LINE_CODES.includes(code);

export const getLineRotationIntervalMs = (code: string): number =>
  code === 'ASSEMBLY' ? ASSEMBLY_ROTATION_INTERVAL_MS : LINE_ROTATION_INTERVAL_MS;
