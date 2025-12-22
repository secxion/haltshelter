import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';

const FooterSponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await apiService.sponsors.getAll({ featured: true });
        const list = res?.data?.sponsors || res?.data || [];
        setSponsors(list.filter(Boolean));
      } catch (err) {
        console.error('Failed to load sponsors for footer', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Loading skeleton component
  const SkeletonCard = () => (
    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!sponsors.length) return null;

  const SponsorCard = ({ sponsor }) => {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="h-16 bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors flex items-center justify-center w-full mb-2">
          {sponsor.logoUrl && (
            <img
              src={sponsor.logoUrl}
              alt={`${sponsor.name} logo`}
              className="h-12 w-auto object-contain"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
        </div>
        <p className="text-gray-600 text-xs font-medium line-clamp-2 leading-tight">
          {sponsor.name}
        </p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
      {sponsors.map((sponsor) => (
        <SponsorCard key={sponsor._id} sponsor={sponsor} />
      ))}
    </div>
  );
};

export default FooterSponsors;
