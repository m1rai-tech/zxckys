import { IconImage } from './Icons';

export function Empty({ title, text, icon, action }) {
  return (
    <div className="empty">
      {icon || <IconImage size={48}/>}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default Empty;
