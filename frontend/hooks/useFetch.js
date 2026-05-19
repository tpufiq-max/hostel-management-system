import { useEffect, useState } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;
    let mounted = true;
    setLoading(true);

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (mounted) setData(json);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [url]);

  return { data, loading };
}
