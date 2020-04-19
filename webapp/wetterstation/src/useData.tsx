import { useState, useEffect } from 'react';
import {
  pending,
  failure,
  success,
  RemoteData,
  initial,
} from '@devexperts/remote-data-ts';

export const useData = () => {
  const [data, setData] = useState<RemoteData<Error, Data[]>>(initial);
  useEffect(() => {
    setData(pending);
    const fetchData = async () => {
      await fetch('http://pinas:3000/api/data')
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
