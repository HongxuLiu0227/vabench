import { css } from '@emotion/react';

export const globalStyles = css`
  :root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --accent-color: #e74c3c;
    --text-color: #2c3e50;
    --text-light: #7f8c8d;
    --background-light: #f5f7fa;
    --border-color: #ecf0f1;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-light);
    padding: 0;
    margin: 0;
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.2s;
  }

  a:hover {
    color: var(--accent-color);
  }

  button {
    cursor: pointer;
    transition: all 0.2s;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }


  @media (max-width: 768px) {
    .container {
      padding: 0 0.5rem;
    }
  }
`;