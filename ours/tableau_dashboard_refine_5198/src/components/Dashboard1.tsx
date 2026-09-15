import type { TweetData } from '../types';
import { UsuariosConMasTweets } from './worksheets/UsuariosConMasTweets';
import { TiposDeTweetsObjetoEstudio } from './worksheets/TiposDeTweetsObjetoEstudio';
import { Legend } from './Legend';

interface Dashboard1Props {
  data: TweetData[];
}

export function Dashboard1({ data }: Dashboard1Props) {
  return (
    <div style={{
      width: '1000px',
      height: '800px',
      padding: '8px',
      boxSizing: 'border-box',
      backgroundColor: '#fff'
    }}>
      {/* Top section: Usuarios con + Tweets + Legend */}
      <div style={{
        display: 'flex',
        height: '49%',
        marginBottom: '1%'
      }}>
        <div style={{ width: '82%', marginRight: '1%' }}>
          <UsuariosConMasTweets data={data} width={820} height={380} />
        </div>
        <div style={{ width: '16%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <Legend title="Label" width={140} />
        </div>
      </div>

      {/* Bottom section: Tipos de Tweets x Objeto de Estudio */}
      <div style={{ height: '49%' }}>
        <TiposDeTweetsObjetoEstudio data={data} width={980} height={380} />
      </div>
    </div>
  );
}
