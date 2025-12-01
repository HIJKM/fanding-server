// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MusicianToken
 * @dev ERC20 토큰 컨트랙트 (각 뮤지션마다 하나씩 배포)
 * 초기 공급량: 10,000 토큰 (모두 뮤지션에게 할당)
 */
contract MusicianToken is ERC20 {
    /// @dev 뮤지션 주소 (토큰 초기 할당 대상)
    address public musicianAddress;

    /// @dev 초기화 여부
    bool private initialized;

    /// @dev 뮤지션 주소 변경 이벤트
    event MusicianAddressUpdated(address indexed oldAddress, address indexed newAddress);

    /// @dev 토큰 초기화 이벤트
    event TokenInitialized(
        address indexed musicianAddress,
        string name,
        string symbol,
        uint256 musicianAllocation
    );

    /// @dev 토큰 구매 이벤트
    event TokenPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 totalCost,
        uint256 timestamp
    );

    /**
     * @dev 프록시 패턴을 위한 빈 생성자
     * 초기화는 initialize() 함수를 통해 진행
     */
    constructor() ERC20("", "") {}

    /**
     * @dev 토큰 초기화 (Factory에서만 호출 가능)
     * @param name_ 토큰 이름 (예: "민수 Token")
     * @param symbol_ 토큰 심볼 (예: "MS")
     * @param musicianAddress_ 뮤지션 지갑 주소
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address musicianAddress_
    ) external {
        require(!initialized, "Token already initialized");
        require(musicianAddress_ != address(0), "Invalid musician address");

        initialized = true;
        musicianAddress = musicianAddress_;

        // 초기 공급량: 10,000 토큰 (18 decimals = 10,000 * 10^18)
        // 모든 토큰을 뮤지션에게 할당
        uint256 totalSupply = 10_000 * 10 ** 18;

        // 뮤지션에게 모든 토큰 배포
        _mint(musicianAddress_, totalSupply);

        emit TokenInitialized(musicianAddress_, name_, symbol_, totalSupply);
    }

    /**
     * @dev 토큰이 초기화되었는지 확인
     * @return true if initialized
     */
    function isInitialized() external view returns (bool) {
        return initialized;
    }

    /**
     * @dev 뮤지션 주소 조회
     * @return 뮤지션 지갑 주소
     */
    function getMusicianAddress() external view returns (address) {
        return musicianAddress;
    }

    /**
     * @dev 토큰 메타데이터 조회
     * @return name 토큰 이름
     * @return symbol 토큰 심볼
     * @return decimals 소수 자릿수
     * @return totalSupply 총 공급량
     */
    function getTokenMetadata()
        external
        view
        returns (
            string memory,
            string memory,
            uint8,
            uint256
        )
    {
        return (name(), symbol(), decimals(), totalSupply());
    }

    /**
     * @dev ERC20 표준: decimals 반환
     * @return 18 (표준 ERC20 decimals)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    /**
     * @dev 토큰 가격 조회 (Wei 단위, 1 token = 0.01 MATIC)
     * @return 토큰당 가격 (Wei)
     */
    function getPrice() external pure returns (uint256) {
        // 1 token = 0.01 MATIC = 10^16 Wei
        return 10 ** 16;
    }

    /**
     * @dev T046: 뮤지션 토큰 구매 (팬이 호출)
     * @param amount 구매할 토큰 개수
     * @return success 구매 성공 여부
     */
    function buyToken(uint256 amount) external payable returns (bool) {
        require(amount > 0, "Amount must be greater than 0");

        // 가격 계산 (토큰당 0.01 MATIC)
        uint256 price = 10 ** 16;
        uint256 totalCost = price * amount;

        // 지불액 확인
        require(msg.value >= totalCost, "Insufficient payment");

        // 뮤지션의 잔액에서 토큰 전송
        uint256 musicianBalance = balanceOf(musicianAddress);
        require(musicianBalance >= amount * (10 ** 18), "Insufficient token supply");

        // 토큰 전송 (musician → buyer)
        _transfer(musicianAddress, msg.sender, amount * (10 ** 18));

        // 초과 지불액 환불
        if (msg.value > totalCost) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalCost}("");
            require(refundSuccess, "Refund failed");
        }

        emit TokenPurchased(msg.sender, amount, totalCost, block.timestamp);
        return true;
    }

    /**
     * @dev 컨트랙트 주소로 직접 전송된 MATIC 수령
     */
    receive() external payable {}
}
