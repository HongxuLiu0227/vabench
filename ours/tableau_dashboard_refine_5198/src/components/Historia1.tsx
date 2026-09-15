import React, { useState } from 'react';
import type { TweetData } from '../types';
import { TiposDeTweetsObjetoEstudio } from './worksheets/TiposDeTweetsObjetoEstudio';
import { EvolucionTipoTweetsView } from './worksheetViews/EvolucionTipoTweetsView';
import { TweetsXTiempoView } from './worksheetViews/TweetsXTiempoView';
import { UsersXFollowersView } from './worksheetViews/UsersXFollowersView';
import { TweetsFavoritosView } from './worksheetViews/TweetsFavoritosView';
import { RetweeteadosView } from './worksheetViews/RetweeteadosView';
import { UsuariosConMasTweets } from './worksheets/UsuariosConMasTweets';

interface Historia1Props {
  data: TweetData[];
}

type StoryPoint =
  | 'sentimiento-objeto'
  | 'evolucion-tipo'
  | 'proporcion-tiempo'
  | 'usuarios-seguidores'
  | 'tweets-favoritos'
  | 'tweets-retweeteados'
  | 'usuarios-activos';

const STORY_POINTS = [
  { id: 'sentimiento-objeto' as StoryPoint, title: '% Sentimiento x Objeto de estudio' },
  { id: 'evolucion-tipo' as StoryPoint, title: 'Evolución de tipo de Tweet sobre tiempo' },
  { id: 'proporcion-tiempo' as StoryPoint, title: 'Proporción de tipo de Tweets en el tiempo' },
  { id: 'usuarios-seguidores' as StoryPoint, title: 'Usuarios con mayor cantidad de seguidores' },
  { id: 'tweets-favoritos' as StoryPoint, title: 'Tweets más Favoriteados' },
  { id: 'tweets-retweeteados' as StoryPoint, title: 'Tweets más retweeteados' },
  { id: 'usuarios-activos' as StoryPoint, title: 'Usuarios más activos' },
];

export function Historia1({ data }: Historia1Props) {
  const [currentStoryPoint, setCurrentStoryPoint] = useState<StoryPoint>('sentimiento-objeto');

  // Filter data for first story point (Lavagna, positive)
  const filteredForSentimiento = React.useMemo(() => {
    return data.filter(d => d.flag === 'Lavagna' && d.label === 'positive');
  }, [data]);

  const renderStoryPoint = () => {
    switch (currentStoryPoint) {
      case 'sentimiento-objeto':
        return <TiposDeTweetsObjetoEstudio data={filteredForSentimiento} width={980} height={600} />;
      case 'evolucion-tipo':
        return <EvolucionTipoTweetsView data={data} width={980} height={600} />;
      case 'proporcion-tiempo':
        return <TweetsXTiempoView data={data} width={980} height={600} />;
      case 'usuarios-seguidores':
        return <UsersXFollowersView data={data} width={980} height={600} />;
      case 'tweets-favoritos':
        return <TweetsFavoritosView data={data} width={980} height={600} />;
      case 'tweets-retweeteados':
        return <RetweeteadosView data={data} width={980} height={600} />;
      case 'usuarios-activos':
        return <UsuariosConMasTweets data={data} width={980} height={600} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      width: '1016px',
      height: '964px',
      padding: '8px',
      boxSizing: 'border-box',
      backgroundColor: '#fff'
    }}>
      {/* Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #ddd'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          Macri - Cristina - Lavagna
        </h1>
      </div>

      {/* Story Point Navigation */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '24px',
        justifyContent: 'center'
      }}>
        {STORY_POINTS.map(point => (
          <button
            key={point.id}
            onClick={() => setCurrentStoryPoint(point.id)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              backgroundColor: currentStoryPoint === point.id ? '#4e79a7' : '#f0f0f0',
              color: currentStoryPoint === point.id ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentStoryPoint !== point.id) {
                e.currentTarget.style.backgroundColor = '#e0e0e0';
              }
            }}
            onMouseLeave={(e) => {
              if (currentStoryPoint !== point.id) {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }
            }}
          >
            {point.title}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {renderStoryPoint()}
      </div>
    </div>
  );
}
