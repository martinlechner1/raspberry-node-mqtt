import {
  failure,
  initial,
  pending,
  RemoteData,
  success,
} from '@devexperts/remote-data-ts';
import { useEffect, useState } from 'react';

export const useData = () => {
  const [data, setData] = useState<RemoteData<Error, Data[]>>(initial);
  useEffect(() => {
    setData(pending);
    const fetchData = async () => {
      await fetch('/api/data')
        .then(res =>
          res.json().then(json => {
            setData(
              success(
                Object.keys(json).map(k => ({
                  ...json[k],
                  id: k,
                }))
              )
            );
          })
        )
        .catch(err => failure(err));
    };
    setInterval(() => fetchData(), 1000);
    fetchData();
  }, []);
  return { data };
};
