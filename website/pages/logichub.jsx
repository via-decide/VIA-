export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://logichub.viadecide.com',
      permanent: false
    }
  };
}

export default function LogicHub() {
  return <div>Redirecting...</div>;
}
