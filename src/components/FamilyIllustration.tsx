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
    bg: 'from-peach-muted/80 via-[#EED4B8] to-cream',
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
  const isHeader = variant === 'header';
  /* Les visuels produits sont cadrés plein carré : les rogner coupait la pièce
     en deux. On les affiche donc entiers, dans un fond de la même couleur que
     leur propre fond, pour qu’ils se fondent dans la carte. */
  const frame = isHeader
    ? 'absolute inset-y-0 right-0 h-full aspect-square object-contain [mask-image:linear-gradient(to_right,transparent,black_24%)]'
    : 'absolute inset-y-0 right-0 h-full w-[58%] bg-cream object-contain p-[3px]';
  /* Voile qui prolonge le fond des illustrations vers la gauche, pour que le
     bord de l’image ne se voie pas et que le texte reste sur du clair. */
  const wash = isHeader
    ? null
    : 'bg-gradient-to-r from-[#FDF6EC] from-[6%] via-[#FDF6EC] via-[44%] to-transparent to-[62%]';

  return (
    <div
      className={`family-visual absolute inset-0 ${isHeader ? 'bg-gradient-to-r' : 'bg-gradient-to-br'} ${conf.bg} ${className}`}
      aria-hidden="true"
    >
      {isHeader && (
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-cream from-[26%] via-cream/70 to-transparent" />
      )}
      <img
        src={conf.image}
        alt=""
        decoding="async"
        fetchPriority={eager ? 'high' : 'low'}
        loading={eager ? 'eager' : 'lazy'}
        className={frame}
      />
      {wash && <div className={`absolute inset-0 ${wash}`} />}
    </div>
  );
}
