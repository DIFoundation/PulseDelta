// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../MarketMulti.sol";
import "../wDAG.sol";
import "../FeeRouter.sol";
import "../IOracleAdapter.sol";

contract MultiMarketFactory {
    event MarketCreated(address market, uint256 marketId);

    address[] public allMarkets;
    mapping(uint256 => address) public marketOf;
    mapping(address => uint256) public idOf;

    uint256 public marketCount;

    error ZeroAddress();
    error InvalidTimeRange();

    function createMulti(
        address collateral,
        string memory question,
        string memory metadataURI,
        address creator,
        address oracleAdapter,
        address feeRouter,
        address tokenFactory,
        bytes32 marketKey,
        string[] memory outcomes,
        uint256 feeBps,
        uint256 startTime,
        uint256 endTime,
        uint256 resolutionDeadline
    ) external payable returns (address market) {
        if (startTime >= endTime) revert InvalidTimeRange();
        if (endTime >= resolutionDeadline) revert InvalidTimeRange();
        if (msg.value == 0) revert("Must send DAG for liquidity");

        // Convert native DAG to wDAG (mints to this contract)
        wDAG(payable(collateral)).deposit{value: msg.value}();

        uint256[3] memory times = [startTime, endTime, resolutionDeadline];

        market = address(
            new MarketMulti(
                collateral,
                question,
                metadataURI,
                creator,
                marketCount,
                oracleAdapter,
                feeRouter,
                tokenFactory,
                marketKey,
                outcomes,
                feeBps,
                msg.value, // Use the DAG amount as liquidity
                times
            )
        );

        // Transfer wDAG to the market for initial liquidity
        wDAG(payable(collateral)).transfer(market, msg.value);

        // Auto-configure the market
        FeeRouter(feeRouter).setCreator(market, creator);
        IOracleAdapter(oracleAdapter).setMarketAddress(marketCount, market);

        _register(market);
    }

    function _register(address market) internal {
        marketCount++;
        allMarkets.push(market);
        marketOf[marketCount] = market;
        idOf[market] = marketCount;
        emit MarketCreated(market, marketCount);
    }

    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    // Frontend helper functions
    function getMarketsByStatus(
        uint8 status
    ) external view returns (address[] memory) {
        address[] memory filteredMarkets = new address[](allMarkets.length);
        uint256 count = 0;

        for (uint256 i = 0; i < allMarkets.length; i++) {
            try MarketMulti(allMarkets[i]).state() returns (
                MarketMulti.State marketState
            ) {
                if (uint8(marketState) == status) {
                    filteredMarkets[count] = allMarkets[i];
                    count++;
                }
            } catch {
                continue;
            }
        }

        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = filteredMarkets[i];
        }

        return result;
    }

    function getMarketCount() external view returns (uint256) {
        return allMarkets.length;
    }
}
