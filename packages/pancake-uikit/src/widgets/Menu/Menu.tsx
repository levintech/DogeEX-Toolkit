import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import throttle from "lodash/throttle";
import Overlay from "../../components/Overlay/Overlay";
import Flex from "../../components/Box/Flex";
import { useMatchBreakpoints } from "../../hooks";
import Logo from "./components/Logo";
import Panel from "./components/Panel";
import { NavProps } from "./types";
import { MENU_HEIGHT, SIDEBAR_WIDTH_REDUCED, SIDEBAR_WIDTH_FULL } from "./config";
import Accordion from "./components/Accordion";
import { LinkLabel, LinkStatus, MenuEntry } from "./components/MenuEntry";
import MenuLink from "./components/MenuLink";
import { SvgProps } from "../../components/Svg";
import * as IconModule from "./icons";

const Icons = IconModule as unknown as { [key: string]: React.FC<SvgProps> };

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledNav = styled.nav<{ showMenu: boolean }>`
  position: fixed;
  top: ${({ showMenu }) => (showMenu ? 0 : `-${MENU_HEIGHT}px`)};
  left: 0;
  transition: top 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 8px;
  padding-right: 16px;
  width: 100%;
  height: ${MENU_HEIGHT}px;
  background-color: ${({ theme }) => theme.nav.background};
  z-index: 20;
  transform: translate3d(0, 0, 0);
`;

const BodyWrapper = styled.div`
  position: relative;
  display: flex;
`;

const Inner = styled.div<{ isPushed: boolean; showMenu: boolean }>`
  flex-grow: 1;
  margin-top: ${({ showMenu }) => (showMenu ? `${MENU_HEIGHT}px` : 0)};
  transition: margin-top 0.2s, margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate3d(0, 0, 0);
  max-width: 100%;

  // ${({ theme }) => theme.mediaQueries.nav} {
  //   margin-left: ${({ isPushed }) => `${isPushed ? SIDEBAR_WIDTH_FULL : SIDEBAR_WIDTH_REDUCED}px`};
  //   max-width: ${({ isPushed }) => `calc(100% - ${isPushed ? SIDEBAR_WIDTH_FULL : SIDEBAR_WIDTH_REDUCED}px)`};
  // }
  ${({ theme }) => theme.mediaQueries.nav} {
    margin-left: 0;
    max-width: 100%;
  }
`;

const MobileOnlyOverlay = styled(Overlay)`
  position: fixed;
  height: 100%;

  ${({ theme }) => theme.mediaQueries.nav} {
    display: none;
  }
`;

const Menu: React.FC<NavProps> = ({
  userMenu,
  globalMenu,
  isDark,
  toggleTheme,
  langs,
  setLang,
  currentLang,
  cakePriceUsd,
  links,
  children,
}) => {
  const { isMobile, isTablet } = useMatchBreakpoints();
  const isSmallerScreen = isMobile || isTablet;
  const [isPushed, setIsPushed] = useState(!isSmallerScreen);
  const [showMenu, setShowMenu] = useState(true);
  const refPrevOffset = useRef(window.pageYOffset);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      const isBottomOfPage = window.document.body.clientHeight === currentOffset + window.innerHeight;
      const isTopOfPage = currentOffset === 0;
      // Always show the menu when user reach the top
      if (isTopOfPage) {
        setShowMenu(true);
      }
      // Avoid triggering anything at the bottom because of layout shift
      else if (!isBottomOfPage) {
        if (currentOffset < refPrevOffset.current) {
          // Has scroll up
          setShowMenu(true);
        } else {
          // Has scroll down
          setShowMenu(false);
        }
      }
      refPrevOffset.current = currentOffset;
    };
    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll);
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, []);

  // Find the home link if provided
  const homeLink = links.find((link) => link.label === "Home");

  // Close the menu when a user clicks a link on mobile
  const handleClick = isMobile ? () => setIsPushed(false) : undefined;

  return (
    <Wrapper>
      <StyledNav showMenu={showMenu}>
        <Logo
          isMobile={isMobile}
          isPushed={isPushed}
          togglePush={() => setIsPushed((prevState: boolean) => !prevState)}
          isDark={isDark}
          href={homeLink?.href ?? "/"}
        />
        {
          links.map(entry => {
            const Icon = Icons[entry.icon];
            const iconElement = <Icon width="24px" mr="8px" />;
            const calloutClass = entry.calloutClass ? entry.calloutClass : undefined;
                
            if (entry.items) {
              const itemsMatchIndex = entry.items.findIndex((item) => item.href === location.pathname);
              const initialOpenState = entry.initialOpenState === true ? entry.initialOpenState : itemsMatchIndex >= 0;
    
              return (
                <Accordion
                  key={entry.label}
                  isPushed={isPushed}
                  pushNav={setIsPushed}
                  label={entry.label}
                  status={entry.status}
                  initialOpenState={initialOpenState}
                  className={calloutClass}
                  isActive={entry.items.some((item) => item.href === location.pathname)}
                >
                  {isPushed &&
                    entry.items.map((item) => (
                      <MenuEntry key={item.href} secondary isActive={item.href === location.pathname} onClick={handleClick}>
                        <MenuLink href={item.href}>
                          <LinkLabel isPushed={isPushed}>{item.label}</LinkLabel>
                          {item.status && (
                            <LinkStatus color={item.status.color} fontSize="14px">
                              {item.status.text}
                            </LinkStatus>
                          )}
                        </MenuLink>
                      </MenuEntry>
                    ))}
                </Accordion>
              );
            }
            return (
              <MenuEntry key={entry.label} isActive={entry.href === location.pathname} className={calloutClass}>
                <MenuLink href={entry.href} onClick={handleClick}>
                  <LinkLabel isPushed={isPushed}>{entry.label}</LinkLabel>
                  {entry.status && (
                    <LinkStatus color={entry.status.color} fontSize="14px">
                      {entry.status.text}
                    </LinkStatus>
                  )}
                </MenuLink>
              </MenuEntry>
            );
          })
        }
        <Flex>
          {globalMenu} {userMenu}
        </Flex>
      </StyledNav>
      <BodyWrapper>
        {/* <Panel
          isPushed={isPushed}
          isMobile={isSmallerScreen}
          showMenu={showMenu}
          isDark={isDark}
          toggleTheme={toggleTheme}
          langs={langs}
          setLang={setLang}
          currentLang={currentLang}
          cakePriceUsd={cakePriceUsd}
          pushNav={setIsPushed}
          links={links}
        /> */}
        <Inner isPushed={isPushed} showMenu={showMenu}>
          {children}
        </Inner>
        <MobileOnlyOverlay show={isPushed} onClick={() => setIsPushed(false)} role="presentation" />
      </BodyWrapper>
    </Wrapper>
  );
};

export default Menu;
