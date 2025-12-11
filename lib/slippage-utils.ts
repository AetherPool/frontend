/**
 * Slippage Calculation Utilities
 * Frontend implementation matching SlippageLib.sol logic
 */

const BPS_DIVISOR = 10000;
const PRICE_SCALE = 1e18;

/**
 * Calculate expected output for exact input swap
 * @param amountIn Input amount
 * @param priceRatio Current price ratio (scaled by 1e18)
 * @param zeroForOne Direction of swap (true = token0->token1)
 * @returns Expected output amount before slippage
 */
export function calculateExpectedOutput(
  amountIn: number,
  priceRatio: number,
  zeroForOne: boolean
): number {
  if (zeroForOne) {
    // token0 -> token1: multiply by price ratio
    return (amountIn * priceRatio) / PRICE_SCALE;
  } else {
    // token1 -> token0: divide by price ratio
    return (amountIn * PRICE_SCALE) / priceRatio;
  }
}

/**
 * Apply slippage tolerance to expected output
 * @param expectedOut Expected output without slippage
 * @param slippageBps Slippage tolerance in basis points (100 = 1%)
 * @returns Minimum acceptable output
 */
export function applySlippageToOutput(
  expectedOut: number,
  slippageBps: number
): number {
  return (expectedOut * (BPS_DIVISOR - slippageBps)) / BPS_DIVISOR;
}

/**
 * Calculate minimum output with slippage protection (one-step convenience)
 * @param amountIn Input amount
 * @param priceRatio Current price ratio (scaled by 1e18)
 * @param zeroForOne Direction of swap
 * @param slippageBps Slippage tolerance in basis points (100 = 1%)
 * @returns Minimum acceptable output
 */
export function calculateMinOutput(
  amountIn: number,
  priceRatio: number,
  zeroForOne: boolean,
  slippageBps: number
): number {
  const expectedOut = calculateExpectedOutput(amountIn, priceRatio, zeroForOne);
  return applySlippageToOutput(expectedOut, slippageBps);
}

/**
 * Calculate expected input for exact output swap
 * @param amountOut Output amount desired
 * @param priceRatio Current price ratio (scaled by 1e18)
 * @param zeroForOne Direction of swap
 * @returns Expected input amount before slippage
 */
export function calculateExpectedInput(
  amountOut: number,
  priceRatio: number,
  zeroForOne: boolean
): number {
  if (zeroForOne) {
    // token0 -> token1: divide by price ratio
    return (amountOut * PRICE_SCALE) / priceRatio;
  } else {
    // token1 -> token0: multiply by price ratio
    return (amountOut * priceRatio) / PRICE_SCALE;
  }
}

/**
 * Apply slippage tolerance to expected input
 * @param expectedIn Expected input without slippage
 * @param slippageBps Slippage tolerance in basis points (100 = 1%)
 * @returns Maximum acceptable input
 */
export function applySlippageToInput(
  expectedIn: number,
  slippageBps: number
): number {
  return (expectedIn * (BPS_DIVISOR + slippageBps)) / BPS_DIVISOR;
}

/**
 * Calculate maximum input with slippage protection (one-step convenience)
 * @param amountOut Output amount desired
 * @param priceRatio Current price ratio (scaled by 1e18)
 * @param zeroForOne Direction of swap
 * @param slippageBps Slippage tolerance in basis points
 * @returns Maximum acceptable input
 */
export function calculateMaxInput(
  amountOut: number,
  priceRatio: number,
  zeroForOne: boolean,
  slippageBps: number
): number {
  const expectedIn = calculateExpectedInput(amountOut, priceRatio, zeroForOne);
  return applySlippageToInput(expectedIn, slippageBps);
}

/**
 * Calculate actual slippage that occurred in a swap
 * @param expected Expected amount
 * @param actual Actual amount received
 * @returns Actual slippage in basis points
 */
export function calculateActualSlippage(
  expected: number,
  actual: number
): number {
  if (actual >= expected) return 0;

  const slippageAmount = expected - actual;
  return (slippageAmount * BPS_DIVISOR) / expected;
}

/**
 * Convert slippage percentage to basis points
 * @param slippagePercent Slippage as percentage (e.g., 1 for 1%)
 * @returns Slippage in basis points (e.g., 100 for 1%)
 */
export function percentToBps(slippagePercent: number): number {
  return slippagePercent * 100;
}

/**
 * Convert basis points to percentage
 * @param slippageBps Slippage in basis points (e.g., 100 for 1%)
 * @returns Slippage as percentage (e.g., 1 for 1%)
 */
export function bpsToPercent(slippageBps: number): number {
  return slippageBps / 100;
}

/**
 * Calculate price impact percentage
 * @param amountIn Input amount
 * @param expectedOut Expected output (using current price)
 * @param actualOut Actual output after AMM calculation
 * @returns Price impact as percentage
 */
export function calculatePriceImpact(
  amountIn: number,
  expectedOut: number,
  actualOut: number
): number {
  if (expectedOut === 0) return 0;

  const impact = ((expectedOut - actualOut) / expectedOut) * 100;
  return Math.max(0, impact); // Ensure non-negative
}

/**
 * Determine swap direction based on token addresses
 * @param tokenIn Address of input token
 * @param tokenOut Address of output token
 * @param currency0 Address of token0 in pool
 * @returns true if swapping token0 for token1, false otherwise
 */
export function determineSwapDirection(
  tokenIn: string,
  tokenOut: string,
  currency0: string
): boolean {
  return tokenIn.toLowerCase() === currency0.toLowerCase();
}
