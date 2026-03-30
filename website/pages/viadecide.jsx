export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://engine.viadecide.com',
      permanent: false
    }
  };
}

export default function ViaDecideEngine() {
  return <div>Redirecting...</div>;
}
