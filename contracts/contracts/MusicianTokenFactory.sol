// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MusicianToken.sol";

/**
 * @title MusicianTokenFactory
 * @dev ERC20 토큰을 EIP-1167 Minimal Proxy 패턴으로 배포하는 Factory
 * 가스 효율성: 전통적 배포 대비 70-90% 비용 절감
 */
contract MusicianTokenFactory is Ownable {
    using Clones for address;

    /// @dev MusicianToken 구현 컨트랙트 주소
    address public implementation;

    /// @dev (뮤지션 주소 + 토큰 이름) → 토큰 컨트랙트 주소 매핑
    /// key: keccak256(abi.encodePacked(musicianAddress, tokenName))
    mapping(bytes32 => address) public tokensByNameAndArtist;

    /// @dev 뮤지션 주소 → 토큰 컨트랙트 주소 배열 (하나의 아티스트가 여러 토큰 가능)
    mapping(address => address[]) public musicianTokens;

    /// @dev 배포된 토큰 주소 목록
    address[] public deployedTokens;

    /// @dev 토큰 컨트랙트 주소 → 배포 여부 확인
    mapping(address => bool) public isFactoryToken;

    /// @dev 토큰 배포 이벤트
    event TokenDeployed(
        address indexed musicianAddress,
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 timestamp
    );

    /// @dev Implementation 업데이트 이벤트
    event ImplementationUpdated(address indexed newImplementation);

    /**
     * @dev Factory 초기화
     * @param _implementation MusicianToken 구현 컨트랙트 주소
     */
    constructor(address _implementation) Ownable(msg.sender) {
        require(_implementation != address(0), "Invalid implementation address");
        implementation = _implementation;
        emit ImplementationUpdated(_implementation);
    }

    /**
     * @dev Implementation 컨트랙트 업데이트 (Owner만 호출 가능)
     * @param _newImplementation 새로운 구현 컨트랙트 주소
     */
    function setImplementation(address _newImplementation) external onlyOwner {
        require(_newImplementation != address(0), "Invalid implementation address");
        implementation = _newImplementation;
        emit ImplementationUpdated(_newImplementation);
    }

    /**
     * @dev 뮤지션을 위한 새로운 토큰 배포
     * @param name 토큰 이름 (예: "민수 Token")
     * @param symbol 토큰 심볼 (예: "MS")
     * @param musicianAddress 뮤지션 지갑 주소
     * @return tokenAddress 배포된 토큰 컨트랙트 주소
     *
     * 동일 토큰 판단 기준: 뮤지션 주소 + 토큰 이름 조합
     * 같은 뮤지션이라도 다른 이름의 토큰은 여러 개 배포 가능
     */
    function deployToken(
        string memory name,
        string memory symbol,
        address musicianAddress
    ) external returns (address) {
        require(musicianAddress != address(0), "Invalid musician address");

        // 동일성 확인: 뮤지션 주소 + 토큰 이름
        bytes32 tokenKey = keccak256(abi.encodePacked(musicianAddress, name));
        require(
            tokensByNameAndArtist[tokenKey] == address(0),
            "Token with this name already deployed for this musician"
        );

        // EIP-1167 Minimal Proxy 패턴으로 클론 배포
        address payable clone = payable(implementation.clone());

        // 배포된 토큰 초기화
        MusicianToken(clone).initialize(name, symbol, musicianAddress);

        // 매핑에 저장
        tokensByNameAndArtist[tokenKey] = clone;
        musicianTokens[musicianAddress].push(clone);
        deployedTokens.push(clone);
        isFactoryToken[clone] = true;

        emit TokenDeployed(musicianAddress, clone, name, symbol, block.timestamp);

        return clone;
    }

    /**
     * @dev 뮤지션의 특정 이름 토큰 주소 조회
     * @param musicianAddress 뮤지션 지갑 주소
     * @param tokenName 토큰 이름
     * @return 토큰 컨트랙트 주소 (배포되지 않았으면 0x0)
     */
    function getMusicianToken(address musicianAddress, string memory tokenName)
        external
        view
        returns (address)
    {
        bytes32 tokenKey = keccak256(abi.encodePacked(musicianAddress, tokenName));
        return tokensByNameAndArtist[tokenKey];
    }

    /**
     * @dev 뮤지션이 배포한 모든 토큰 주소 목록 조회
     * @param musicianAddress 뮤지션 지갑 주소
     * @return 토큰 컨트랙트 주소 배열
     */
    function getMusicianTokens(address musicianAddress)
        external
        view
        returns (address[] memory)
    {
        return musicianTokens[musicianAddress];
    }

    /**
     * @dev 뮤지션이 배포한 토큰 개수 조회
     * @param musicianAddress 뮤지션 지갑 주소
     * @return 토큰 개수
     */
    function getMusicianTokenCount(address musicianAddress)
        external
        view
        returns (uint256)
    {
        return musicianTokens[musicianAddress].length;
    }

    /**
     * @dev 배포된 토큰이 이 Factory에서 생성된 것인지 확인
     * @param tokenAddress 토큰 컨트랙트 주소
     * @return true if deployed by this factory
     */
    function isTokenDeployedByFactory(address tokenAddress)
        external
        view
        returns (bool)
    {
        return isFactoryToken[tokenAddress];
    }

    /**
     * @dev Implementation 컨트랙트 주소 조회
     * @return 구현 컨트랙트 주소
     */
    function getImplementation() external view returns (address) {
        return implementation;
    }

    /**
     * @dev 배포된 토큰 수 조회
     * @return 배포된 토큰 개수
     */
    function getDeployedTokenCount() external view returns (uint256) {
        return deployedTokens.length;
    }

    /**
     * @dev 배포된 토큰 목록 조회 (페이지네이션)
     * @param offset 시작 인덱스
     * @param limit 최대 개수
     * @return 토큰 주소 배열
     */
    function getDeployedTokens(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory)
    {
        require(offset < deployedTokens.length, "Offset out of bounds");

        uint256 end = offset + limit;
        if (end > deployedTokens.length) {
            end = deployedTokens.length;
        }

        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = deployedTokens[i];
        }

        return result;
    }
}
