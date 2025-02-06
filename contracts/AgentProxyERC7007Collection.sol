// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC7007.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {IERC721, IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AgentProxyERC7007Collection is
    IERC7007,
    ERC2981Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    ERC721URIStorageUpgradeable
{
    /// @dev SafeERC20 library
    using SafeERC20 for IERC20;

    /// Int gap for upgradeable
    uint256[10] private __int_gap;
    /// Address gap for upgradeable
    address[10] private __address_gap;
    /// @dev Max supply
    uint256 public MAX_SUPPLY;
    /// @dev Next token id
    uint256 public NEXT_TOKEN_ID;
    /// @dev Per wallet mint limit
    uint256 public PER_WALLET_MINT_LIMIT;
    /// @dev Collection metadata uri
    string public COLLECTION_BASE_URI;
    /// @dev Agents Minter
    mapping(address => bool) public agents;
    /// @dev The wallet minted amount
    mapping(address => uint256) public minted;
    /// @dev Prevent duplicate mint
    mapping(bytes32 => bool) public receipts;
    /// @dev tokenId => AIGC data
    mapping(uint256 tokenId => AigcMetadata) public aigcDataOf;

    /* ---------------------------------- Error --------------------------------- */
    /// @dev Invalid price
    error InvalidPrice();
    /// @dev Invalid minter
    error InvalidMinter();
    /// @dev Invalid signature
    error InvalidSignature();
    /// @dev Minting not open
    error MintingNotOpen();
    /// @dev Nonce already used
    error NonceAlreadyUsed();
    /// @dev Receipt already used
    error ReceiptAlreadyUsed();
    /// @dev Max supply exceeded
    error MaxSupplyExceeded();
    /// @dev Max mint limit exceeded
    error MaxMintLimitExceeded();
    /// @dev Unauthorized caller
    error UnauthorizedCaller();
    /// @dev Royalty too high
    error RoyaltyTooHigh();

    /* ---------------------------------- Event --------------------------------- */
    /// @dev Collection base uri updated
    event CollectionBaseURIUpdated(string baseURI_);
    /// @dev Minter updated
    event MinterUpdated(address account_, bool isMinter_);
    /// @dev Pre wallet mint limit updated
    event PerWalletMintLimitUpdated(uint256 limit_);

    /* ---------------------------------- Struct ---------------------------------- */
    /// @dev ERC-7007 AIGC data
    struct AigcMetadata {
        bytes prompt;
        bytes aigcData;
        bytes proof;
    }

    /* -------------------------------- Modifier -------------------------------- */
    /// @dev Only self
    modifier onlySelf() {
        if (_msgSender() != address(this)) revert UnauthorizedCaller();
        _;
    }

    /// @dev Can mint
    modifier canMint(address to_) {
        if (0 < MAX_SUPPLY && MAX_SUPPLY <= NEXT_TOKEN_ID)
            revert MaxSupplyExceeded();
        if (0 < PER_WALLET_MINT_LIMIT && PER_WALLET_MINT_LIMIT <= minted[to_])
            revert MaxMintLimitExceeded();
        _;
    }

    /* ---------------------------------- Init ---------------------------------- */
    function initialize(
        string memory name_,
        string memory symbol_,
        address owner_,
        address delegateAgent_,
        uint256 maxSupply_,
        uint256 perWalletMintLimit_,
        string memory collectionBaseURI_
    ) external initializer {
        __ERC721_init(name_, symbol_);
        __Ownable_init(owner_);
        __ERC2981_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        agents[owner_] = true;
        agents[delegateAgent_] = true;
        MAX_SUPPLY = maxSupply_;
        PER_WALLET_MINT_LIMIT = perWalletMintLimit_;
        COLLECTION_BASE_URI = collectionBaseURI_;
    }

    /* ---------------------------------- Mint ---------------------------------- */
    /// @dev Mint nft by agent
    /// @param to_ receiver address
    /// @param uri_ nft metadata uri
    /// @param receipt_ transaction receipt (pay fee)
    function mint(
        address to_,
        string memory uri_,
        bytes32 receipt_,
        bytes memory prompt_,
        bytes memory aigcData_,
        bytes memory proof_
    ) external whenNotPaused canMint(to_) returns (uint256) {
        if (!agents[_msgSender()]) revert InvalidMinter();
        if (receipts[receipt_]) revert ReceiptAlreadyUsed();

        receipts[receipt_] = true;
        NEXT_TOKEN_ID++;
        minted[to_]++;
        _mint(to_, NEXT_TOKEN_ID);
        _setTokenURI(NEXT_TOKEN_ID, uri_);
        this.addAigcData(NEXT_TOKEN_ID, prompt_, aigcData_, proof_);

        return NEXT_TOKEN_ID;
    }

    /**
     * @dev Adds AI-generated content to a token
     * @param tokenId_ Token ID to update
     * @param prompt_ Generation prompt
     * @param aigcData_ Generated content
     * @param proof_ Verification proof
     */
    function addAigcData(
        uint256 tokenId_,
        bytes memory prompt_,
        bytes memory aigcData_,
        bytes memory proof_
    ) external onlySelf {
        aigcDataOf[tokenId_] = AigcMetadata({
            prompt: prompt_,
            aigcData: aigcData_,
            proof: proof_
        });
        emit AigcData(tokenId_, prompt_, aigcData_, proof_);
    }

    /**
     * @dev Verifies AI-generated content
     */
    function verify(
        bytes calldata /* prompt_ */,
        bytes calldata /* aigcData_ */,
        bytes calldata /* proof */
    ) external view override returns (bool) {
        return true;
    }

    /* ----------------------------- Tool Functions ----------------------------- */
    /// @dev collection base uri
    function _baseURI() internal view override returns (string memory) {
        return COLLECTION_BASE_URI;
    }

    /* ----------------------------- Pause Functions ---------------------------- */
    /// @dev pause
    function pause() external virtual onlyOwner {
        _pause();
    }
    /// @dev unpause
    function unpause() external virtual onlyOwner {
        _unpause();
    }

    /* ----------------------------- Config Functions ---------------------------- */
    /// @dev update collection uri
    /// @param baseURI_ base uri
    function updateBaseURI(string memory baseURI_) external onlyOwner {
        COLLECTION_BASE_URI = baseURI_;

        emit CollectionBaseURIUpdated(baseURI_);
    }
    /// @dev set royalty
    /// @param recipient_ recipient address
    /// @param value_ royalty value
    function setRoyalty(address recipient_, uint96 value_) external onlyOwner {
        if (1000 <= value_) revert RoyaltyTooHigh();
        _setDefaultRoyalty(recipient_, value_);
    }
    /// @dev update agent
    /// @param account_ account address
    /// @param isAgent_ is agent
    function updateAgent(address account_, bool isAgent_) external onlyOwner {
        agents[account_] = isAgent_;

        emit MinterUpdated(account_, isAgent_);
    }
    /// @dev update pre wallet mint limit
    /// @param limit_ limit
    function updatePerWalletMintLimit(uint256 limit_) external onlyOwner {
        PER_WALLET_MINT_LIMIT = limit_;

        emit PerWalletMintLimitUpdated(limit_);
    }
    /// @dev withdraw native token
    function withdrawETH(uint256 amount_) external onlyOwner nonReentrant {
        payable(owner()).transfer(amount_);
    }
    /// @dev withdraw erc20
    /// @param token_ token address
    /// @param amount_ amount
    function withdrawERC20(
        address token_,
        uint256 amount_
    ) external onlyOwner nonReentrant {
        IERC20(token_).safeTransfer(_msgSender(), amount_);
    }
    /* ---------------------------------- View ---------------------------------- */
    /// @dev total supply
    function totalSupply() external view returns (uint256) {
        return NEXT_TOKEN_ID;
    }
    /// @dev supports interface
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC2981Upgradeable, ERC721URIStorageUpgradeable, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
