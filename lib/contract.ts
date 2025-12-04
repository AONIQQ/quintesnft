import { QuintesABI } from "./abi";

export const QUINTES_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`;

export { QuintesABI };
