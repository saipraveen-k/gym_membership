import MembershipCard from './MembershipCard.jsx';

/**
 * Responsive grid of membership cards.
 */
export default function MembershipGrid({ memberships, onApply }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {memberships.map((m, index) => (
        <MembershipCard
          key={m._id}
          membership={m}
          onApply={onApply}
          highlighted={index === 1}
        />
      ))}
    </div>
  );
}
