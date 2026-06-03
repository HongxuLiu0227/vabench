import React from 'react';
import { Card, CardMedia, CardContent, Typography, Avatar } from '@mui/material';

type ProfileCardProps = {
  name: string;
  role: string;
  avatarUrl: string;
  coverImageUrl: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  avatarUrl,
  coverImageUrl,
  stats,
}) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        height="140"
        image={coverImageUrl}
        alt="Cover image"
      />
      <CardContent sx={{ textAlign: 'center', position: 'relative' }}>
        <Avatar
          alt={name}
          src={avatarUrl}
          sx={{ 
            width: 80, 
            height: 80, 
            margin: '-50px auto 10px',
            border: '3px solid white'
          }}
        />
        <Typography gutterBottom variant="h5" component="div">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {role}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
          <div>
            <Typography variant="h6">{stats.posts}</Typography>
            <Typography variant="caption">Posts</Typography>
          </div>
          <div>
            <Typography variant="h6">{stats.followers}</Typography>
            <Typography variant="caption">Followers</Typography>
          </div>
          <div>
            <Typography variant="h6">{stats.following}</Typography>
            <Typography variant="caption">Following</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};