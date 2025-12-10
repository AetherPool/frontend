// import { getContract } from "thirdweb";
// import { useActiveWalletChain } from "thirdweb/react";
// import DynamicFeeManager from "./ABIs/DynamicFeeManager.json";
// import FeeCalculator from "./ABIs/FeeCalculator.json";
// import FHEConfigManager from "./ABIs/FHEConfigManager.json";
// import HookSwapRouter from "./ABIs/HookSwapRouter.json";
// import JITCoordinator from "./ABIs/JITCoordinator.json";
// import LPPositionManager from "./ABIs/LPPositionManager.json";
// import ProfitManager from "./ABIs/ProfitManager.json";
// import Token from "./ABIs/Token.json";
// import ZKJITLiquidityHook from "./ABIs/ZKJITLiquidityHook.json";
// import { client } from "./client";
// import { Abi } from "viem";
// import { defineChain } from "thirdweb/chains";

// export const useThirdwebContracts = () => {
//   const chain = useActiveWalletChain();
//   const TOKEN_ABI = Token as Abi;
//   const DYNAMIC_FEE_MANAGER_ABI = DynamicFeeManager as Abi;
//   const FEE_CALCULATOR_ABI = FeeCalculator as Abi;
//   const FHE_CONFIG_MANAGER_ABI = FHEConfigManager as Abi;
//   const HOOK_SWAP_ROUTER_ABI = HookSwapRouter as Abi;
//   const JIT_COORDINATOR_ABI = JITCoordinator as Abi;
//   const LP_POSITION_MANAGER_ABI = LPPositionManager as Abi;
//   const PROFIT_MANAGER_ABI = ProfitManager as Abi;
//   const ZK_JIT_LIQUIDITY_HOOK_ABI = ZKJITLiquidityHook as Abi;

//   const activeChain =
//     chain ||
//     defineChain({
//       id: 84532,
//       rpc: process.env.RPC_URL,
//     });

//   return {
//     chain: activeChain,
//     hasActiveChain: !!chain,
//     getFYNTokenContract: getContract({
//       address: process.env.FYN_TOKEN as string,
//       chain: activeChain,
//       client,
//       abi: TOKEN_ABI,
//     }),
//     getQRTTokenContract: getContract({
//       address: process.env.QRT_TOKEN as string,
//       chain: activeChain,
//       client,
//       abi: TOKEN_ABI,
//     }),
//     getFeeManagerContract: getContract({
//       address: process.env.FEE_MANAGER as string,
//       chain: activeChain,
//       client,
//       abi: DYNAMIC_FEE_MANAGER_ABI,
//     }),
//     getFeeCalculatorContract: getContract({
//       address: process.env.FEE_CALCULATOR as string,
//       chain: activeChain,
//       client,
//       abi: FEE_CALCULATOR_ABI,
//     }),
//     getConfigManagerContract: getContract({
//       address: process.env.CONFIG_MANAGER as string,
//       chain: activeChain,
//       client,
//       abi: FHE_CONFIG_MANAGER_ABI,
//     }),
//     getHookSwapRouterContract: getContract({
//       address: process.env.HOOK_SWAP_ROUTER as string,
//       chain: activeChain,
//       client,
//       abi: HOOK_SWAP_ROUTER_ABI,
//     }),
//     getJITCoordinatorContract: getContract({
//       address: process.env.JIT_COORDINATOR as string,
//       chain: activeChain,
//       client,
//       abi: JIT_COORDINATOR_ABI,
//     }),
//     getPositionManagerContract: getContract({
//       address: process.env.POSITION_MANAGER as string,
//       chain: activeChain,
//       client,
//       abi: LP_POSITION_MANAGER_ABI,
//     }),
//     getProfitManagerContract: getContract({
//       address: process.env.PROFIT_MANAGER as string,
//       chain: activeChain,
//       client,
//       abi: PROFIT_MANAGER_ABI,
//     }),
//     getHookContract: getContract({
//       address: process.env.HOOK as string,
//       chain: activeChain,
//       client,
//       abi: ZK_JIT_LIQUIDITY_HOOK_ABI,
//     }),
//   };
// };
