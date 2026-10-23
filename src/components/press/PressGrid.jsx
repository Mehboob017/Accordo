import PressCard from './PressCard';

export default function PressGrid({ items, onOpen }) {
  return (
    <div className="press-grid">
      {items.map((item, index) => (
        <PressCard key={item.uid} item={item} index={index} onClick={onOpen} />
      ))}
    </div>
  );
}
