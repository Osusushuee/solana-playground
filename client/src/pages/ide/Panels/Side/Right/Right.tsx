import {
  FC,
  Suspense,
  lazy,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import styled, { css } from "styled-components";
import { Resizable } from "re-resizable";

import TestSkeleton from "./Test/TestSkeleton";
import TutorialsSkeleton from "./Tutorials/TutorialsSkeleton";
import { Wormhole } from "../../../../../components/Loading";
import { TAB_HEIGHT } from "../../Main/MainView/Tabs";
import { Id } from "../../../../../constants";
import { Sidebar } from "../../../../../utils/pg";
import { PgThemeManager } from "../../../../../utils/pg/theme";
import { usePgRouter } from "./usePgRouter";

const Explorer = lazy(() => import("./Explorer"));
// const Search = lazy(() => import("./Search"));
const BuildDeploy = lazy(() => import("./BuildDeploy"));
const Test = lazy(() => import("./Test"));
const Tutorials = lazy(() => import("./Tutorials"));

interface DefaultRightProps {
  sidebarState: string;
}

interface RightProps<T = number> extends DefaultRightProps {
  width: T;
  setWidth: Dispatch<SetStateAction<T>>;
}

const Right: FC<RightProps> = ({ sidebarState, width, setWidth }) => {
  const { loading } = usePgRouter();

  const [height, setHeight] = useState({
    window:
      document.getElementById(Id.ROOT)?.getClientRects()[0]?.height ?? 979,
    bottom:
      document.getElementById(Id.BOTTOM)?.getClientRects()[0]?.height ?? 24,
  });

  // Resize the sidebar on window resize event
  useEffect(() => {
    const handleResize = () => {
      const windowHeight =
        document.getElementById(Id.ROOT)?.getClientRects()[0]?.height ?? 979;
      const bottomHeight =
        document.getElementById(Id.BOTTOM)?.getClientRects()[0]?.height ?? 24;

      setHeight({ window: windowHeight, bottom: bottomHeight });
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResizeStop = useCallback(
    (e, direction, ref, d) => {
      setWidth((w) => {
        const newWidth = w + d.width;
        if (newWidth < MIN_WIDTH) return 0;

        return newWidth;
      });
    },
    [setWidth]
  );

  return (
    <Resizable
      size={{ width, height: "100%" }}
      minHeight="100%"
      maxWidth={window.innerWidth * 0.75}
      enable={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={handleResizeStop}
    >
      <Wrapper
        id={Id.SIDE_RIGHT}
        windowHeight={height.window}
        bottomHeight={height.bottom}
      >
        <StyledTitle sidebarState={sidebarState} />
        <Suspense fallback={<RightLoading sidebarState={sidebarState} />}>
          {loading ? (
            <RightLoading sidebarState={sidebarState} />
          ) : (
            <Inside sidebarState={sidebarState} />
          )}
        </Suspense>
      </Wrapper>
    </Resizable>
  );
};

const Inside: FC<DefaultRightProps> = ({ sidebarState }) => {
  switch (sidebarState) {
    case Sidebar.EXPLORER:
      return <Explorer />;
    // case Sidebar.SEARCH:
    //   return <Search />;
    case Sidebar.BUILD_DEPLOY:
      return <BuildDeploy />;
    case Sidebar.TEST:
      return <Test />;
    case Sidebar.TUTORIALS:
      return <Tutorials />;
    default:
      return null;
  }
};

interface TitleProps extends DefaultRightProps {
  className?: string;
}

const Title: FC<TitleProps> = ({ sidebarState, className }) => (
  <div className={className}>
    <span>{sidebarState.toUpperCase()}</span>
  </div>
);

const RightLoading: FC<DefaultRightProps> = ({ sidebarState }) => {
  switch (sidebarState) {
    case Sidebar.TEST:
      return <TestSkeleton />;
    case Sidebar.TUTORIALS:
      return <TutorialsSkeleton />;
    default:
      return (
        <LoadingWrapper>
          <Wormhole />
        </LoadingWrapper>
      );
  }
};

const MIN_WIDTH = 180;

const Wrapper = styled.div<{ windowHeight?: number; bottomHeight?: number }>`
  ${({ theme, windowHeight, bottomHeight }) => css`
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: ${windowHeight && bottomHeight
      ? windowHeight - bottomHeight
      : 955}px;

    ${PgThemeManager.convertToCSS(theme.components.sidebar.right.default)};

    /* Scrollbar */
    /* Chromium */
    &::-webkit-scrollbar {
      width: 0.5rem;
      height: 0.5rem;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border: 0.25rem solid transparent;
      border-radius: ${theme.borderRadius};
      background-color: ${theme.scrollbar.thumb.color};
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: ${theme.scrollbar.thumb.hoverColor};
    }

    /* Firefox */
    & * {
      scrollbar-color: ${theme.scrollbar.thumb.color};
    }
  `}
`;

const StyledTitle = styled(Title)`
  ${({ theme }) => css`
    min-height: ${TAB_HEIGHT};
    display: flex;
    justify-content: center;
    align-items: center;

    ${PgThemeManager.convertToCSS(theme.components.sidebar.right.title)};
  `}
`;

const LoadingWrapper = styled.div`
  margin-top: 2rem;
`;

export default Right;
