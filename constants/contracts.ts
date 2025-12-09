import { ethers } from "ethers";
import DynamicFeeManager from "./ABIs/DynamicFeeManager.json";
import FeeCalculator from "./ABIs/FeeCalculator.json";
import FHEConfigManager from "./ABIs/FHEConfigManager.json";
import HookSwapRouter from "./ABIs/HookSwapRouter.json";
import JITCoordinator from "./ABIs/JITCoordinator.json";
import LPPositionManager from "./ABIs/LPPositionManager.json";
import ProfitManager from "./ABIs/ProfitManager.json";
import Token from "./ABIs/Token.json";
import ZKJITLiquidityHook from "./ABIs/ZKJITLiquidityHook.json";

export const getFeeManagerContract = (providerOrSigner: ethers.Provider | ethers.Signer) =>
  new ethers.Contract(
    process.env.FEE_MANAGER as string,
    DynamicFeeManager,
    providerOrSigner
  );

export const getFeeCalculatorContract = (providerOrSigner: ethers.Provider | ethers.Signer) => 
    new ethers.Contract(
        process.env.FEE_CALCULATOR as string,
        FeeCalculator,
        providerOrSigner
    );

export const getConfigManagerContract = (providerOrSigner: ethers.Provider | ethers.Signer) => 
    new ethers.Contract(
        process.env.CONFIG_MANAGER as string,
        FHEConfigManager,
        providerOrSigner
    );

export const getHookSwapRouterContract = (providerOrSigner: ethers.Provider | ethers.Signer) => 
    new ethers.Contract(
        process.env.HOOK_SWAP_ROUTER as string,
        HookSwapRouter,
        providerOrSigner
    );

export const getJITCoordinatorContract = (providerOrSigner: ethers.Provider | ethers.Signer) => 
    new ethers.Contract(
        process.env.JIT_COORDINATOR as string,
        JITCoordinator,
        providerOrSigner
    );

export const getPositionManagerContract = (providerOrSigner: ethers.Provider | ethers.Signer) =>
    new ethers.Contract(
        process.env.POSITION_MANAGER as string,
        LPPositionManager,
        providerOrSigner
    );

export const getProfitManagerContract = (providerOrSigner: ethers.Provider | ethers.Signer) =>
    new ethers.Contract(
        process.env.PROFIT_MANAGER as string,
        ProfitManager,
        providerOrSigner
    );

export const getTokenContract = (providerOrSigner: ethers.Provider | ethers.Signer) =>
    new ethers.Contract(
        process.env.TOKEN_ADDRESS as string,
        Token,
        providerOrSigner
    );

export const getHookContract = (providerOrSigner: ethers.Provider | ethers.Signer) =>
    new ethers.Contract(
        process.env.HOOK as string,
        ZKJITLiquidityHook,
        providerOrSigner
    );
