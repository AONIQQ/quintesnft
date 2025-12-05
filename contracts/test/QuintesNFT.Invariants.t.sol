// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";

import {QuintesNFT} from "../src/QuintesNFT.sol";

contract MintHandler is Test {
    QuintesNFT public nft;
    address public owner;
    address[] public actors;

    constructor(QuintesNFT _nft, address _owner) {
        nft = _nft;
        owner = _owner;
    }

    function addActor(address actor) external {
        actors.push(actor);
    }

    function mintGtd(uint256 actorIndex) external {
        if (actors.length == 0) return;
        address user = actors[actorIndex % actors.length];

        vm.startPrank(owner);
        nft.setGtdMerkleRoot(keccak256(abi.encodePacked(user)));
        nft.setGtdPhaseActive(true);
        nft.setPaused(false);
        nft.setPrice(0);
        vm.stopPrank();

        if (nft.hasMinted(user)) return;

        vm.deal(user, 1 ether);
        vm.prank(user);
        try nft.mintGTD(_emptyProof()) {} catch {}
    }

    function mintFcfs(uint256 actorIndex) external {
        if (actors.length == 0) return;
        address user = actors[actorIndex % actors.length];

        vm.startPrank(owner);
        nft.setFcfsPhaseActive(true);
        nft.setGtdPhaseActive(false);
        nft.setPaused(false);
        nft.setPrice(0);
        vm.stopPrank();

        if (nft.hasMinted(user)) return;

        vm.deal(user, 1 ether);
        vm.prank(user);
        try nft.mintFCFS() {} catch {}
    }

    function airdrop(uint256 actorIndex) external {
        if (actors.length == 0) return;
        address user = actors[actorIndex % actors.length];
        address[] memory list = new address[](1);
        list[0] = user;

        vm.startPrank(owner);
        try nft.airdropGTD(list) {} catch {}
        vm.stopPrank();
    }

    function ownerMint(uint256 quantity) external {
        uint256 qty = bound(quantity, 1, 3);
        vm.startPrank(owner);
        try nft.ownerMint(owner, qty) {} catch {}
        vm.stopPrank();
    }

    function actorsLength() external view returns (uint256) {
        return actors.length;
    }

    function actorAt(uint256 idx) external view returns (address) {
        return actors[idx];
    }

    function _emptyProof() internal pure returns (bytes32[] memory proof) {
        proof = new bytes32[](0);
    }
}

contract QuintesNFTInvariants is StdInvariant, Test {
    QuintesNFT internal nft;
    MintHandler internal handler;
    address internal ownerWallet;

    function setUp() public {
        nft = new QuintesNFT();
        ownerWallet = address(this);
        handler = new MintHandler(nft, ownerWallet);

        for (uint256 i = 0; i < 6; i++) {
            handler.addActor(makeAddr(string(abi.encodePacked("actor", vm.toString(i)))));
        }

        targetContract(address(handler));
    }

    function invariant_totalSupplyNeverExceedsMaxSupply() public view {
        assertLe(nft.totalSupply(), nft.maxSupply());
    }

    function invariant_hasMintedImpliesBalanceGreaterThanZero() public view {
        uint256 len = handler.actorsLength();
        for (uint256 i = 0; i < len; i++) {
            address actor = handler.actorAt(i);
            if (nft.hasMinted(actor)) {
                assertGt(nft.balanceOf(actor), 0);
            }
        }
    }

    function invariant_contractBalanceNeverNegative() public view {
        assertGe(address(nft).balance, 0);
    }
}

