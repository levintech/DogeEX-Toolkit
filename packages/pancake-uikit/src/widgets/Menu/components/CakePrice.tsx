import React from "react";
import styled from "styled-components";
import { PancakeRoundIcon } from "../../../components/Svg";
import Text from "../../../components/Text/Text";
import Skeleton from "../../../components/Skeleton/Skeleton";
import Flex from "../../../components/Box/Flex";

interface Props {
  cakePriceUsd?: number;
}

const PriceLink = styled.a`
  display: flex;
  align-items: center;
  padding: 0 24px;
  svg {
    transition: transform 0.3s;
  }
  :hover {
    svg {
      transform: scale(1.2);
    }
  }
`;

const CakePrice: React.FC<Props> = ({ cakePriceUsd }) => {
  return cakePriceUsd ? (
      <Flex alignItems="center">
        <PriceLink
          href="https://pancakeswap.finance/swap?outputCurrency=0xba07eed3d09055d60caef2bdfca1c05792f2dfad"
          target="_blank"
        >
          <PancakeRoundIcon width="24px" mr="8px" />
          <Text color="textSubtle" bold>{`$${cakePriceUsd.toFixed(10)}`}</Text>
        </PriceLink>
      </Flex>
    ) : (
      <Flex alignItems="center">
        <Skeleton width={80} height={24} />
        </Flex>
    );
};

export default React.memo(CakePrice);
