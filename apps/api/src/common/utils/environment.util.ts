export function isProductionEnv(nodeEnv: string | undefined): boolean {
  return nodeEnv === 'production' || nodeEnv === 'staging';
}
