import { styled } from '@mui/system';

export const AppContainer = styled('div')({
  textAlign: 'center',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f5f5',
});

export const MainContent = styled('main')({
  flex: 1,
  padding: '2rem',
});

export const Footer = styled('footer')({
  padding: '1rem',
  backgroundColor: '#1976d2',
  color: 'white',
});