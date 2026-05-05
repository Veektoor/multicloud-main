import { useEffect, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  const client = useStreamVideoClient();

  useEffect(() => {
    const callId = Array.isArray(id) ? id[0] : id;

    if (!client || !callId) {
      setCall(undefined);
      setIsCallLoading(false);
      return;
    }

    const loadCall = async () => {
      setIsCallLoading(true);

      try {
        // https://getstream.io/video/docs/react/guides/querying-calls/#filters
        const { calls } = await client.queryCalls({ filter_conditions: { id: callId } });

        setCall(calls[0]);
      } catch (error) {
        console.error(error);
        setCall(undefined);
      } finally {
        setIsCallLoading(false);
      }
    };

    loadCall().catch((error) => {
      console.error(error);
      setCall(undefined);
      setIsCallLoading(false);
    });
  }, [client, id]);

  return { call, isCallLoading };
};
