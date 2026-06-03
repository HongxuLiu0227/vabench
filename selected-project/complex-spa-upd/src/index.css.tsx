import { Global, css } from '@emotion/react';

const globalReset = css`
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6, p {
    margin: 0;
  }

  button, input, select, textarea {
    font-family: inherit;
  }
`;

export const GlobalStyles = () => <Global styles={globalReset} />;