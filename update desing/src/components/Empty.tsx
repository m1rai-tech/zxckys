import React from 'react';
import { IconImage } from './Icons';

export const Empty: React.FC<{ title: string; text?: string; icon?: React.ReactNode; action?: React.ReactNode }> = ({ title, text, icon, action }) => (
  <div className="empty">
    {icon || <IconImage size={48}/>}
    <h3>{title}</h3>
    {text && <p>{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
