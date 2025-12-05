// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";

import {QuintesNFT} from "../src/QuintesNFT.sol";

contract QuintesNFTTest is Test {
    QuintesNFT internal nft;
    address internal ownerWallet;

    function setUp() public {
        nft = new QuintesNFT();
        ownerWallet = makeAddr("owner");
        nft.transferOwnership(ownerWallet);
    }

    function testGtdMintValidProofSucceeds() public {
        address user = makeAddr("gtdUser");
        _allowlist(user);
        _setGtdPhaseActive(true);

        vm.deal(user, 1 ether);
        vm.prank(user);
        nft.mintGTD(_singleLeafProof());

        assertEq(nft.balanceOf(user), 1);
        assertTrue(nft.hasMinted(user));
        assertTrue(nft.gtdMinted(user));
    }

    function testGtdMintRequiresGtdPhaseActive() public {
        address user = makeAddr("noPhase");
        _allowlist(user);

        vm.deal(user, 1 ether);
        vm.startPrank(user);
        vm.expectRevert(bytes("GTD phase not active"));
        nft.mintGTD(_singleLeafProof());
        vm.stopPrank();
    }

    function testGtdMintRevertsWhenPaused() public {
        address user = makeAddr("pausedUser");
        _allowlist(user);
        _setGtdPhaseActive(true);
        _setPaused(true);

        vm.deal(user, 1 ether);
        vm.startPrank(user);
        vm.expectRevert(bytes("Contract is paused"));
        nft.mintGTD(_singleLeafProof());
        vm.stopPrank();
    }

    function testFcfsMintRevertsWhenPaused() public {
        address user = makeAddr("pausedFcfs");
        _setFcfsPhaseActive(true);
        _setPaused(true);

        vm.deal(user, 1 ether);
        vm.startPrank(user);
        vm.expectRevert(bytes("Contract is paused"));
        nft.mintFCFS();
        vm.stopPrank();
    }

    function testFcfsMintRequiresFcfsPhaseActive() public {
        address user = makeAddr("fcfsInactive");

        vm.deal(user, 1 ether);
        vm.startPrank(user);
        vm.expectRevert(bytes("FCFS phase not active"));
        nft.mintFCFS();
        vm.stopPrank();
    }

    function testCannotExceedMaxSupplyOwnerMint() public {
        _setMaxSupply(1);

        vm.startPrank(ownerWallet);
        vm.expectRevert(bytes("Max supply exceeded"));
        nft.ownerMint(ownerWallet, 2);
        vm.stopPrank();
    }

    function testCannotExceedMaxSupplyGtdMint() public {
        address first = makeAddr("first");
        address second = makeAddr("second");

        _setMaxSupply(1);
        _allowlist(first);
        _setGtdPhaseActive(true);

        vm.deal(first, 1 ether);
        vm.prank(first);
        nft.mintGTD(_singleLeafProof());

        _allowlist(second);
        vm.deal(second, 1 ether);
        vm.startPrank(second);
        vm.expectRevert(bytes("Max supply exceeded"));
        nft.mintGTD(_singleLeafProof());
        vm.stopPrank();
    }

    function testCannotExceedMaxSupplyFcfsMint() public {
        address first = makeAddr("fcfsFirst");
        address second = makeAddr("fcfsSecond");

        _setMaxSupply(1);
        _setFcfsPhaseActive(true);

        vm.deal(first, 1 ether);
        vm.prank(first);
        nft.mintFCFS();

        vm.deal(second, 1 ether);
        vm.startPrank(second);
        vm.expectRevert(bytes("Max supply exceeded"));
        nft.mintFCFS();
        vm.stopPrank();
    }

    function testCannotExceedMaxSupplyAirdrop() public {
        address[] memory recipients = new address[](2);
        recipients[0] = makeAddr("drop1");
        recipients[1] = makeAddr("drop2");

        _setMaxSupply(1);

        vm.startPrank(ownerWallet);
        vm.expectRevert(bytes("Max supply exceeded"));
        nft.airdropGTD(recipients);
        vm.stopPrank();
    }

    function testAirdropSetsGtdMintedAndHasMinted() public {
        address[] memory recipients = new address[](2);
        recipients[0] = makeAddr("airdroppedA");
        recipients[1] = makeAddr("airdroppedB");

        _airdrop(recipients);

        assertTrue(nft.hasMinted(recipients[0]));
        assertTrue(nft.gtdMinted(recipients[0]));
        assertEq(nft.balanceOf(recipients[0]), 1);

        assertTrue(nft.hasMinted(recipients[1]));
        assertTrue(nft.gtdMinted(recipients[1]));
        assertEq(nft.balanceOf(recipients[1]), 1);
    }

    function testAirdropRevertsIfRecipientAlreadyMinted() public {
        address recipient = makeAddr("repeatRecipient");
        address[] memory firstBatch = new address[](1);
        firstBatch[0] = recipient;
        _airdrop(firstBatch);

        address[] memory secondBatch = new address[](1);
        secondBatch[0] = recipient;

        vm.startPrank(ownerWallet);
        vm.expectRevert(bytes("Recipient already minted"));
        nft.airdropGTD(secondBatch);
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetGtdPhaseActive() public {
        address stranger = makeAddr("stranger");

        vm.startPrank(stranger);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        nft.setGtdPhaseActive(true);
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetFcfsPhaseActive() public {
        address stranger = makeAddr("strangerFcfs");
        vm.startPrank(stranger);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        nft.setFcfsPhaseActive(true);
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetPrice() public {
        address stranger = makeAddr("strangerPrice");
        vm.startPrank(stranger);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        nft.setPrice(1 ether);
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetMaxSupply() public {
        address stranger = makeAddr("strangerMax");
        vm.startPrank(stranger);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        nft.setMaxSupply(2000);
        vm.stopPrank();
    }

    function testOnlyOwnerCanOwnerMint() public {
        address stranger = makeAddr("strangerMint");
        vm.startPrank(stranger);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        nft.ownerMint(stranger, 1);
        vm.stopPrank();
    }

    function testOnlyOwnerCanAirdrop() public {
        address stranger = makeAddr("strangerAirdrop");
        address[] memory list = new address[](1);
        list[0] = makeAddr("recipient");

        vm.startPrank(stranger);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        nft.airdropGTD(list);
        vm.stopPrank();
    }

    function testOnlyOwnerCanWithdraw() public {
        address stranger = makeAddr("strangerWithdraw");
        vm.deal(address(nft), 1 ether);

        vm.startPrank(stranger);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        nft.withdraw();
        vm.stopPrank();
    }

    function testGtdMintRequiresExactPrice() public {
        address user = makeAddr("pricedGtd");
        uint256 mintPrice = 0.1 ether;

        _allowlist(user);
        _setGtdPhaseActive(true);
        _setPrice(mintPrice);

        vm.deal(user, 1 ether);
        vm.startPrank(user);
        vm.expectRevert(bytes("Incorrect ETH amount"));
        nft.mintGTD(_singleLeafProof());
        vm.stopPrank();
    }

    function testFcfsMintRequiresExactPrice() public {
        address user = makeAddr("pricedFcfs");
        uint256 mintPrice = 0.05 ether;

        _setFcfsPhaseActive(true);
        _setPrice(mintPrice);

        vm.deal(user, 1 ether);
        vm.startPrank(user);
        vm.expectRevert(bytes("Incorrect ETH amount"));
        nft.mintFCFS();
        vm.stopPrank();
    }

    function testGtdMintCannotMintTwice() public {
        address user = makeAddr("gtdTwice");
        _allowlist(user);
        _setGtdPhaseActive(true);

        vm.deal(user, 1 ether);
        vm.prank(user);
        nft.mintGTD(_singleLeafProof());

        vm.startPrank(user);
        vm.expectRevert(bytes("Wallet already minted"));
        nft.mintGTD(_singleLeafProof());
        vm.stopPrank();
    }

    function testFcfsMintCannotMintTwice() public {
        address user = makeAddr("fcfsTwice");
        _setFcfsPhaseActive(true);

        vm.deal(user, 1 ether);
        vm.prank(user);
        nft.mintFCFS();

        vm.startPrank(user);
        vm.expectRevert(bytes("Wallet already minted"));
        nft.mintFCFS();
        vm.stopPrank();
    }

    function testGtdMintInvalidProofReverts() public {
        address allowlisted = makeAddr("allow");
        address attacker = makeAddr("attacker");

        _allowlist(allowlisted);
        _setGtdPhaseActive(true);

        vm.deal(attacker, 1 ether);
        vm.startPrank(attacker);
        vm.expectRevert(bytes("Not in GTD allowlist"));
        nft.mintGTD(_singleLeafProof());
        vm.stopPrank();
    }

    function testWithdrawSendsFullBalanceToOwner() public {
        uint256 fundingAmount = 1 ether;
        vm.deal(address(nft), fundingAmount);

        uint256 ownerBalanceBefore = ownerWallet.balance;

        vm.prank(ownerWallet);
        nft.withdraw();

        assertEq(ownerWallet.balance, ownerBalanceBefore + fundingAmount);
        assertEq(address(nft).balance, 0);
    }

    function testGtdMinterCannotMintFcfs() public {
        address user = makeAddr("gtdThenFcfs");
        _allowlist(user);
        _setGtdPhaseActive(true);

        vm.deal(user, 1 ether);
        vm.prank(user);
        nft.mintGTD(_singleLeafProof());

        _setGtdPhaseActive(false);
        _setFcfsPhaseActive(true);

        vm.startPrank(user);
        vm.expectRevert(bytes("Wallet already minted"));
        nft.mintFCFS();
        vm.stopPrank();
    }

    function testFcfsMinterCannotMintGtd() public {
        address user = makeAddr("fcfsThenGtd");
        _setFcfsPhaseActive(true);

        vm.deal(user, 1 ether);
        vm.prank(user);
        nft.mintFCFS();

        _setFcfsPhaseActive(false);
        _allowlist(user);
        _setGtdPhaseActive(true);

        vm.startPrank(user);
        vm.expectRevert(bytes("Wallet already minted"));
        nft.mintGTD(_singleLeafProof());
        vm.stopPrank();
    }

    function testAirdropRecipientCannotMintGtdOrFcfs() public {
        address recipient = makeAddr("airdropThenUser");
        address[] memory list = new address[](1);
        list[0] = recipient;
        _airdrop(list);

        _allowlist(recipient);
        _setGtdPhaseActive(true);
        vm.startPrank(recipient);
        vm.expectRevert(bytes("Wallet already minted"));
        nft.mintGTD(_singleLeafProof());
        vm.stopPrank();

        _setGtdPhaseActive(false);
        _setFcfsPhaseActive(true);
        vm.startPrank(recipient);
        vm.expectRevert(bytes("Wallet already minted"));
        nft.mintFCFS();
        vm.stopPrank();
    }

    function testOwnerMintDoesNotSetHasMinted() public {
        address treasury = makeAddr("treasury");
        vm.startPrank(ownerWallet);
        nft.ownerMint(treasury, 3);
        vm.stopPrank();

        assertEq(nft.balanceOf(treasury), 3);
        assertFalse(nft.hasMinted(treasury));
    }

    function testSetMaxSupplyCannotGoBelowMinted() public {
        vm.prank(ownerWallet);
        nft.ownerMint(ownerWallet, 1);

        vm.startPrank(ownerWallet);
        vm.expectRevert(bytes("New maxSupply < minted"));
        nft.setMaxSupply(0);
        vm.stopPrank();
    }

    function testAirdropRevertsOnEmptyArray() public {
        address[] memory recipients = new address[](0);
        vm.startPrank(ownerWallet);
        vm.expectRevert(bytes("No recipients"));
        nft.airdropGTD(recipients);
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetPausedAndRevealed() public {
        address stranger = makeAddr("stranger2");
        vm.startPrank(stranger);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        nft.setPaused(true);
        vm.stopPrank();

        vm.startPrank(stranger);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        nft.setRevealed(true);
        vm.stopPrank();
    }

    function testTokenUriBeforeAndAfterReveal() public {
        vm.startPrank(ownerWallet);
        nft.ownerMint(ownerWallet, 1);
        nft.setUriPrefix("ipfs://base/");
        nft.setUriSuffix(".json");
        nft.setPreRevealMetadataUri("ipfs://prereveal.json");
        vm.stopPrank();

        uint256 tokenId = nft.walletOfOwner(ownerWallet)[0];

        assertEq(nft.tokenURI(tokenId), "ipfs://prereveal.json");

        vm.prank(ownerWallet);
        nft.setRevealed(true);

        string memory expected = string(abi.encodePacked("ipfs://base/", vm.toString(tokenId), ".json"));
        assertEq(nft.tokenURI(tokenId), expected);
    }

    function testTokenUriNonexistentTokenReverts() public {
        vm.expectRevert(bytes("URI query for nonexistent token"));
        nft.tokenURI(999);
    }

    function testHappyPathLifecycle() public {
        address gtdUser = makeAddr("happyGtd");
        address fcfsUser = makeAddr("happyFcfs");
        address[] memory airdrops = new address[](2);
        airdrops[0] = makeAddr("happyDrop1");
        airdrops[1] = makeAddr("happyDrop2");

        // Configure allowlist and phases
        _allowlist(gtdUser);
        _setGtdPhaseActive(true);
        _setPaused(false);

        // GTD mint
        vm.deal(gtdUser, 1 ether);
        vm.prank(gtdUser);
        nft.mintGTD(_singleLeafProof());

        // Airdrop GTD
        _airdrop(airdrops);

        // Switch to FCFS and mint
        _setGtdPhaseActive(false);
        _setFcfsPhaseActive(true);
        vm.deal(fcfsUser, 1 ether);
        vm.prank(fcfsUser);
        nft.mintFCFS();

        // Set metadata and reveal
        vm.startPrank(ownerWallet);
        nft.setUriPrefix("ipfs://base/");
        nft.setUriSuffix(".json");
        nft.setPreRevealMetadataUri("ipfs://prereveal.json");
        nft.setRevealed(true);
        vm.stopPrank();

        // Withdraw (balance likely zero but should not revert)
        vm.prank(ownerWallet);
        nft.withdraw();

        assertEq(nft.balanceOf(gtdUser), 1);
        assertEq(nft.balanceOf(fcfsUser), 1);
        assertEq(nft.balanceOf(airdrops[0]), 1);
        assertEq(nft.balanceOf(airdrops[1]), 1);
        assertTrue(nft.hasMinted(gtdUser));
        assertTrue(nft.hasMinted(fcfsUser));
        assertTrue(nft.hasMinted(airdrops[0]));
        assertTrue(nft.hasMinted(airdrops[1]));
    }

    // ===== Helpers =====

    function _allowlist(address account) internal {
        vm.prank(ownerWallet);
        nft.setGtdMerkleRoot(keccak256(abi.encodePacked(account)));
    }

    function _setGtdPhaseActive(bool state) internal {
        vm.prank(ownerWallet);
        nft.setGtdPhaseActive(state);
    }

    function _setFcfsPhaseActive(bool state) internal {
        vm.prank(ownerWallet);
        nft.setFcfsPhaseActive(state);
    }

    function _setMaxSupply(uint256 newMaxSupply) internal {
        vm.prank(ownerWallet);
        nft.setMaxSupply(newMaxSupply);
    }

    function _setPrice(uint256 newPrice) internal {
        vm.prank(ownerWallet);
        nft.setPrice(newPrice);
    }

    function _setPaused(bool state) internal {
        vm.prank(ownerWallet);
        nft.setPaused(state);
    }

    function _airdrop(address[] memory recipients) internal {
        vm.prank(ownerWallet);
        nft.airdropGTD(recipients);
    }

    function _singleLeafProof() internal pure returns (bytes32[] memory proof) {
        proof = new bytes32[](0);
    }
}

