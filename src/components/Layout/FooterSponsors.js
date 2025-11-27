import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';

const FooterSponsors = () => {
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.sponsors.getAll({ featured: true });
        // API returns { success: true, sponsors: [...] }
        const list = res?.data?.sponsors || res?.data || [];
        setSponsors(list.filter(Boolean));
      } catch (err) {
        console.error('Failed to load sponsors for footer', err);
      }
    };
    fetch();
  }, []);

  if (!sponsors.length) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-200 mb-3">Corporate Sponsors</h4>
      <div className="flex items-center gap-4 flex-wrap">
        {sponsors.map((s) => (
          <a key={s._id} href={s.website || '#'} target="_blank" rel="noopener noreferrer" className="block bg-white/5 hover:bg-white/10 rounded p-2">
            <div className="flex flex-col items-center gap-2">
              {s.logoUrl && <img src={s.logoUrl} alt={s.name} className="h-10 object-contain" />}
              <div className="text-gray-300 text-sm px-3">{s.name}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FooterSponsors;
