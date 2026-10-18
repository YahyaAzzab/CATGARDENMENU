import type { FamilyId } from '../data/families';
import breakfast from '../assets/families/breakfast.jpg';
import hotDrinks from '../assets/families/hot-drinks.jpg';
import coldDrinks from '../assets/families/cold-drinks.jpg';
import sweet from '../assets/families/sweet.jpg';
import savory from '../assets/families/savory.jpg';

const art: Record<FamilyId, { bg: string; image: string }> = {
  breakfast: {
    bg: 'from-peach-muted via-[#F8D9BE] to-cream',
    image: breakfast,
  },
  'hot-drinks': {
    bg: 'from-sage-muted via-[#C5D8C2] to-cream',
    image: hotDrinks,
  },
  'cold-drinks': {
    bg: 'from-[#D7E8E4] via-sage-muted/70 to-cream',
    image: coldDrinks,
  },
  sweet: {
    bg: 'from-rose-light via-[#F6D4D1] to-cream',
    image: sweet,
  },
  savory: {
    bg: 'from-peach-muted/80 via-[#EED4B8] to-cream-dark',
    image: savory,
  },
};

export function FamilyIllustration({
  familyId,
  variant = 'card',
  className = '',
  priority = false,
}: {
  familyId: FamilyId;
  variant?: 'card' | 'header';
  className?: string;
  priority?: boolean;
}) {
  const conf = art[familyId];
  const eager = priority || variant === 'header';
  const frame =
    variant === 'header'
      ? 'absolute inset-0 h-full w-full object-cover object-[72%_center]'
      : 'absolute inset-y-0 right-0 h-full w-[58%] object-cover object-center';
  const wash =
    variant === 'header'
      ? 'bg-gradient-to-r from-[#FDF6EC] from-[6%] via-[#FDF6EC]/75 via-[34%] to-transparent to-[68%]'
      : 'bg-gradient-to-r from-[#FDF6EC] from-[28%] via-[#FDF6EC]/92 via-[48%] to-transparent to-[70%]';

  return (
    <div
      className={`family-visual absolute inset-0 bg-gradient-to-br ${conf.bg} ${className}`}
      aria-hidden="true"
    >
      <img
        src={conf.image}
        alt=""
        decoding="async"
        fetchPriority={eager ? 'high' : 'low'}
        loading={eager ? 'eager' : 'lazy'}
        className={frame}
      />
      <div className={`absolute inset-0 ${wash}`} />
    </div>
  );
}
