import dynamic from 'next/dynamic';

const PersonalRoomPage = dynamic(() => import('@/components/PersonalRoomPage'), {
  ssr: false,
});

export default function PersonalRoom() {
  return <PersonalRoomPage />;
}
