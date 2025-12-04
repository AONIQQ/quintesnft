import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { whitelist } from "./whitelist";

// Construct the Merkle Tree
const leafNodes = whitelist.map((addr) => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

export const getMerkleRoot = () => {
    return merkleTree.getHexRoot();
};

export const getMerkleProof = (address: string) => {
    const leaf = keccak256(address);
    return merkleTree.getHexProof(leaf);
};

export const isWhitelisted = (address: string) => {
    const leaf = keccak256(address);
    const proof = merkleTree.getHexProof(leaf);
    return merkleTree.verify(proof, leaf, merkleTree.getRoot());
};
